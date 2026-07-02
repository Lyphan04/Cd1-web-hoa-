import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Tag,
    Star,
    FileText,
    LogOut,
    ChevronRight,
    Menu,
    Users,
    Ticket,
    Truck,
    Settings,
    BarChart3
} from "lucide-react";
import { useState } from "react";

const adminNav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/san-pham", label: "Sản phẩm hoa", icon: Package },
    { to: "/admin/danh-muc", label: "Danh mục", icon: Tag },
    { to: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingBag },
    { to: "/admin/nguoi-dung", label: "Khách hàng", icon: Users },
    { to: "/admin/danh-gia", label: "Đánh giá", icon: Star },
    { to: "/admin/blog", label: "Tin tức & Blog", icon: FileText },
    { to: "/admin/khuyen-mai", label: "Khuyến mãi", icon: Ticket },
    { to: "/admin/van-chuyen", label: "Vận chuyển", icon: Truck },
    { to: "/admin/cai-dat", label: "Cài đặt hệ thống", icon: Settings },
    { to: "/admin/bao-cao", label: "Báo cáo thống kê", icon: BarChart3 }
];

export default function AdminLayout() {
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(false);

    if (!user || user.role !== "Admin") {
        return <Navigate to="/dang-nhap" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Toaster position="top-right" toastOptions={{ duration: 200 }} />

            {/* Sidebar */}
            <aside
                className={`${collapsed ? "w-16" : "w-60"
                    } flex-shrink-0 bg-white border-r border-gray-100 flex flex-col transition-all duration-200`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
                    {!collapsed && (
                        <span className="font-bold text-gray-900">🌸 Flower Admin</span>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto p-1 rounded hover:bg-gray-100"
                    >
                        {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {adminNav.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? "bg-pink-100 text-pink-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-gray-100">
                    {!collapsed && (
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 font-bold text-sm">
                                {user?.fullName?.[0]}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-[10px] text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={16} />
                        {!collapsed && "Đăng xuất"}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6">
                    <h1 className="text-base font-semibold text-gray-800">
                        Quản trị Shop Hoa
                    </h1>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}