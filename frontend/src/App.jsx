import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

// Customer Store Layout
function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Customer Storefront */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Products />} />

            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* Authenticated Customer Pages */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />

              <Route path="/checkout" element={<Checkout />} />

              <Route path="/orders" element={<Orders />} />

              <Route
                path="/orders/:id"
                element={<OrderDetails />}
              />
            </Route>
          </Route>

          {/* Administrator Pages */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route
                path="products"
                element={<AdminProducts />}
              />

              <Route
                path="orders"
                element={<AdminOrders />}
              />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;