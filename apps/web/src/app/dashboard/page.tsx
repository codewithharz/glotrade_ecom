"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Bell,
  ChevronRight,
  Sparkles,
  Flame,
  Gift,
  Users,
  Eye,
  ShoppingCart,
  Filter,
  Grid3X3,
  Zap,
  Store
} from "lucide-react";
import { RequireAuth } from "@/components/auth/Guards";
import { apiGet } from "@/utils/api";
import { getUserId, authHeader } from "@/utils/auth";
import { translate, getStoredLocale } from "@/utils/i18n";

// Types
interface Product {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  brand?: string;
  discount?: number;
  rating?: number;
  views?: number;
  category?: string;
  vendor?: {
    storeName: string;
    _id: string;
  };
}

interface UserStats {
  orders: number;
  wishlist: number;
  wallet: number;
}

interface TrendingProduct extends Product {
  views: number;
  purchases: number;
  isHot: boolean;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStats>({ orders: 0, wishlist: 0, wallet: 0 });
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Guest");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const locale = getStoredLocale();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return translate(locale, "dashboard.greeting.morning");
    if (hour < 17) return translate(locale, "dashboard.greeting.afternoon");
    return translate(locale, "dashboard.greeting.evening");
  };

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;

        // Load user info
        const userRaw = localStorage.getItem("afritrade:user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          setUserName(user.username || user.firstName || translate(locale, "dashboard.greeting.guest"));
        }

        // Load user stats with error handling
        let ordersCount = 0;
        let wishlistCount = 0;

        try {
          // Check if user has a valid JWT token
          const jwtToken = localStorage.getItem("afritrade:auth") || localStorage.getItem("afritrade:jwt") || localStorage.getItem("jwt");
          if (jwtToken) {
            setIsAuthenticated(true);
            const ordersRes = await apiGet(`/api/v1/orders?buyerId=${userId}&limit=1`) as { data?: { total?: number } };
            ordersCount = ordersRes?.data?.total || 0;
          } else {
            console.warn("No JWT token found, skipping orders count");
            setIsAuthenticated(false);
            ordersCount = 0;
          }
        } catch (error) {
          console.warn("Failed to load orders count:", error);
          setIsAuthenticated(false);
          ordersCount = 0;
        }

        try {
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
          wishlistCount = wishlist.length;
        } catch (error) {
          console.warn("Failed to load wishlist count:", error);
          wishlistCount = 0;
        }

        setUserStats({
          orders: ordersCount,
          wishlist: wishlistCount,
          wallet: 0 // TODO: Implement wallet API
        });

        // Load trending products (sorted by views and rating)
        try {
          const trendingRes = await apiGet("/api/v1/market/products?limit=8&sort=-views") as { data?: { products?: Product[] } };
          const products = trendingRes.data?.products || [];

          // Get analytics for these products
          let analytics: any[] = [];
          if (products.length > 0) {
            try {
              const productIds = products.map(p => p._id);
              const analyticsRes = await apiGet(`/api/v1/market/products/analytics/batch?${productIds.map(id => `productIds=${id}`).join('&')}`) as { data?: any[] };
              analytics = analyticsRes.data || [];
            } catch (analyticsError) {
              console.warn("Failed to load product analytics:", analyticsError);
            }
          }

          setTrendingProducts(products.map((p: Product) => {
            const productAnalytics = analytics.find(a => a.productId === p._id);
            return {
              ...p,
              views: p.views || 0,
              purchases: productAnalytics?.sales || 0,
              rating: (p.rating && p.rating > 0) ? p.rating : undefined,
              isHot: (p.views || 0) > 100 || (p.rating || 0) > 4.0
            };
          }));
        } catch (error) {
          console.warn("Failed to load trending products:", error);
          setTrendingProducts([]);
        }

        // Load recommended products (sorted by rating and discount)
        try {
          const recommendedRes = await apiGet("/api/v1/market/products?limit=6&sort=-rating") as { data?: { products?: Product[] } };
          const products = recommendedRes.data?.products || [];

          // Get analytics for these products
          let analytics: any[] = [];
          if (products.length > 0) {
            try {
              const productIds = products.map(p => p._id);
              const analyticsRes = await apiGet(`/api/v1/market/products/analytics/batch?${productIds.map(id => `productIds=${id}`).join('&')}`) as { data?: any[] };
              analytics = analyticsRes.data || [];
            } catch (analyticsError) {
              console.warn("Failed to load product analytics:", analyticsError);
            }
          }

          setRecommendedProducts(products.map((p: Product) => {
            const productAnalytics = analytics.find(a => a.productId === p._id);
            return {
              ...p,
              rating: p.rating || undefined,
              discount: p.discount || undefined,
              purchases: productAnalytics?.sales || 0
            };
          }));
        } catch (error) {
          console.warn("Failed to load recommended products:", error);
          setRecommendedProducts([]);
        }

        // Load recent products (sorted by creation date)
        try {
          const recentRes = await apiGet("/api/v1/market/products?limit=4&sort=-createdAt") as { data?: { products?: Product[] } };
          const products = recentRes.data?.products || [];

          // Get analytics for these products
          let analytics: any[] = [];
          if (products.length > 0) {
            try {
              const productIds = products.map(p => p._id);
              const analyticsRes = await apiGet(`/api/v1/market/products/analytics/batch?${productIds.map(id => `productIds=${id}`).join('&')}`) as { data?: any[] };
              analytics = analyticsRes.data || [];
            } catch (analyticsError) {
              console.warn("Failed to load product analytics:", analyticsError);
            }
          }

          setRecentProducts(products.map((p: Product) => {
            const productAnalytics = analytics.find(a => a.productId === p._id);
            return {
              ...p,
              rating: p.rating || undefined,
              purchases: productAnalytics?.sales || 0
            };
          }));
        } catch (error) {
          console.warn("Failed to load recent products:", error);
          setRecentProducts([]);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Personalized Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {getGreeting()}, {userName}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                  {translate(locale, "dashboard.welcome.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "dashboard.welcome.quickStats")}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{userStats.orders} {translate(locale, "dashboard.stats.orders")}</span>
                    <span className="text-gray-700 dark:text-gray-300">{userStats.wishlist} {translate(locale, "dashboard.stats.wishlist")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={translate(locale, "dashboard.search.placeholder")}
                className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      // Smart search with multiple query strategies
                      const searchQuery = query.trim();
                      const searchParams = new URLSearchParams();

                      // Check if it's a category search
                      const categoryKeywords = ['electronics', 'fashion', 'home', 'sports', 'books', 'beauty', 'clothing', 'shoes', 'phones', 'laptops'];
                      const matchedCategory = categoryKeywords.find(cat =>
                        searchQuery.toLowerCase().includes(cat.toLowerCase())
                      );

                      if (matchedCategory) {
                        searchParams.set('category', matchedCategory);
                        searchParams.set('q', searchQuery);
                      } else {
                        searchParams.set('q', searchQuery);
                      }

                      window.location.href = `/marketplace?${searchParams.toString()}`;
                    }
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span>{translate(locale, "dashboard.search.pressEnter")}</span>
                </div>
              </div>
            </div>

            {/* Search Suggestions */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "dashboard.search.try")}</span>
              {[
                { label: translate(locale, "dashboard.search.suggestions.iphone"), value: 'iPhone' },
                { label: translate(locale, "dashboard.search.suggestions.nikeShoes"), value: 'Nike shoes' },
                { label: translate(locale, "dashboard.search.suggestions.laptop"), value: 'Laptop' },
                { label: translate(locale, "dashboard.search.suggestions.fashion"), value: 'Fashion' },
                { label: translate(locale, "dashboard.search.suggestions.electronics"), value: 'Electronics' }
              ].map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => {
                    const searchParams = new URLSearchParams();
                    searchParams.set('q', suggestion.value);
                    window.location.href = `/marketplace?${searchParams.toString()}`;
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              href="/marketplace"
              className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{translate(locale, "dashboard.quickActions.search")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "dashboard.quickActions.findProducts")}</div>
                </div>
              </div>
            </Link>

            <Link
              href="/marketplace?category=electronics"
              className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Grid3X3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{translate(locale, "dashboard.quickActions.categories")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{translate(locale, "dashboard.quickActions.browseByType")}</div>
                </div>
              </div>
            </Link>

            <Link
              href="/wishlist"
              className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{translate(locale, "dashboard.quickActions.wishlist")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{userStats.wishlist} {translate(locale, "dashboard.stats.items")}</div>
                </div>
              </div>
            </Link>

            <Link
              href="/orders"
              className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{translate(locale, "dashboard.quickActions.orders")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{userStats.orders} {translate(locale, "dashboard.stats.orders")}</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Trending & Hot Right Now */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {translate(locale, "dashboard.trending.title")}
              </h2>
              <Link
                href="/marketplace?sort=trending"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                {translate(locale, "dashboard.trending.viewAll")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
              {trendingProducts.slice(0, 8).map((product) => (
                <Link
                  key={product._id}
                  href={`/marketplace/${product._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="relative">
                    {product.isHot && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {translate(locale, "dashboard.trending.hot")}
                      </div>
                    )}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          ₦{product.price.toLocaleString()}
                        </span>
                        {product.rating && product.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {product.views > 0 && `${product.views} ${translate(locale, "dashboard.trending.views")}`}
                        {product.views > 0 && product.purchases > 0 && ' • '}
                        {product.purchases > 0 && `${product.purchases} ${translate(locale, "dashboard.trending.sold")}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {translate(locale, "dashboard.recommended.title")}
              </h2>
              <Link
                href="/marketplace?sort=recommended"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                {translate(locale, "dashboard.trending.viewAll")} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/marketplace/${product._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.title}
                    </h3>
                    {product.vendor && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translate(locale, "dashboard.recommended.by")} {product.vendor.storeName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₦{product.price.toLocaleString()}
                      </span>
                      {product.rating && product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    {product.discount && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {product.discount}% {translate(locale, "dashboard.recommended.off")}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Community & Social Features */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              {translate(locale, "dashboard.community.title")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recentProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/marketplace/${product._id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="w-3 h-3" />
                        <span>{translate(locale, "dashboard.community.popular")}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Explore Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-indigo-500" />
              {translate(locale, "dashboard.categories.title")}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { name: translate(locale, "dashboard.categories.electronics"), icon: "📱", color: "bg-blue-500", href: "/marketplace?category=electronics" },
                { name: translate(locale, "dashboard.categories.fashion"), icon: "👗", color: "bg-pink-500", href: "/marketplace?category=fashion" },
                { name: translate(locale, "dashboard.categories.homeGarden"), icon: "🏠", color: "bg-green-500", href: "/marketplace?category=home" },
                { name: translate(locale, "dashboard.categories.sports"), icon: "⚽", color: "bg-orange-500", href: "/marketplace?category=sports" },
                { name: translate(locale, "dashboard.categories.books"), icon: "📚", color: "bg-purple-500", href: "/marketplace?category=books" },
                { name: translate(locale, "dashboard.categories.beauty"), icon: "💄", color: "bg-rose-500", href: "/marketplace?category=beauty" }
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 text-center"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>

            {/* New Vendors Section */}
            <div className="mt-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                {translate(locale, "dashboard.vendors.title")}
              </h3>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {translate(locale, "dashboard.vendors.discover")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {translate(locale, "dashboard.vendors.support")}
                    </p>
                  </div>
                  <Link
                    href="/marketplace?sort=new-vendors"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium"
                  >
                    {translate(locale, "dashboard.vendors.explore")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              {translate(locale, "dashboard.activity.title")}
            </h2>

            <div className="space-y-3">
              {/* Authentication Status */}
              {!isAuthenticated && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {translate(locale, "dashboard.activity.signInPrompt")}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {translate(locale, "dashboard.activity.trackPrompt")}
                      </p>
                    </div>
                    <Link
                      href="/auth/login"
                      className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 text-sm font-medium"
                    >
                      {translate(locale, "dashboard.activity.signIn")}
                    </Link>
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {isAuthenticated && userStats.orders > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {translate(locale, "dashboard.activity.ordersHistory", { count: userStats.orders, plural: userStats.orders !== 1 ? 's' : '' })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translate(locale, "dashboard.activity.trackOrders")}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {translate(locale, "dashboard.activity.viewOrders")}
                    </Link>
                  </div>
                </div>
              )}

              {/* Wishlist Activity */}
              {isAuthenticated && userStats.wishlist > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {translate(locale, "dashboard.activity.wishlistItems", { count: userStats.wishlist, plural: userStats.wishlist !== 1 ? 's' : '' })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translate(locale, "dashboard.activity.checkSaved")}
                      </p>
                    </div>
                    <Link
                      href="/wishlist"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                    >
                      {translate(locale, "dashboard.activity.viewWishlist")}
                    </Link>
                  </div>
                </div>
              )}

              {/* Platform Updates */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {translate(locale, "dashboard.activity.newFeatures")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {translate(locale, "dashboard.activity.discoverTrending")}
                    </p>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                    {translate(locale, "dashboard.activity.new")}
                  </span>
                </div>
              </div>

              {/* Shopping Tips */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {translate(locale, "dashboard.activity.proTip")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {translate(locale, "dashboard.activity.searchTip")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-2">{translate(locale, "dashboard.summary.title")}</h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {translate(locale, "dashboard.summary.subtitle")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold">{userStats.orders + userStats.wishlist}</div>
                <div className="text-blue-100 text-xs sm:text-sm">{translate(locale, "dashboard.summary.totalItems")}</div>
              </div>
            </div>
          </div>

          {/* Mobile Floating Action Buttons */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 sm:hidden">
            <Link
              href="/wishlist"
              className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-95"
            >
              <Heart className="w-6 h-6" />
            </Link>
            <Link
              href="/cart"
              className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors active:scale-95"
            >
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
