import { apiGet } from "@/utils/api";
import Link from "next/link";
import { Store, MapPin, Clock, Truck, Shield, Users, Star, Globe, MessageCircle } from "lucide-react";

export default async function StoreAboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seller = (await apiGet<{ status: string; data: any }>(`/api/v1/sellers/${encodeURIComponent(slug)}`).catch(() => ({ status: 'success', data: null }))).data;
  
  // Debug: Log seller data to see what's available
  console.log('Seller data in About page:', seller);
  
  // Get the best available logo URL - use exactly the same as StoreHeader
  const getLogoUrl = () => {
    return seller?.logoUrl || 'https://picsum.photos/seed/mba-m2-1/800/800';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="mx-auto md:w-[95%] w-full px-2 md:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-neutral-500">
            <Link href={`/s/${slug}`} className="hover:underline hover:text-neutral-700 dark:hover:text-neutral-300">
              {seller?.name || slug}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-neutral-700 dark:text-neutral-300">About</span>
          </nav>
          
          {/* Store Hero */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              <img
                src={getLogoUrl()}
                alt={`${seller?.name || slug} logo`}
                className="h-24 w-24 md:h-32 md:w-32 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-neutral-800"
              />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {seller?.name || slug}
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4 max-w-2xl">
                {seller?.description || 'Welcome to our store! We are committed to providing quality products and excellent service.'}
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Users className="h-4 w-4" />
                  <span>{Array.isArray(seller?.followers) ? seller.followers.length : 0} followers</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="h-4 w-4" />
                  <span>{seller?.country || 'Worldwide'}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Star className="h-4 w-4" />
                  <span>{seller?.averageRating ? `${seller.averageRating.toFixed(1)} rating` : 'New store'}</span>
          </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto md:w-[95%] w-full px-2 py-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Description */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Store className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">About Our Store</h2>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-base">
                  {seller?.description || 
                    'We are passionate about delivering exceptional products and outstanding customer service. Our commitment to quality and reliability has made us a trusted destination for shoppers worldwide. Every product in our store is carefully selected to ensure it meets our high standards of excellence.'}
                </p>
              </div>
            </div>

            {/* Store Policies */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Store Policies</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Shipping</h3>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <div>
                      <span className="font-medium">Regions:</span> {seller?.policies?.shippingRegions?.join(', ') || 'Worldwide'}
                    </div>
                    <div>
                      <span className="font-medium">Handling:</span> {seller?.policies?.handlingDays ? `${seller.policies.handlingDays} business days` : '1-2 business days'}
                    </div>
                  </div>
                </div>

                {/* Returns */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Returns</h3>
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    <div>
                      <span className="font-medium">Policy:</span> {seller?.policies?.returnPolicy || '30-day return policy'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Business Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Location & Currency</h3>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{seller?.country || 'International'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Currencies:</span> {Array.isArray(seller?.currencies) ? seller.currencies.join(', ') : 'Multiple currencies accepted'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Store Highlights</h3>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
                    <div>
                      <span className="font-medium">Verified:</span> {seller?.isVerified ? 'Yes' : 'Pending verification'}
                    </div>
                    <div>
                      <span className="font-medium">Products:</span> {seller?.totalProducts || 'Multiple categories'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Get in Touch</h3>
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-3">
                <p>Have questions about our products or policies? We're here to help!</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    💬 Use the in-app messaging system to reach us directly
                  </p>
                </div>
              </div>
            </div>

            {/* Store Stats */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Store Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Followers</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {Array.isArray(seller?.followers) ? seller.followers.length : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Products</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {seller?.totalProducts || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Rating</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {seller?.averageRating ? `${seller.averageRating.toFixed(1)}/5` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Active Since</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {seller?.activeSince ? new Date(seller.activeSince).getFullYear() : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Trust & Safety</h3>
              <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span>Fast shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

