"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RequireAuth } from "@/components/auth/Guards";
import { toast } from "@/components/common/Toast";
import { API_BASE_URL, getAuthHeader } from "@/utils/api";
import ProductImageUpload from "@/components/product/ProductImageUpload";

export default function ManageProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ price: 0, quantity: 0, discount: 0, featured: false, variants: [] });
  const [activeTab, setActiveTab] = useState<'details' | 'images'>('details');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(new URL(`/api/v1/market/products/${id}`, API_BASE_URL).toString(), { headers: { ...getAuthHeader() }, cache: "no-store" });
        const j = await r.json();
        setProduct(j?.data || null);
        const p = j?.data || {};
        setForm({ price: p.price, quantity: p.quantity, discount: p.discount || 0, featured: !!p.featured, variants: p.variants || [] });
      } catch { }
      finally { setLoading(false); }
    })();
  }, [id]);

  const save = async () => {
    try {
      setLoading(true);
      const payload: any = { price: Number(form.price), quantity: Number(form.quantity), discount: Number(form.discount || 0), featured: !!form.featured };
      if (Array.isArray(form.variants)) payload.variants = form.variants.map((v: any) => ({ sku: v.sku || undefined, price: v.price ? Number(v.price) : undefined, quantity: Number(v.quantity || 0), attributes: v.attributes || {} }));
      const r = await fetch(new URL(`/api/v1/vendors/products/${id}`, API_BASE_URL).toString(), { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(await r.text());
      // Refresh product data after save
      const refreshRes = await fetch(new URL(`/api/v1/market/products/${id}`, API_BASE_URL).toString(), { headers: { ...getAuthHeader() }, cache: "no-store" });
      const refreshData = await refreshRes.json();
      setProduct(refreshData?.data || null);
      toast('Product updated successfully', 'success');
    } catch (e) {
      console.warn(e);
      toast('Failed to update product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = async (newImages: string[]) => {
    try {
      setLoading(true);
      const r = await fetch(new URL(`/api/v1/vendors/products/${id}`, API_BASE_URL).toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ images: newImages })
      });
      if (!r.ok) throw new Error(await r.text());

      // Update local product state
      setProduct((prev: any) => prev ? { ...prev, images: newImages } : null);
      toast('Images updated successfully', 'success');
    } catch (e) {
      console.warn(e);
      toast('Failed to update images', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="text-center py-8">Loading...</div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
  if (!product) return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="text-center py-8">Not found</div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );

  return (
    <RequireAuth>
      <div className="fixed inset-0 bg-white dark:bg-neutral-950 overflow-y-auto z-50">
        <main className="min-h-full py-4 sm:py-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-semibold">Manage product</h1>
              <Link href="/admin/products" className="text-sm underline">Back</Link>
            </div>

            {/* Product Info Header */}
            <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-start gap-3 sm:gap-4">
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold mb-2">{product.title}</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span className="text-neutral-500">Category: {product.category}</span>
                    {product.subcategory && <span className="text-neutral-500">Subcategory: {product.subcategory}</span>}
                    <span className="text-neutral-500">Condition: {product.condition}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-4 flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === 'images'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
              >
                Product Images ({product.images?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="mb-1 text-xs text-neutral-500">Price</div>
                    <input type="number" min={0} value={form.price} onChange={(e) => setForm((s: any) => ({ ...s, price: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-neutral-500">Stock</div>
                    <input type="number" min={0} value={form.quantity} onChange={(e) => setForm((s: any) => ({ ...s, quantity: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-sm sm:text-base" />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-neutral-500">Discount %</div>
                    <input type="number" min={0} max={100} value={form.discount} onChange={(e) => setForm((s: any) => ({ ...s, discount: Number(e.target.value) }))} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-sm sm:text-base" />
                  </div>
                  <label className="flex items-center gap-2 text-xs sm:text-sm mt-6"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm((s: any) => ({ ...s, featured: e.target.checked }))} className="w-4 h-4" /> Featured</label>
                </div>

                {/* Variants */}
                <div className="mt-4">
                  <div className="mb-1 text-xs sm:text-sm font-semibold">Variants</div>
                  {(form.variants || []).length === 0 ? (<div className="text-xs sm:text-sm text-neutral-500">No variants.</div>) : (
                    <div className="space-y-2">
                      {(form.variants || []).map((v: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input value={v.sku || ''} onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], sku: e.target.value }; return { ...s, variants: next }; })} placeholder="SKU" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-xs sm:text-sm" />
                          <input type="number" min={0} value={v.price || ''} onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], price: Number(e.target.value) }; return { ...s, variants: next }; })} placeholder="Price override" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-xs sm:text-sm" />
                          <input type="number" min={0} value={v.quantity || 0} onChange={(e) => setForm((s: any) => { const next = [...(s.variants || [])]; next[idx] = { ...next[idx], quantity: Number(e.target.value) }; return { ...s, variants: next }; })} placeholder="Stock" className="rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 sm:py-2 text-xs sm:text-sm" />
                          <div className="col-span-1 sm:col-span-3 text-xs text-neutral-500">
                            {Object.entries(v.attributes || {}).map(([k, val]) => (<span key={k} className="mr-2">{k}: <strong>{String(val)}</strong></span>))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button onClick={save} disabled={loading} className="rounded-full bg-neutral-900 text-white px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm dark:bg-neutral-100 dark:text-black disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                  <button onClick={async () => { if (!confirm('Archive this product?')) return; try { await fetch(new URL(`/api/v1/vendors/products/${id}`, API_BASE_URL).toString(), { method: 'DELETE', headers: { ...getAuthHeader() } }); router.replace('/admin/products'); } catch { } }} className="rounded-full border border-rose-300 text-rose-600 px-4 sm:px-6 py-2.5 sm:py-2 text-xs sm:text-sm">Archive</button>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <ProductImageUpload
                  productId={id}
                  currentImages={product.images || []}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}

