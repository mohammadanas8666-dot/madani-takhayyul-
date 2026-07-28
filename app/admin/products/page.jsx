'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminNav from '@/components/AdminNav';
import { useAuth } from '@/context/AuthContext';
import { PRODUCT_CATEGORIES } from '@/lib/categories';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Sparkles,
  X,
  Loader2,
  Search,
} from 'lucide-react';

const PLACEHOLDER_IMG = 'https://placehold.co/200x200/1a1e2e/d4af37?text=ROQAYYA';

const EMPTY_FORM = {
  name: '',
  price: '',
  stock: '',
  category: PRODUCT_CATEGORIES[0],
  color: '',
  size: '',
  fabric: '',
  isFeaturedInSlider: false,
  description: '',
  images: [],
};

export default function AdminProductsPage() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

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
    setFormData(EMPTY_FORM);
    setStatusMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || PRODUCT_CATEGORIES[0],
      color: product.color || '',
      size: product.size || '',
      fabric: product.fabric || '',
      isFeaturedInSlider: Boolean(product.isFeaturedInSlider),
      description: product.description || '',
      images: product.images || [],
    });
    setStatusMsg('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      for (const file of files) {
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
          alert(data.error || 'Failed to upload one of the images');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file(s)');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
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
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-gold-400" />
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
                className="bg-dark-900 border border-gold-900/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500 w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Table View — horizontally scrollable on mobile */}
        <div className="bg-dark-900/80 border border-gold-900/40 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-gold-900/40">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Specs</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Featured Slider</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-900/20">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gold-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const img = product.images?.[0] || PLACEHOLDER_IMG;
                    const specs = [product.color, product.size, product.fabric].filter(Boolean).join(' / ');
                    return (
                      <tr key={product._id} className="hover:bg-dark-800/40 transition-colors">
                        <td className="p-4 flex items-center gap-3 whitespace-nowrap">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-dark-950 shrink-0 border border-gold-900/40">
                            <Image src={img} alt="" fill className="object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{product.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">{product._id}</span>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-slate-200 whitespace-nowrap">
                          {product.category}
                        </td>

                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {specs || '—'}
                        </td>

                        <td className="p-4 font-bold text-gold-400 whitespace-nowrap">
                          ₹{product.price}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              product.stock > 0
                                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {product.isFeaturedInSlider ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-md border border-gold-500/30">
                              <Sparkles className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No</span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 rounded-lg bg-dark-800 text-slate-300 hover:text-gold-400 hover:bg-dark-800/70 transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 rounded-lg bg-dark-800 text-slate-400 hover:text-red-400 hover:bg-dark-800/70 transition-colors"
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
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-xl bg-dark-900 border border-gold-900/40 rounded-3xl p-6 sm:p-8 text-white z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gold-900/40 pb-4 mb-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Package className="w-5 h-5 text-gold-400" />
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
                  placeholder="e.g. Premium Silk Amama Turban"
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
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
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
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
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeaturedInSlider}
                      onChange={(e) => setFormData({ ...formData, isFeaturedInSlider: e.target.checked })}
                      className="w-4 h-4 accent-gold-500 rounded"
                    />
                    <span>Show in Hero Slider</span>
                  </label>
                </div>
              </div>

              {/* Color / Size / Fabric — optional attributes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Black & Gold"
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. Free Size"
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fabric</label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="e.g. Chiffon, Silk"
                    className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product features..."
                  className="w-full bg-dark-950 border border-gold-900/40 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Cloudinary Multi-Image Uploader — front/back/folded angles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Product Images (multiple angles supported — Cloudinary)
                </label>

                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold-900/40 group">
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

                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gold-900/50 hover:border-gold-500 bg-dark-950 flex flex-col items-center justify-center text-slate-400 cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span className="text-[9px] mt-1 font-semibold">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-500">Tip: select multiple files at once to add front, back and folded views together.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold-900/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-semibold hover:bg-dark-800/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-950 font-extrabold text-xs shadow-lg"
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