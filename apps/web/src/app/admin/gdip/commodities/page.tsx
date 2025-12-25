"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Save, Trash2, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/utils/api";

interface CommodityType {
    _id: string;
    name: string;
    label: string;
    icon: string;
    isActive: boolean;
}

export default function AdminCommoditiesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [commodities, setCommodities] = useState<CommodityType[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCommodity, setEditingCommodity] = useState<CommodityType | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        label: "",
        icon: "🌾",
        isActive: true
    });

    useEffect(() => {
        fetchCommodities();
    }, []);

    const fetchCommodities = async () => {
        try {
            setLoading(true);
            const response = await apiGet<{ success: boolean; data: CommodityType[] }>("/api/v1/gdip/commodities/types");
            if (response.success) {
                setCommodities(response.data);
            }
        } catch (err: any) {
            console.error("Error fetching commodities:", err);
            setError("Failed to load commodities");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (commodity?: CommodityType) => {
        if (commodity) {
            setEditingCommodity(commodity);
            setFormData({
                name: commodity.name,
                label: commodity.label,
                icon: commodity.icon,
                isActive: commodity.isActive
            });
        } else {
            setEditingCommodity(null);
            setFormData({
                name: "",
                label: "",
                icon: "🌾",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingCommodity) {
                await apiPatch(`/api/v1/gdip/admin/commodities/types/${editingCommodity._id}`, formData);
                setSuccess("Commodity updated successfully");
            } else {
                await apiPost("/api/v1/gdip/admin/commodities/types", formData);
                setSuccess("Commodity created successfully");
            }

            setIsModalOpen(false);
            fetchCommodities();
        } catch (err: any) {
            setError(err.message || "Failed to save commodity");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await apiPatch(`/api/v1/gdip/admin/commodities/types/${id}`, { isActive: !currentStatus });
            setCommodities(prev => prev.map(c =>
                c._id === id ? { ...c, isActive: !currentStatus } : c
            ));
        } catch (err: any) {
            setError("Failed to toggle status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this commodity type? This cannot be undone.")) return;

        try {
            await apiDelete(`/api/v1/gdip/admin/commodities/types/${id}`);
            setCommodities(prev => prev.filter(c => c._id !== id));
            setSuccess("Commodity deleted successfully");
        } catch (err: any) {
            setError("Failed to delete commodity");
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/admin/gdip")}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to GDIP Admin
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Commodities</h1>
                        <p className="text-gray-600">Configure commodity types and icons available for partner purchase</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Commodity
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <XCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* Commodities List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">Available Commodity Types</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Label</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex justify-center mb-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                            Loading commodities...
                                        </td>
                                    </tr>
                                ) : commodities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            No commodity types found.
                                        </td>
                                    </tr>
                                ) : (
                                    commodities.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-3xl bg-gray-100 w-12 h-12 rounded-xl flex items-center justify-center">
                                                    {item.icon}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{item.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.label}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Save className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(item._id, item.isActive)}
                                                    className={`p-2 rounded-lg transition-all ${item.isActive
                                                        ? "text-orange-600 hover:bg-orange-50"
                                                        : "text-green-600 hover:bg-green-50"
                                                        }`}
                                                    title={item.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {item.isActive ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingCommodity ? "Edit Commodity" : "Add New Commodity"}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Internal Name (ID)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Rice"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Display Label</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Premium White Rice"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. 🌾"
                                    />
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Available for purchase</label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Commodity"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Admin Tip
                    </h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                        Commodity types defined here populate the selection options on the partner's TPIA Purchase page.
                        Deactivating a commodity will hide it from new purchases but won't affect existing investments.
                        Ensure each commodity has a descriptive icon and clear label.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
