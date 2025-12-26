import { MetadataRoute } from 'next';
import { apiGet } from '@/utils/api';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Optional: revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const baseUrl = 'https://glotrade.online';

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/wishlist`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/orders`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Fetch products for dynamic routes
    let productRoutes: MetadataRoute.Sitemap = [];
    try {
        const productsRes = await apiGet<{ status: string; data: { products: any[] } }>(
            '/api/v1/market/products',
            { query: { limit: 1000 } }
        );

        if (productsRes.status === 'success' && Array.isArray(productsRes.data?.products)) {
            productRoutes = productsRes.data.products.map((product: any) => ({
                url: `${baseUrl}/products/${product._id}`,
                lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            }));
        }
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    // Fetch categories for dynamic routes
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categoriesRes = await apiGet<{ status: string; data: { categories: any[] } }>(
            '/api/v1/categories'
        );

        if (categoriesRes.status === 'success' && Array.isArray(categoriesRes.data?.categories)) {
            categoryRoutes = categoriesRes.data.categories.map((category: any) => ({
                url: `${baseUrl}/categories/${category._id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
        }
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error);
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
