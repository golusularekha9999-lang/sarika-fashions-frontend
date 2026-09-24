import React from 'react'
import { Routes, Route } from 'react-router-dom'

import ScrollToTop from './components/ScrollToTop.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import MainLayout from './layouts/MainLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

/* ============================================================
   PUBLIC PAGES
============================================================ */

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Checkout from './pages/Checkout.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'

import TrackOrder from './pages/TrackOrder.jsx'
import ShippingReturns from './pages/ShippingReturns.jsx'
import FAQs from './pages/FAQs.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import RefundPolicy from './pages/RefundPolicy.jsx'
import ShippingPolicy from './pages/ShippingPolicy.jsx'


/* ============================================================
   ADMIN PAGES
============================================================ */

import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminAddProduct from './pages/admin/AdminAddProduct.jsx'
import AdminInfo from './pages/admin/AdminInfo.jsx'
import AdminEditProduct from './pages/admin/AdminEditProduct.jsx'
import AdminReturns from './pages/admin/AdminReturns.jsx'


function App() {
  return (
    <>
      {/* ======================================================
          GLOBAL SCROLL
      ====================================================== */}

      <ScrollToTop />

      <Routes>

        {/* ====================================================
            PUBLIC WEBSITE
        ==================================================== */}

        <Route element={<MainLayout />}>

          {/* ================= HOME ================= */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* ================= SHOP ================= */}

          <Route
            path="/shop"
            element={<Shop />}
          />


          {/* ================= PRODUCT DETAILS ================= */}

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />


          {/* ================= CART ================= */}

          <Route
            path="/cart"
            element={<Cart />}
          />


          {/* ================= WISHLIST ================= */}

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />


          {/* ================= CHECKOUT ================= */}

          <Route
            path="/checkout"
            element={<Checkout />}
          />


          {/* ==================================================
              MY ORDERS
          ================================================== */}

          <Route
            path="/my-orders"
            element={<MyOrders />}
          />


          {/* ================= REGISTER ================= */}

          <Route
            path="/register"
            element={<Register />}
          />


          {/* ================= ABOUT ================= */}

          <Route
            path="/about"
            element={<About />}
          />


          {/* ================= CONTACT ================= */}

          <Route
            path="/contact"
            element={<Contact />}
          />


          {/* ================= TRACK ORDER ================= */}

          <Route
            path="/track-order"
            element={<TrackOrder />}
          />


          {/* ================= SHIPPING & RETURNS ================= */}

          <Route
            path="/shipping-returns"
            element={<ShippingReturns />}
          />


          {/* ================= FAQ ================= */}

          <Route
            path="/faqs"
            element={<FAQs />}
          />


          {/* ================= PRIVACY ================= */}

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />


          {/* ================= TERMS ================= */}

          <Route
            path="/terms"
            element={<Terms />}
          />


          {/* ================= REFUND POLICY ================= */}

          <Route
            path="/refund-policy"
            element={<RefundPolicy />}
          />


          {/* ================= SHIPPING POLICY ================= */}

          <Route
            path="/shipping-policy"
            element={<ShippingPolicy />}
          />


          {/* ==================================================
              PUBLIC 404
          ================================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Route>


        {/* ====================================================
            ADMIN LOGIN
            PUBLIC
        ==================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* ====================================================
            PROTECTED ADMIN AREA
        ==================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            <Route
              index
              element={<AdminDashboard />}
            />


            {/* =================================================
                ADMIN PRODUCTS
            ================================================= */}

            <Route
              path="products"
              element={<AdminProducts />}
            />


            {/* =================================================
                ADD PRODUCT
            ================================================= */}

            <Route
              path="products/add"
              element={<AdminAddProduct />}
            />


            {/* =================================================
                EDIT PRODUCT
            ================================================= */}

            <Route
              path="products/:id/edit"
              element={<AdminEditProduct />}
            />


            {/* =================================================
                ADMIN ORDERS
            ================================================= */}

            <Route
              path="orders"
              element={<AdminOrders />}
            />


            {/* =================================================
                ADMIN RETURN REQUESTS
            ================================================= */}

            <Route
              path="returns"
              element={<AdminReturns />}
            />


            {/* =================================================
                CUSTOMERS
            ================================================= */}

            <Route
              path="customers"
              element={<AdminInfo />}
            />


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <Route
              path="categories"
              element={<AdminInfo />}
            />

          </Route>

        </Route>

      </Routes>
    </>
  )
}

export default App