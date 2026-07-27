'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  Search,
  ShieldAlert
} from 'lucide-react';

export default function AdminProductsPage() {
  const { dbUser, isAdmin, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Electronics',
    isFeaturedInSlider: false,
    description: '',
    images: [],
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: 'Electronics',
      isFeaturedInSlider: false,
      description: '',
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || 'Electronics',
      isFeaturedInSlider: Boolean(product.isFeaturedInSlider),
      description: product.description || '',
      images: product.images || [],
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setStatusMsg('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setStatusMsg(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setStatusMsg('Server error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-black text-white">Product Inventory ({products.length})</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured Slider</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-emerald-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const img = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
                    return (
                      <tr key={product._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                            <Image src={img} alt="" fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{product.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{product._id}</span>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-slate-200">
                          {product.category || 'General'}
                        </td>

                        <td className="p-4 font-bold text-emerald-400">
                          ₹{product.price}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              product.stock > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="p-4">
                          {product.isFeaturedInSlider ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              <Sparkles className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No</span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-700 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {statusMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {statusMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ergonomic Bluetooth Mouse"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1299"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Count *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Books & Stationeries">Books & Stationeries</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeaturedInSlider}
                      onChange={(e) => setFormData({ ...formData, isFeaturedInSlider: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span>Show in Hero Slider</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cloudinary Image Uploader */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Product Images (Cloudinary API)
                </label>

                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-800 group">
                      <Image src={url} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-[9px] mt-1 font-semibold">Upload</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
