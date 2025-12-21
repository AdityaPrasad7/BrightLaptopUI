import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import RefurbishedLaptops from "./pages/RefurbishedLaptops";
import NewLaptops from "./pages/NewLaptops";
import ProductDetailEnhanced from "./pages/ProductDetailEnhanced";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Business from "./pages/Business";
import Startups from "./pages/Startups";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import OrderDetail from "./pages/OrderDetail";
import { getCartCount } from "./mockData";

function App() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Header cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Home onCartUpdate={updateCartCount} />} />
          <Route path="/all-products" element={<AllProducts onCartUpdate={updateCartCount} />} />
          <Route path="/refurbished-laptops" element={<RefurbishedLaptops onCartUpdate={updateCartCount} />} />
          <Route path="/new-laptops" element={<NewLaptops onCartUpdate={updateCartCount} />} />
          <Route path="/product/:id" element={<ProductDetailEnhanced onCartUpdate={updateCartCount} />} />
          <Route path="/cart" element={<Cart onCartUpdate={updateCartCount} />} />
          <Route path="/checkout" element={<Checkout onCartUpdate={updateCartCount} />} />
          <Route path="/about" element={<About />} />
          <Route path="/business" element={<Business />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:slug" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
