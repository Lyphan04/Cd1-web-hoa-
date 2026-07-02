import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'
import ScrollToTop from './components/common/ScrollToTop'

import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import WishlistPage from './pages/WishlistPage'
import VnPayReturnPage from './pages/VnPayReturnPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import PolicyPage from './pages/PolicyPage'
import GalleryPage from './pages/GalleryPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReviews from './pages/admin/AdminReviews'
import AdminBlog from './pages/admin/AdminBlog'
import AdminUsers from './pages/admin/AdminUsers'
import AdminVouchers from './pages/admin/AdminVouchers'
import AdminShipping from './pages/admin/AdminShipping'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReports from './pages/admin/AdminReports'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function App() {

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <ScrollToTop />

                <Routes>

                    {/* CUSTOMER */}
                    <Route element={<CustomerLayout />}>

                        <Route path="/" element={<HomePage />} />

                        <Route path="/hoa" element={<ProductListPage />} />

                        <Route path="/hoa/:slug" element={<ProductDetailPage />} />

                        <Route path="/gio-hang" element={<CartPage />} />

                        <Route path="/thanh-toan" element={<CheckoutPage />} />

                        <Route path="/wishlist" element={<WishlistPage />} />

                        <Route path="/blog" element={<BlogPage />} />

                        <Route path="/blog/:slug" element={<BlogDetailPage />} />

                        <Route path="/bo-hoa" element={<ProductListPage />} />

                        <Route path="/chinh-sach" element={<PolicyPage />} />

                        <Route path="/chinh-sach/:type" element={<PolicyPage />} />

                        <Route path="/gallery/:slug" element={<GalleryPage />} />

                        <Route path="/tai-khoan" element={<ProfilePage />} />

                        <Route path="/don-hang" element={<OrdersPage />} />

                        <Route path="/gioi-thieu" element={<AboutPage />} />

                        <Route path="/lien-he" element={<ContactPage />} />

                    </Route>

                    {/* LOGIN */}
                    <Route path="/dang-nhap" element={<LoginPage />} />

                    <Route path="/dang-ky" element={<LoginPage />} />

                    {/* VNPAY */}
                    <Route path="/checkout/vnpay-return" element={<VnPayReturnPage />} />

                    {/* ADMIN */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="san-pham" element={<AdminProducts />} />
                        <Route path="danh-muc" element={<AdminCategories />} />
                        <Route path="don-hang" element={<AdminOrders />} />
                        <Route path="nguoi-dung" element={<AdminUsers />} />
                        <Route path="danh-gia" element={<AdminReviews />} />
                        <Route path="blog" element={<AdminBlog />} />
                        <Route path="khuyen-mai" element={<AdminVouchers />} />
                        <Route path="van-chuyen" element={<AdminShipping />} />
                        <Route path="cai-dat" element={<AdminSettings />} />
                        <Route path="bao-cao" element={<AdminReports />} />
                    </Route>

                    {/* FALLBACK */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>

            </BrowserRouter>
        </GoogleOAuthProvider>
    )
}