import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Package,
  ShoppingCart,
  Clock,
  ArrowRight,
  Boxes,
} from "lucide-react";

import api from "../../services/api";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      try {
        const [productResponse, orderResponse] =
          await Promise.all([
            api.get("/products"),
            api.get("/admin/orders"),
          ]);

        if (!ignore) {
          setProducts(productResponse.data);
          setOrders(orderResponse.data.orders || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to load dashboard information."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  ).length;

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const statistics = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Low Stock Products",
      value: lowStockProducts,
      icon: Boxes,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <p className="font-semibold text-indigo-600">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your store and monitor its activity.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={25} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <Link
            to="/admin/products"
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <Package className="text-indigo-600" size={28} />

              <h3 className="mt-4 font-bold text-gray-900">
                Manage Products
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create, edit, and delete store products.
              </p>
            </div>

            <ArrowRight className="text-gray-400" />
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <ShoppingCart className="text-indigo-600" size={28} />

              <h3 className="mt-4 font-bold text-gray-900">
                Manage Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review purchases and update order statuses.
              </p>
            </div>

            <ArrowRight className="text-gray-400" />
          </Link>

        </div>
      </section>

      {/* Recent Orders */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Orders
          </h2>

          <Link
            to="/admin/orders"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No orders available.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100"
                  >
                    <td className="py-4 font-medium">
                      #{order.id}
                    </td>

                    <td className="py-4">
                      {order.user?.firstName || "Customer"}{" "}
                      {order.user?.lastName || ""}
                    </td>

                    <td className="py-4">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminDashboard;