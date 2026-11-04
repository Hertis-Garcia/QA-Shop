import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>

      <div className="flex min-h-screen flex-col bg-white">

        <Navbar />

        <main className="flex-1">
          <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/products" element={<Products />} />

          </Routes>
        </main>

        <Footer />

      </div>

    </BrowserRouter>
  );
}

export default App;