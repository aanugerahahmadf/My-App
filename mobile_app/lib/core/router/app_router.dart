import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/auth/presentation/pages/sign_in_page.dart';
import '../../features/auth/presentation/pages/sign_up_page.dart';
import '../../features/auth/presentation/pages/otp_email_verification_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/home/presentation/pages/main_shell.dart';
import '../../features/catalog/presentation/pages/catalog_list_page.dart';
import '../../features/catalog/presentation/pages/catalog_detail_page.dart';
import '../../features/cbir/presentation/pages/cbir_result_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/order/presentation/pages/checkout_page.dart';
import '../../features/order/presentation/pages/order_history_page.dart';
import '../../features/order/presentation/pages/order_detail_page.dart';
import '../../features/chat/presentation/pages/chat_list_page.dart';
import '../../features/chat/presentation/pages/chat_detail_page.dart';
import '../../features/notification/presentation/pages/notification_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/profile/presentation/pages/edit_profile_page.dart';
import '../../features/payment/presentation/pages/midtrans_webview_page.dart';
import '../../features/review/presentation/pages/my_reviews_page.dart';
import '../../features/wishlist/presentation/pages/wishlist_page.dart';
import '../../features/catalog/presentation/pages/catalog_combined_page.dart';
import '../../features/legal/presentation/pages/terms_of_service_page.dart';
import '../../features/legal/presentation/pages/privacy_policy_page.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (_, _) => const SplashPage()),
    GoRoute(path: '/onboarding', builder: (_, _) => const OnboardingPage()),
    GoRoute(path: '/sign-in', builder: (_, _) => const SignInPage()),
    GoRoute(path: '/sign-up', builder: (_, _) => const SignUpPage()),
    GoRoute(path: '/verify-otp', builder: (_, _) => const OtpEmailVerificationPage()),
    GoRoute(path: '/forgot-password', builder: (_, _) => const ForgotPasswordPage()),
    GoRoute(path: '/reset-password', builder: (_, _) => const ResetPasswordPage()),
    StatefulShellRoute.indexedStack(
      builder: (_, _, navigationShell) => MainShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/home', builder: (_, _) => const HomePage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/orders', builder: (_, _) => const OrderHistoryPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/chat-list', builder: (_, _) => const ChatListPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/cart', builder: (_, _) => const CartPage()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (_, _) => const ProfilePage()),
        ]),
      ],
    ),
    GoRoute(
      path: '/catalog/:type',
      builder: (_, state) => CatalogListPage(type: state.pathParameters['type']!),
    ),
    GoRoute(
      path: '/catalog/:type/:id',
      builder: (_, state) => CatalogDetailPage(
        type: state.pathParameters['type']!,
        id: state.pathParameters['id']!,
      ),
    ),
    GoRoute(path: '/cbir-result', builder: (_, _) => const CbirResultPage()),
    GoRoute(path: '/checkout', builder: (_, _) => const CheckoutPage()),
    GoRoute(path: '/order/:id', builder: (_, state) => OrderDetailPage(id: state.pathParameters['id']!)),
    GoRoute(path: '/chat/:id', builder: (_, state) => ChatDetailPage(id: state.pathParameters['id']!)),
    GoRoute(path: '/notifications', builder: (_, _) => const NotificationPage()),
    GoRoute(path: '/edit-profile', builder: (_, _) => const EditProfilePage()),
    GoRoute(path: '/my-reviews', builder: (_, _) => const MyReviewsPage()),
    GoRoute(path: '/wishlist', builder: (_, _) => const WishlistPage()),
    GoRoute(path: '/catalog', builder: (_, _) => const CatalogCombinedPage()),
    GoRoute(path: '/terms-of-service', builder: (_, _) => const TermsOfServicePage()),
    GoRoute(path: '/privacy-policy', builder: (_, _) => const PrivacyPolicyPage()),
    GoRoute(
      path: '/payment/:orderId',
      builder: (_, state) => MidtransWebviewPage(orderId: state.pathParameters['orderId']!),
    ),
  ],
);
