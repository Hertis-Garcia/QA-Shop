import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product || response.data);
      } catch (error) {
        console.error("Product fetch error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage({
        type: "error",
        text: "Please log in before adding products to your cart.",
      });
      return;
    }

    try {
      setAddingToCart(true);
      setMessage(null);

      await api.post("/cart", {
        productId: product.id,
        quantity,
      });

      setMessage({
        type: "success",
        text: "Product successfully added to your cart!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to add product to cart.",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-500" />

        <h2 className="text-2xl font-bold text-gray-900">
          Product Not Found
        </h2>

        <Link
          to="/products"
          className="text-indigo-600 hover:underline"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <Link
        to="/products"
        className="mb-10 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Product Image */}
        <div className="flex min-h-96 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full max-h-[500px] w-full object-contain"
            />
          ) : (
            <ShoppingCart size={100} className="text-gray-300" />
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            {product.category?.name || "General"}
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </p>

          <div className="my-8 border-t border-gray-200" />

          <h3 className="font-semibold text-gray-900">Product Description</h3>

          <p className="mt-3 leading-relaxed text-gray-600">
            {product.description || "No description available."}
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium text-gray-700">Availability</p>

            <p
              className={`mt-2 text-sm font-semibold ${
                outOfStock ? "text-red-600" : "text-green-600"
              }`}
            >
              {outOfStock ? "Out of Stock" : `${product.stock} items available`}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-700">Quantity</p>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setQuantity((previous) => Math.max(1, previous - 1))
                }
                disabled={quantity <= 1 || outOfStock}
                className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>

              <span className="min-w-8 text-center font-semibold">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity((previous) =>
                    Math.min(product.stock, previous + 1),
                  )
                }
                disabled={quantity >= product.stock || outOfStock}
                className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Feedback */}
          {message && (
            <div
              role="alert"
              className={`mt-6 flex items-start gap-2 rounded-lg p-4 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}

              {message.text}

              {message?.type === "success" && (
                <Link
                  to="/cart"
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Shopping Cart
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || addingToCart}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-indigo-600 px-6 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            <ShoppingCart size={20} />

            {addingToCart
              ? "Adding to Cart..."
              : outOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Secure shopping experience with QA-Shop.
          </p>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;