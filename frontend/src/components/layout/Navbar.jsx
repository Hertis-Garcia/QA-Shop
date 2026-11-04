import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Store,
  User,
  LogOut,
} from "lucide-react";

import { useAuth } from "../../context/useAuth";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "font-semibold text-indigo-600"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Store size={26} className="text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">QA-Shop</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
        </div>

        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:block">
                Hello, {user.firstName}
              </span>

              <Link
                to="/orders"
                className="hidden text-sm text-gray-600 transition hover:text-indigo-600 sm:block"
              >
                My Orders
              </Link>

              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="text-gray-600 hover:text-indigo-600"
              >
                <ShoppingCart size={22} />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/cart"
                aria-label="Shopping cart"
                className="text-gray-600 hover:text-indigo-600"
              >
                <ShoppingCart size={22} />
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                <User size={17} />
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;