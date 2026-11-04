import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./context/AuthProvider";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />
            </Routes>
          </main>

          <Footer />

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;