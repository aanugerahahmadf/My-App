<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderPaymentStatus;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Package;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Get user's orders with pagination
     */
    public function getOrders(Request $request)
    {
        try {
            $query = Order::where('user_id', Auth::id())
                ->with([
                    'package' => function ($q): void { $q->with('weddingFlowersDecorasi:id,name,rating'); },
                    'product.category',
                ]);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween('booking_date', [$request->from_date, $request->to_date]);
            }

            $orders = $query->latest()->paginate($request->get('per_page', 10));
            $products = $orders->items();

            $data = collect($products)->map(function (Order $order) {
                $pkg = $order->package;
                $wfd = $pkg?->weddingFlowersDecorasi;

                return [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'package_id' => $order->package_id,
                    'product_id' => $order->product_id,
                    'title' => $pkg?->name ?? $order->product?->name ?? __('Pesanan'),
                    'order_number' => $order->order_number,
                    'total_price' => (float) $order->total_price,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status ?? 'unpaid',
                    'booking_date' => $order->booking_date?->format('Y-m-d'),
                    'event_date' => $order->booking_date?->format('Y-m-d'),
                    'notes' => $order->notes,
                    'resource_type' => $order->package_id ? 'package' : 'product',
                    'item' => $pkg ? [
                        'id' => $pkg->id,
                        'name' => $pkg->name,
                        'price' => (float) $pkg->price,
                        'discount_price' => (float) ($pkg->discount_price ?? 0),
                        'wedding_flowers_decorasi_id' => $pkg->wedding_flowers_decorasi_id,
                        'wedding_flowers_decorasi' => $wfd ? ['id' => $wfd->id, 'name' => $wfd->name, 'rating' => $wfd->rating] : null,
                        'image_url' => $pkg->image_url ?? null,
                    ] : ($order->product ? [
                        'id' => $order->product->id,
                        'name' => $order->product->name,
                        'price' => (float) $order->product->price,
                        'discount_price' => (float) ($order->product->discount_price ?? 0),
                        'category' => $order->product->category?->name,
                        'image_url' => $order->product->image_url ?? null,
                    ] : null),
                    'package' => $pkg ? [
                        'id' => $pkg->id,
                        'name' => $pkg->name,
                        'price' => (float) $pkg->price,
                        'wedding_flowers_decorasi_id' => $pkg->wedding_flowers_decorasi_id,
                        'wedding_flowers_decorasi' => $wfd ? ['id' => $wfd->id, 'name' => $wfd->name, 'rating' => $wfd->rating] : null,
                    ] : null,
                    'product' => $order->product ? [
                        'id' => $order->product->id,
                        'name' => $order->product->name,
                        'price' => (float) $order->product->price,
                        'discount_price' => (float) ($order->product->discount_price ?? 0),
                        'category' => $order->product->category?->name,
                    ] : null,
                ];
            })->all();

            return response()->json([
                'status' => 'success',
                'data' => $data,
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                    'has_more_pages' => $orders->hasMorePages(),
                ],
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'status' => 'error',
                'message' => __('Gagal memuat pesanan'),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Create a new order
     */
    public function createOrder(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'package_id' => 'nullable|exists:packages,id',
                'product_id' => 'nullable|exists:products,id',
                'event_date' => 'required|date|after_or_equal:today',
                'location_address' => 'required|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'special_requests' => 'nullable|string|max:1000',
            ]);

            if (! filled($validatedData['package_id'] ?? null) && ! filled($validatedData['product_id'] ?? null)) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Pilih paket atau produk terlebih dahulu'),
                ], 422);
            }

            $package = null;
            $product = null;
            if (filled($validatedData['package_id'] ?? null)) {
                $package = Package::findOrFail($validatedData['package_id']);
            } else {
                $product = Product::findOrFail($validatedData['product_id']);
            }

            // Check if user already has an order for this date
            $existingOrder = Order::where('user_id', Auth::id())
                ->where('booking_date', $validatedData['event_date'])
                ->whereIn('status', [OrderStatus::PENDING, OrderStatus::CONFIRMED, OrderStatus::PREPARING])
                ->first(['*']);

            if ($existingOrder) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Anda sudah memiliki pesanan yang dijadwalkan pada tanggal ini'),
                ], 409);
            }

            // Calculate prices
            $basePrice = (float) ($package?->price ?? $product?->price ?? 0);
            $discountAmount = 0;
            $voucherId = null;

            if ($request->filled('voucher_code')) {
                $voucher = Voucher::where('code', $request->voucher_code)
                    ->where('is_active', true)
                    ->where(function ($q): void {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })->first(['*']);

                if ($voucher && $basePrice >= $voucher->min_purchase) {
                    if ($voucher->discount_type === 'fixed') {
                        $discountAmount = $voucher->discount_amount;
                    } else {
                        $discountAmount = $basePrice * ($voucher->discount_amount / 100);
                    }
                    $voucherId = $voucher->id;
                }
            }

            $subtotalPrice = max(0, $basePrice - $discountAmount);
            $taxAmount = $subtotalPrice * 0.11; // PPN 11%
            $totalPrice = $subtotalPrice + $taxAmount;

            // Create the order (payment_status enum: unpaid|partial|paid|refunded)
            $order = Order::create([
                'user_id' => Auth::id(),
                'package_id' => $package?->id,
                'product_id' => $product?->id,
                'order_number' => 'ORD-'.strtoupper(Str::random(10)),
                'total_price' => $totalPrice,
                'status' => OrderStatus::PENDING,
                'payment_status' => OrderPaymentStatus::UNPAID,
                'booking_date' => $validatedData['event_date'],
                'notes' => ($validatedData['notes'] ?? '').' | Location: '.$validatedData['location_address'].($voucherId ? " | Voucher: {$request->voucher_code}" : ''),
            ]);

            // Load relationships for the response
            $order->load(['package.media', 'product.media']);

            return response()->json([
                'status' => 'success',
                'message' => __('Pesanan berhasil dibuat'),
                'data' => $order,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Validasi gagal'),
                'errors' => $e->errors(),
            ], 422);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Paket tidak ditemukan'),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Gagal membuat pesanan'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process payment for an order
     */
    public function processPayment($id, Request $request)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail(['*']);

            // Validate that order can proceed to payment
            if ($order->status === OrderStatus::CANCELLED) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Tidak dapat memproses pembayaran untuk pesanan yang dibatalkan'),
                ], 400);
            }

            if ($order->payment_status === OrderPaymentStatus::PAID) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Pesanan sudah dibayar'),
                ], 400);
            }

            // --- Create Transaction for Midtrans ---
            $reference = 'TRX-'.time().'-'.Str::random(4);

            $transaction = Transaction::create([
                'user_id' => Auth::id(),
                'order_id' => $order->id,
                'type' => 'order',
                'reference_number' => $reference,
                'amount' => $order->total_price,
                'admin_fee' => 0,
                'total_amount' => $order->total_price,
                'status' => 'pending',
                'payment_gateway' => 'midtrans',
                'notes' => __('Pembayaran Pesanan #').$order->order_number,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => __('Pembayaran berhasil diinisiasi'),
                'data' => [
                    'transaction' => $transaction->fresh(),
                    'snap_token' => $transaction->snap_token,
                    'payment_url' => $transaction->payment_url,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Pesanan tidak ditemukan atau bukan milik Anda'),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Track a specific order by order number
     */
    public function trackOrder($orderNumber)
    {
        try {
            $order = Order::where('order_number', $orderNumber)
                ->where('user_id', Auth::id())
                ->with(['package.media', 'product.media'])
                ->firstOrFail(['*']);

            return response()->json([
                'status' => 'success',
                'data' => $order,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Pesanan tidak ditemukan atau bukan milik Anda'),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Gagal melacak pesanan'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order details by ID
     */
    public function show($id)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->with(['package.media', 'product.media'])
                ->firstOrFail(['*']);

            return response()->json([
                'status' => 'success',
                'data' => $order,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Pesanan tidak ditemukan atau bukan milik Anda'),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Gagal mengambil detail pesanan'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an order
     */
    public function cancelOrder($id)
    {
        try {
            $order = Order::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail(['*']);

            // Check if order can be cancelled
            if (in_array($order->status, [OrderStatus::COMPLETED, OrderStatus::CANCELLED])) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Pesanan sudah dalam status: ').($order->status instanceof OrderStatus ? $order->status->getLabel() : (string) $order->status),
                ], 400);
            }

            // Update order status
            $order->update([
                'status' => OrderStatus::CANCELLED,
                'cancelled_at' => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => __('Pesanan berhasil dibatalkan'),
                'data' => $order,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Pesanan tidak ditemukan atau bukan milik Anda'),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Gagal membatalkan pesanan'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
