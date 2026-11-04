import { useEffect, useState } from "react";

import api from "../../services/api";

const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchOrders = async () => {
      try {
        const response = await api.get("/admin/orders");

        if (!ignore) {
          setOrders(response.data.orders || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ||
            "Unable to retrieve orders."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      ignore = true;
    };
  }, []);

  const updateStatus = async (orderId, status) => {
    setError("");
    setSuccess("");

    try {
      setUpdatingId(orderId);

      const response = await api.put(
        `/admin/orders/${orderId}`,
        { status }
      );

      const updatedOrder =
        response.data.order || { status };

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      );

      setSuccess(`Order #${orderId} status updated.`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  if (loading) {
    return <p className="p-8 text-gray-500">Loading orders...</p>;
  }

  return (
    <div className="space-y-6">

      <div>
        <p className="font-semibold text-indigo-600">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Order Management
        </h1>

        <p className="mt-2 text-gray-500">
          Review customer purchases and manage order statuses.
        </p>
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

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Products</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100">

                <td className="p-4 font-semibold">
                  #{order.id}
                </td>

                <td className="p-4">
                  <p className="font-medium text-gray-900">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {order.user?.email}
                  </p>
                </td>

                <td className="p-4">
                  {order.items?.length || 0}
                </td>

                <td className="p-4 font-medium">
                  {formatPrice(order.totalAmount)}
                </td>

                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                    {order.status}
                  </span>
                </td>

                <td className="p-4">
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      updateStatus(order.id, event.target.value)
                    }
                    aria-label={`Update status for order ${order.id}`}
                    className="rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-indigo-600 disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {orders.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No customer orders found.
          </p>
        )}

      </div>

    </div>
  );
}

export default AdminOrders;