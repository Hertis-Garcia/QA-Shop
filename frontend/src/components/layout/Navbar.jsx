import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Store, User } from "lucide-react";

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "text-indigo-600 font-semibold"
        : "text-gray-600 hover:text-indigo-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Store size={26} className="text-indigo-600" />

          <span className="text-xl font-bold text-gray-900">
            QA-Shop
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <Link
            to="/cart"
            className="relative text-gray-600 hover:text-indigo-600"
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
        </div>

      </nav>
    </header>
  );
}

export default Navbar;