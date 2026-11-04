import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";

import api from "../services/api";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);

  const fetchCart = useCallback(async () => {
    const response = await api.get("/cart");

    return response.data.cart || response.data;
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCart = async () => {
      try {
        const cartData = await fetchCart();

        if (!ignore) {
          setCart(cartData);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
              "Unable to retrieve your shopping cart.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      ignore = true;
    };
  }, [fetchCart]);

  const items = cart?.items || [];

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const getItemSubtotal = (item) => {
    return Number(item.product?.price || 0) * item.quantity;
  };

  const cartTotal = items.reduce(
    (total, item) => total + getItemSubtotal(item),
    0,
  );

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItem(item.id);

      await api.put(`/cart/${item.id}`, {
        quantity: newQuantity,
      });

      const updatedCart = await fetchCart();
      setCart(updatedCart);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update product quantity.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);

      await api.delete(`/cart/${itemId}`);

      const updatedCart = await fetchCart();
      setCart(updatedCart);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove product from cart.",
      );
    } finally {
      setUpdatingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="font-semibold text-indigo-600">Your Shopping Bag</p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">Shopping Cart</h1>

        <p className="mt-2 text-gray-500">
          Review and manage your selected products.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-20 text-center">
          <ShoppingBag size={64} strokeWidth={1} className="text-gray-300" />

          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-2 text-gray-500">
            You haven't added any products to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-5 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row"
              >
                {/* Product Image */}
                <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 sm:w-32">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag size={40} className="text-gray-300" />
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product?.name || "Product"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.product?.category?.name || "General"}
                    </p>

                    <p className="mt-2 font-semibold text-indigo-600">
                      {formatPrice(item.product?.price)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        disabled={
                          item.quantity <= 1 || updatingItem === item.id
                        }
                        aria-label={`Decrease quantity of ${item.product?.name}`}
                        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-6 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                        aria-label={`Increase quantity of ${item.product?.name}`}
                        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Subtotal and Remove */}
                    <div className="flex items-center gap-5">
                      <span className="font-bold text-gray-900">
                        {formatPrice(getItemSubtotal(item))}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingItem === item.id}
                        aria-label={`Remove ${item.product?.name}`}
                        className="text-red-500 transition hover:text-red-700 disabled:opacity-40"
                      >
                        <Trash2 size={19} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              <ArrowRight size={17} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({items.length})</span>

                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Subtotal</span>

                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(cartTotal)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Shipping and other charges will be calculated during checkout.
                </p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cart;
