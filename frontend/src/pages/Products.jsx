import { useEffect, useState } from "react";

import api from "../services/api";
import ProductCard from "../components/products/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to retrieve products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">

      <div className="mb-10">
        <p className="font-semibold text-indigo-600">
          Shop
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          All Products
        </h1>

        <p className="mt-2 text-gray-500">
          Browse our complete product collection.
        </p>
      </div>

      {loading && (
        <p className="py-12 text-center text-gray-500">
          Loading products...
        </p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-5 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500">
          No products found.
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}

    </main>
  );
}

export default Products;