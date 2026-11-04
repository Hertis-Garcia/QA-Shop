import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-white">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/products" element={<Products />} />

              <Route path="/products/:id" element={<ProductDetails />} />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
              </Route>

            
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />

                <Route path="/checkout" element={<Checkout />} />

                <Route path="/orders" element={<Orders />} />

                <Route path="/orders/:id" element={<OrderDetails />} />
              </Route>

            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;