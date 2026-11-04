import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");

        if (!ignore) {
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to retrieve your orders."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading your orders...
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12">

      <div className="mb-10">
        <p className="font-semibold text-indigo-600">
          Purchase History
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        <p className="mt-2 text-gray-500">
          Review your previous purchases and order status.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-20 text-center">

          <ShoppingBag size={60} className="text-gray-300" />

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            No orders yet
          </h2>

          <p className="mt-2 text-gray-500">
            Your completed purchases will appear here.
          </p>

          <Link
            to="/products"
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Start Shopping
          </Link>

        </div>
      )}

      <div className="space-y-5">

        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div className="flex items-start gap-4">

                <div className="rounded-lg bg-indigo-50 p-3">
                  <Package className="text-indigo-600" size={24} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">
                    Order #{order.id}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {order.items?.length || 0} product types
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap items-center gap-5">

                <div>
                  <p className="text-xs text-gray-500">
                    Total Amount
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[order.status] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>

                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Details
                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}

export default Orders;