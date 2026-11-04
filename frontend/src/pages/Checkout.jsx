import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MapPin,
} from "lucide-react";

import api from "../services/api";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadCart = async () => {
      try {
        const response = await api.get("/cart");
        const cartData = response.data.cart || response.data;

        if (!ignore) {
          setCart(cartData);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to retrieve your cart."
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
  }, []);

  const items = cart?.items || [];

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.product?.price || 0) * item.quantity,
    0
  );

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setError("");

    if (!shippingAddress.trim()) {
      setError("Please enter your shipping address.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/orders", {
        shippingAddress: shippingAddress.trim(),
      });

      const order = response.data.order;

      navigate(`/orders/${order.id}`, {
        replace: true,
        state: {
          orderPlaced: true,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <ShoppingBag size={60} className="text-gray-300" />

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Nothing to checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Your shopping cart is currently empty.
        </p>

        <Link
          to="/products"
          className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">

      <Link
        to="/cart"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to Cart
      </Link>

      <div className="mb-10">
        <p className="font-semibold text-indigo-600">
          Final Step
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Confirm your delivery information and order.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">

        {/* Shipping Information */}
        <section className="lg:col-span-2">

          <div className="rounded-xl border border-gray-200 bg-white p-6">

            <div className="mb-6 flex items-center gap-3">
              <MapPin className="text-indigo-600" size={22} />

              <h2 className="text-xl font-bold text-gray-900">
                Shipping Information
              </h2>
            </div>

            <form onSubmit={handlePlaceOrder}>

              <label
                htmlFor="shippingAddress"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Complete Shipping Address
              </label>

              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(event) =>
                  setShippingAddress(event.target.value)
                }
                placeholder="Enter your house number, street, barangay, city, province, and postal code."
                rows={5}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-gray-400">
                Please provide a complete and accurate delivery address.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  "Placing Order..."
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

            </form>

          </div>

        </section>

        {/* Order Summary */}
        <aside className="rounded-xl border border-gray-200 bg-white p-6">

          <h2 className="text-xl font-bold text-gray-900">
            Order Summary
          </h2>

          <div className="mt-6 space-y-5">

            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4"
              >

                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">

                  {item.product?.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {item.product?.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(
                    Number(item.product?.price || 0) * item.quantity
                  )}
                </p>

              </div>
            ))}

          </div>

          <div className="my-6 border-t border-gray-200" />

          <div className="flex justify-between">
            <span className="font-medium text-gray-600">
              Subtotal
            </span>

            <span className="font-semibold text-gray-900">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="mt-4 flex justify-between">
            <span className="font-medium text-gray-600">
              Shipping
            </span>

            <span className="text-sm text-gray-500">
              Not included
            </span>
          </div>

          <div className="my-6 border-t border-gray-200" />

          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">
              Order Total
            </span>

            <span className="text-xl font-bold text-indigo-600">
              {formatPrice(subtotal)}
            </span>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            The backend calculates and validates the final order total during checkout.
          </p>

        </aside>

      </div>

    </main>
  );
}

export default Checkout;