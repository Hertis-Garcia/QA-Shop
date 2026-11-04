import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowLeft,
  MapPin,
} from "lucide-react";

import api from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderPlaced = location.state?.orderPlaced;

  useEffect(() => {
    let ignore = false;

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);

        if (!ignore) {
          setOrder(response.data.order || response.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to retrieve order details."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      ignore = true;
    };
  }, [id]);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">

        <Package size={55} className="text-gray-300" />

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Order Not Found
        </h1>

        <p className="mt-2 text-gray-500">
          {error || "This order could not be found."}
        </p>

        <Link
          to="/orders"
          className="mt-6 text-indigo-600 hover:underline"
        >
          Return to My Orders
        </Link>

      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">

      {orderPlaced && (
        <div className="mb-10 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">

          <CheckCircle
            size={60}
            className="mx-auto text-green-600"
          />

          <h1 className="mt-5 text-3xl font-bold text-green-800">
            Order Placed Successfully!
          </h1>

          <p className="mt-3 text-green-700">
            Thank you for shopping with QA-Shop.
            Your order has been successfully submitted.
          </p>

          <p className="mt-2 text-sm text-green-700">
            Order Reference: #{order.id}
          </p>

        </div>
      )}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="font-semibold text-indigo-600">
            Order Information
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Order #{order.id}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <span className="w-fit rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
          {order.status}
        </span>

      </div>

      {/* Shipping Address */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">

        <div className="mb-4 flex items-center gap-3">
          <MapPin size={22} className="text-indigo-600" />

          <h2 className="text-lg font-bold text-gray-900">
            Shipping Address
          </h2>
        </div>

        <p className="leading-relaxed text-gray-600">
          {order.shippingAddress}
        </p>

      </section>

      {/* Ordered Products */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <div className="mb-6 flex items-center gap-3">
          <Package size={22} className="text-indigo-600" />

          <h2 className="text-lg font-bold text-gray-900">
            Ordered Products
          </h2>
        </div>

        <div className="space-y-5">

          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center"
            >

              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.product?.name || "Product"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Unit Price: {formatPrice(item.price)}
                </p>
              </div>

              <p className="font-bold text-gray-900">
                {formatPrice(Number(item.price) * item.quantity)}
              </p>

            </div>
          ))}

        </div>

        <div className="mt-6 flex justify-between">
          <span className="text-lg font-bold text-gray-900">
            Order Total
          </span>

          <span className="text-xl font-bold text-indigo-600">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

      </section>

      <div className="mt-8 flex flex-wrap gap-4">

        <Link
          to="/orders"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          View My Orders
        </Link>

        <Link
          to="/products"
          className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Continue Shopping
        </Link>

      </div>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Back to Home
      </Link>

    </main>
  );
}

export default OrderDetails;