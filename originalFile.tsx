"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";
import { toast } from "@/components/common/Toast";
import { Check, ChevronRight, Package, Truck, BadgeCheck, Printer, ChevronLeft, RotateCcw, FileText, MapPin, Clock, X, Star, ArrowLeft } from "lucide-react";
import ReviewForm from "@/components/reviews/ReviewForm";

type OrderDoc = {
    _id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "disputed";
    paymentStatus?: "pending" | "completed" | "failed" | "refunded";
    totalPrice?: number;
    currency?: string;
    createdAt?: string;
    lineItems?: { productId: string; vendorId?: string; qty: number; unitPrice: number; currency?: string; productTitle?: string; productImage?: string }[];
    shippingDetails?: { address: string; city: string; country: string; postalCode?: string };
    buyer?: { username?: string; email?: string; phone?: string; country?: string };
    invoiceNumber?: string;
    purchaseOrderNumber?: string;
};

function authHeader(): Record<string, string> {
    try {
        const raw = localStorage.getItem("afritrade:user");
        if (!raw) return {};
        const u = JSON.parse(raw);
        const id = u?.id || u?._id;
        return id ? { Authorization: `Bearer ${id}` } : {};
    } catch { return {}; }
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<OrderDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTrack, setShowTrack] = useState(false);
    const [showReorder, setShowReorder] = useState(false);
    const [reorderDone, setReorderDone] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProductForReview, setSelectedProductForReview] = useState<{
        productId: string;
        productTitle: string;
        productImage?: string;
    } | null>(null);
    const [reviewedProducts, setReviewedProducts] = useState<Set<string>>(new Set());

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const res = await fetch(new URL(`/api/v1/orders/${id}`, API_BASE_URL).toString(), { headers: { ...authHeader() }, cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            setOrder(json?.data || null);
        } catch (e: any) {
            toast(e?.message || "Failed to load order", "error");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    // Check which products have already been reviewed
    useEffect(() => {
        const checkReviewedProducts = async () => {
            if (!order?.lineItems) return;

            try {
                const reviewedSet = new Set<string>();

                // Check each product in the order
                for (const item of order.lineItems) {
                    const productId = String(item.productId);
                    try {
                        const res = await fetch(new URL(`/api/v1/market/products/${productId}/reviews`, API_BASE_URL).toString(), {
                            headers: { ...authHeader() },
                            cache: "no-store"
                        });

                        if (res.ok) {
                            const json = await res.json();
                            const reviews = json?.data?.reviews || json?.data || [];

                            // Check if current user has reviewed this product
                            const user = JSON.parse(localStorage.getItem('afritrade:user') || '{}');
                            const userId = user?.id || user?._id;

                            if (userId && reviews.some((review: any) => review.user._id === userId)) {
                                reviewedSet.add(productId);
                            }
                        }
                    } catch (error) {
                        console.error(`Failed to check reviews for product ${productId}:`, error);
                    }
                }

                setReviewedProducts(reviewedSet);
            } catch (error) {
                console.error('Failed to check reviewed products:', error);
            }
        };

        if (order?.status === 'delivered') {
            checkReviewedProducts();
        }
    }, [order]);

    const total = useMemo(() => order?.totalPrice || 0, [order]);
    const currency = order?.currency || "NGN";

    const updateStatus = async (status: string) => {
        try {
            const res = await fetch(new URL(`/api/v1/orders/${id}/status`, API_BASE_URL).toString(), { method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify({ status }) });
            if (!res.ok) throw new Error(await res.text());
            toast("Order updated", "success");
            fetchOrder();
        } catch (e: any) { toast(e?.message || "Update failed", "error"); }
    };

    const handleDownloadInvoice = async () => {
        try {
            toast("Generating invoice...", "info");
            const res = await fetch(new URL(`/api/v1/orders/${id}/invoice/download`, API_BASE_URL).toString(), {
                headers: { ...authHeader() }
            });

            if (!res.ok) throw new Error(await res.text());

            // Handle file download
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${order?.invoiceNumber || id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast("Invoice downloaded successfully", "success");
        } catch (e: any) {
            console.error("Download error:", e);
            toast("Failed to download invoice", "error");
        }
    };

    const performReorder = () => {
        try {
            const items = order?.lineItems || [];
            // Build current cart map id -> qty
            const oldArr: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
            const currentMap = oldArr.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
            // For each line item, ensure cart qty is at least li.qty (merge, not duplicate on repeated reorder)
            for (const li of items) {
                const pid = String(li.productId);
                const desired = Math.max(1, li.qty || 1);
                currentMap[pid] = Math.max(currentMap[pid] || 0, desired);
            }
            // Expand back to array
            const mergedArr: string[] = [];
            Object.entries(currentMap).forEach(([pid, qty]) => {
                for (let i = 0; i < qty; i++) mergedArr.push(pid);
            });
            localStorage.setItem("cart", JSON.stringify(mergedArr));
            window.dispatchEvent(new CustomEvent("cart:update", { detail: { count: mergedArr.length } }));
            setReorderDone(true);
        } catch { }
    };

    const hasAllItemsInCart = (): boolean => {
        try {
            const items = order?.lineItems || [];
            const oldArr: string[] = JSON.parse(localStorage.getItem("cart") || "[]");
            const map = oldArr.reduce<Record<string, number>>((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
            for (const li of items) {
                const pid = String(li.productId);
                const need = Math.max(1, li.qty || 1);
                if ((map[pid] || 0) < need) return false;
            }
            return true;
        } catch { return false; }
    };

    useEffect(() => {
        const onCart = () => {
            if (showReorder) setReorderDone(hasAllItemsInCart());
        };
        window.addEventListener("cart:update", onCart as EventListener);
        return () => window.removeEventListener("cart:update", onCart as EventListener);
    }, [showReorder, order]);

    const StatusChip = ({ s }: { s?: string }) => {
        if (!s) return null;
        const map: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", disputed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
        return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[s] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}>{s}</span>;
    };
    const PayChip = ({ s }: { s?: string }) => {
        if (!s) return null;
        const map: Record<string, string> = { completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200", failed: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", refunded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
        return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[s] || map.pending}`}>{s}</span>;
    };

    return (
        <main className="mx-auto md:w-[95%] w-full px-2 md:px-6 py-6">
            <nav className="mb-3 text-sm text-neutral-500">
                <Link href="/">Home</Link>
                <span className="mx-2">›</span>
                <Link href="/orders">Orders</Link>
                <span className="mx-2">›</span>
                <span>Order {String(id).slice(-6)}</span>
            </nav>
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] shadow-neutral-200/60 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/60">
                {loading ? (
                    <div className="h-32 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                ) : !order ? (
                    <div className="text-sm text-neutral-500">Order not found.</div>
                ) : (
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <Link href="/orders" className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-neutral-300 bg-white/70 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/90 to-blue-600 text-white shadow-lg"><Package size={16} className="sm:w-[18px] sm:h-[18px]" /></span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg font-semibold">Order {order._id.slice(-6)}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-300">
                                        <StatusChip s={order.status} />
                                        <PayChip s={order.paymentStatus} />
                                        <span className="hidden sm:inline">• {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</span>
                                        <span className="sm:hidden">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</span>
                                        {order.purchaseOrderNumber && (
                                            <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                PO: {order.purchaseOrderNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                                <button onClick={() => setShowTrack(true)} className="rounded-full border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1"><Truck size={14} className="sm:w-4 sm:h-4" /> Track</button>
                                <button onClick={() => { setReorderDone(hasAllItemsInCart()); setShowReorder(true); }} className="rounded-full border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">Reorder</button>
                                <button onClick={handleDownloadInvoice} className="rounded-full border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1 hover:bg-neutral-50 dark:hover:bg-neutral-800"><FileText size={14} className="sm:w-4 sm:h-4" /> Invoice</button>
                                <button onClick={() => window.print()} className="rounded-full border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm inline-flex items-center justify-center gap-1"><Printer size={14} className="sm:w-4 sm:h-4" /> Print</button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                            <div className="mb-2 text-xs sm:text-sm font-semibold">Items</div>
                            <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                {(order.lineItems || []).map((li, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-2 sm:gap-3">
                                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={li.productImage || '/next.svg'} alt={li.productTitle || `Product ${String(li.productId).slice(-6)}`} className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover bg-neutral-100 dark:bg-neutral-800 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs sm:text-sm font-medium truncate">{li.productTitle || `Product ${String(li.productId).slice(-6)}`}</div>
                                                <div className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">Qty {li.qty} • {(li.unitPrice || 0).toLocaleString()} {li.currency || "ATH"}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                                            <div className="text-xs sm:text-sm font-semibold">{(li.unitPrice * li.qty).toLocaleString()} {li.currency || "ATH"}</div>
                                            {/* Individual Review Button for each product */}
                                            {order.status === "delivered" && (
                                                reviewedProducts.has(String(li.productId)) ? (
                                                    // Already reviewed - show disabled button
                                                    <button
                                                        disabled
                                                        className="rounded-full border border-green-300 px-2 sm:px-3 py-1 text-[10px] sm:text-xs inline-flex items-center gap-1 bg-neutral-100 cursor-not-allowed dark:bg-neutral-800 dark:border-green-700 dark:text-green-400"
                                                    >
                                                        <Check size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Reviewed</span>
                                                    </button>
                                                ) : (
                                                    // Not reviewed yet - show active review button
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductForReview({
                                                                productId: String(li.productId),
                                                                productTitle: li.productTitle || `Product ${String(li.productId).slice(-6)}`,
                                                                productImage: li.productImage
                                                            });
                                                            setShowReviewModal(true);
                                                        }}
                                                        className="rounded-full border border-orange-200 px-2 sm:px-3 py-1 text-[10px] sm:text-xs inline-flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300"
                                                    >
                                                        <Star size={10} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">Review</span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary & Shipping */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                                <div className="mb-2 text-xs sm:text-sm font-semibold">Summary</div>
                                <div className="flex items-center justify-between text-xs sm:text-sm"><span>Order total</span><span className="font-semibold">{total.toLocaleString()} {currency}</span></div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 p-3 sm:p-4 dark:border-neutral-800">
                                <div className="mb-2 text-xs sm:text-sm font-semibold">Shipping</div>
                                <div className="flex items-start gap-2 text-xs sm:text-sm">
                                    <MapPin size={14} className="mt-0.5 text-neutral-500 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium">{order.shippingDetails?.address}</div>
                                        <div className="text-neutral-500 text-[10px] sm:text-xs">{order.shippingDetails?.city}, {order.shippingDetails?.country}</div>
                                        <div className="mt-1 text-[9px] sm:text-xs text-neutral-600 dark:text-neutral-300">{order.buyer?.username}{order.buyer?.email ? ` • ${order.buyer.email}` : ''}{order.buyer?.phone ? ` • ${order.buyer.phone}` : ''}{order.buyer && (order as any).buyer.city ? ` • ${(order as any).buyer.city}` : ''}{order.buyer?.country ? ` • ${order.buyer.country}` : ''}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contextual actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            {(order.status === "pending" || order.status === "processing") && (
                                <button onClick={() => setShowCancelConfirm(true)} className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm inline-flex items-center gap-1"><X size={14} className="sm:w-4 sm:h-4" /> Cancel order</button>
                            )}
                            {order.status === "shipped" && (
                                <button onClick={() => updateStatus("delivered")} className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm inline-flex items-center gap-1"><Check size={14} className="sm:w-4 sm:h-4" /> Mark received</button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Tracking modal */}
            {showTrack ? (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowTrack(false)} />
                    <div className="relative z-10 w-[95%] max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 mt-4 mb-4">
                        <div className="mb-2 text-sm sm:text-base font-semibold inline-flex items-center gap-2"><Truck size={14} className="sm:w-4 sm:h-4" /> Tracking</div>
                        <div className="space-y-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2"><Clock size={12} className="sm:w-3.5 sm:h-3.5" /> Your package is being prepared. Live tracking coming soon.</div>
                        </div>
                        <div className="mt-4 flex gap-2"><button onClick={() => setShowTrack(false)} className="flex-1 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Close</button></div>
                    </div>
                </div>
            ) : null}

            {/* Reorder confirm modal */}
            {showReorder ? (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowReorder(false)} />
                    <div className="relative z-10 w-[95%] max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 mt-4 mb-4">
                        <div className="text-sm sm:text-base font-semibold mb-1">{reorderDone ? 'Added to cart' : 'Add items to cart?'}</div>
                        <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">We will merge items from this order with your cart (won't duplicate on repeated reorders).</div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => { if (!reorderDone) { performReorder(); } }} disabled={reorderDone} className={`flex-1 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold ${reorderDone ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' : 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'}`}>{reorderDone ? 'Added' : 'OK'}</button>
                            <button onClick={() => { setShowReorder(false); setReorderDone(false); }} className="flex-1 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Close</button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Order Cancellation Confirmation Modal */}
            {showCancelConfirm ? (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelConfirm(false)} />
                    <div className="relative z-10 w-[95%] max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 mt-4 mb-4">
                        <div className="text-center mb-4">
                            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <span className="text-xl sm:text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                Cancel Order #{id?.slice(-6)}?
                            </h3>
                        </div>

                        <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                            <p className="mb-3">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>

                            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                <div className="font-medium text-amber-800 dark:text-amber-200 mb-2 text-xs sm:text-sm">What happens when you cancel:</div>
                                <ul className="space-y-1 text-[10px] sm:text-xs text-amber-700 dark:text-amber-300">
                                    <li>• Order will be marked as cancelled</li>
                                    <li>• Payment will be refunded (if already paid)</li>
                                    <li>• Seller will be notified</li>
                                    <li>• Product inventory will be restored</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="flex-1 rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await updateStatus("cancelled");
                                        setShowCancelConfirm(false);
                                    } catch (error) {
                                        // Error already handled in updateStatus
                                    }
                                }}
                                className="flex-1 rounded-full bg-rose-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:bg-rose-700"
                            >
                                Yes, Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Review Modal */}
            {showReviewModal && selectedProductForReview && (
                <ReviewForm
                    productId={selectedProductForReview.productId}
                    productTitle={selectedProductForReview.productTitle}
                    orderInfo={{
                        orderId: id || "",
                        isVerifiedPurchase: true
                    }}
                    onReviewSubmitted={() => {
                        setShowReviewModal(false);
                        setSelectedProductForReview(null);
                        toast("Review submitted successfully!", "success");
                        // Refresh the reviewed products list
                        if (order?.lineItems) {
                            const updatedReviewed = new Set(reviewedProducts);
                            updatedReviewed.add(selectedProductForReview.productId);
                            setReviewedProducts(updatedReviewed);
                        }
                    }}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedProductForReview(null);
                    }}
                />
            )}
        </main>
    );
}

