import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";
import Footer from "../../components/layout/Footer";

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col md:flex-row">

        {/* Admin Sidebar */}
        <aside className="flex w-full flex-col border-b border-gray-200 bg-white p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">

          {/* Logo */}
          <Link
            to="/admin"
            className="mb-10 flex items-center gap-2"
          >
            <Store size={25} className="text-indigo-600" />

            <span className="text-xl font-bold text-gray-900">
              QA-Shop
            </span>
          </Link>

          {/* Navigation */}
          <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Administration
          </p>

          <nav className="flex flex-col gap-2">

            <NavLink
              to="/admin"
              end
              className={navClass}
            >
              <LayoutDashboard size={19} />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/products"
              className={navClass}
            >
              <Package size={19} />
              Products
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={navClass}
            >
              <ShoppingCart size={19} />
              Orders
            </NavLink>

          </nav>

          {/* Sidebar Bottom Actions */}
          <div className="mt-8 border-t border-gray-100 pt-5">

            {/* Back to Store */}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
            >
              <Store size={18} />
              Back to Store
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

        </aside>

        {/* Admin Main Content */}
        <main className="min-w-0 flex-1 p-6 md:p-10">
          <Outlet />
        </main>

      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default AdminLayout;