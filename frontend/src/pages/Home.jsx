import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/products/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        setProducts(response.data.slice(0, 4));
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>

      {/* Hero Section */}
      <section className="bg-indigo-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 px-6 py-24 md:flex-row">

          <div className="max-w-xl">

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
              Welcome to QA-Shop
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Discover Products.
              <span className="text-indigo-600">
                {" "}Shop Smarter.
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Find quality products at great prices.
              Enjoy a simple and convenient online shopping
              experience with QA-Shop.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Explore Products
              <ArrowRight size={20} />
            </Link>

          </div>

          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-3xl bg-indigo-100 md:h-80">

            <ShoppingBag
              size={120}
              strokeWidth={1}
              className="text-indigo-600"
            />

          </div>

        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="font-semibold text-indigo-600">
              Our Collection
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Featured Products
            </h2>

            <p className="mt-2 text-gray-500">
              Explore some of our available products.
            </p>
          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800 sm:flex"
          >
            View All
            <ArrowRight size={18} />
          </Link>

        </div>

        {loading && (
          <p className="py-12 text-center text-gray-500">
            Loading products...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-12 text-center text-gray-500">
            No products available.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}

export default Home;