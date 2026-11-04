import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import api from "../../services/api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  categoryId: "",
};

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    const response = await api.get("/products");
    return response.data;
  };

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        const data = await fetchProducts();

        if (!ignore) {
          setProducts(data);

          const uniqueCategories = [
            ...new Map(
              data
                .filter((product) => product.category)
                .map((product) => [
                  product.category.id,
                  product.category,
                ])
            ).values(),
          ];

          setCategories(uniqueCategories);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to load products."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const refreshProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId || product.category?.id || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(formData.price);
    const stock = Number(formData.stock);
    const categoryId = Number(formData.categoryId);

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      setError("Enter a valid price, stock quantity, and category.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price,
      stock,
      imageUrl: formData.imageUrl.trim() || null,
      categoryId,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(`/products/${editingId}`, payload);
        setSuccess("Product successfully updated.");
      } else {
        await api.post("/products", payload);
        setSuccess("Product successfully created.");
      }

      setShowForm(false);
      setFormData(initialForm);

      await refreshProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/products/${productId}`);

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      setSuccess("Product successfully deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete product."
      );
    }
  };

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  if (loading) {
    return <p className="p-8 text-gray-500">Loading products...</p>;
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-indigo-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Product Management
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your store inventory and product catalog.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={19} />
          Add Product
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId !== null ? "Edit Product" : "Create Product"}
            </h2>

            <button
              onClick={() => setShowForm(false)}
              aria-label="Close product form"
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Product Name
              </label>

              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium">
                Price (PHP)
              </label>

              <input
                id="price"
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label htmlFor="stock" className="mb-2 block text-sm font-medium">
                Stock Quantity
              </label>

              <input
                id="stock"
                type="number"
                name="stock"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium">
                Image URL
              </label>

              <input
                id="imageUrl"
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Product"
                    : "Create Product"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">

                <td className="p-4 font-medium text-gray-900">
                  {product.name}
                </td>

                <td className="p-4 text-gray-600">
                  {product.category?.name || "General"}
                </td>

                <td className="p-4">
                  {formatPrice(product.price)}
                </td>

                <td className="p-4">
                  {product.stock}
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => openEditForm(product)}
                      aria-label={`Edit ${product.name}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      aria-label={`Delete ${product.name}`}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {products.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No products available.
          </p>
        )}

      </div>

    </div>
  );
}

export default AdminProducts;