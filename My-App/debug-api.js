/**
 * Script untuk debug koneksi ke Laravel API
 * Jalankan dengan: node debug-api.js
 */

const API_BASE = "http://192.168.100.63:8000/api";

async function testEndpoint(name, url, method = "GET", body = null) {
  console.log(`\n📡 Testing ${name}...`);
  console.log(`   URL: ${url}`);

  try {
    const options = {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const text = await response.text();

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log(`   ✅ SUCCESS`);
        console.log(
          `   Response:`,
          JSON.stringify(json, null, 2).substring(0, 500),
        );
        return json;
      } catch (e) {
        console.log(`   ✅ SUCCESS (Non-JSON response)`);
        console.log(`   Response:`, text.substring(0, 500));
        return text;
      }
    } else {
      console.log(`   ❌ FAILED`);
      console.log(`   Error:`, text.substring(0, 500));
      return null;
    }
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Starting API Debug Tests...");
  console.log(`🌐 API Base URL: ${API_BASE}\n`);
  console.log("=".repeat(60));

  // Test 1: Check if server is reachable
  await testEndpoint("Server Health Check", `http://192.168.100.63:8000`);

  // Test 2: Test Home endpoint
  const homeData = await testEndpoint("Home Endpoint", `${API_BASE}/home`);

  // Test 3: Test Public Products
  const products = await testEndpoint(
    "Public Products",
    `${API_BASE}/products/public`,
  );

  // Test 4: Test Public Packages
  const packages = await testEndpoint(
    "Public Packages",
    `${API_BASE}/packages/public`,
  );

  // Test 5: Test Categories
  await testEndpoint("Categories", `${API_BASE}/categories`);

  // Test 6: Test Vouchers
  await testEndpoint("Vouchers", `${API_BASE}/vouchers`);

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY:");
  console.log("=".repeat(60));

  // Analyze results
  if (products && products.data) {
    console.log(`\n✅ Found ${products.data.length || 0} products`);
    if (products.data.length > 0) {
      const firstProduct = products.data[0];
      console.log(`   First Product:`, {
        id: firstProduct.id,
        name: firstProduct.name,
        price: firstProduct.price,
        image_url: firstProduct.image_url,
      });

      if (firstProduct.image_url) {
        console.log(`\n📸 Testing Image URL accessibility...`);
        await testEndpoint("Product Image", firstProduct.image_url);
      } else {
        console.log(`\n⚠️  WARNING: First product has no image_url!`);
      }
    } else {
      console.log(`\n⚠️  WARNING: No products found in database!`);
    }
  } else {
    console.log(`\n❌ Failed to fetch products!`);
  }

  if (packages && packages.data) {
    console.log(`\n✅ Found ${packages.data.length || 0} packages`);
    if (packages.data.length > 0) {
      const firstPackage = packages.data[0];
      console.log(`   First Package:`, {
        id: firstPackage.id,
        name: firstPackage.name,
        price: firstPackage.price,
        image_url: firstPackage.image_url,
      });

      if (firstPackage.image_url) {
        console.log(`\n📸 Testing Package Image URL accessibility...`);
        await testEndpoint("Package Image", firstPackage.image_url);
      } else {
        console.log(`\n⚠️  WARNING: First package has no image_url!`);
      }
    } else {
      console.log(`\n⚠️  WARNING: No packages found in database!`);
    }
  } else {
    console.log(`\n❌ Failed to fetch packages!`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("💡 RECOMMENDATIONS:");
  console.log("=".repeat(60));
  console.log(`
1. Pastikan Laravel server berjalan di: http://192.168.100.63:8000
2. Pastikan CORS sudah dikonfigurasi dengan benar
3. Pastikan storage link sudah dibuat: php artisan storage:link
4. Pastikan data sudah ada di database (cek via Filament)
5. Pastikan image_url berisi URL yang bisa diakses dari mobile
6. Pastikan device mobile dan server di network yang sama
`);
}

main().catch(console.error);
