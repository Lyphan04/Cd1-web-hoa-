import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Heart,
    Search,
    Menu,
    X,
    LogOut,
    ChevronDown,
    Phone
} from "lucide-react";

import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCategoriesStore } from "../../store/categoriesStore";
import toast from "react-hot-toast";

const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/hoa", label: "Sản phẩm", hasDropdown: false },
    { to: "/bo-suu-tap", label: "Bộ sưu tập", hasDropdown: true },
    { to: "/blog", label: "Tin tức" },
    { to: "/lien-he", label: "Liên hệ" }
];

export default function Header() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchVal, setSearchVal] = useState("");

    const navigate = useNavigate();

    const items = useCartStore(s => s.items);
    const totalItems = items.reduce((s, i) => s + i.quantity, 0);

    const { user, logout } = useAuthStore();

    const wishlistIds = useWishlistStore(s => s.ids);
    const fetchWishlistIfNeeded = useWishlistStore(s => s.fetchIfNeeded);
    const resetWishlist = useWishlistStore(s => s.reset);

    const { categories, fetchIfEmpty } = useCategoriesStore();

    useEffect(() => {
        fetchIfEmpty();
    }, [fetchIfEmpty]);

    useEffect(() => {
        if (user) {
            fetchWishlistIfNeeded();
        } else {
            resetWishlist();
        }
    }, [user, fetchWishlistIfNeeded, resetWishlist]);

    const quickCategories = categories.slice(0, 5);

    function handleSearch(e) {
        e.preventDefault();

        if (searchVal.trim()) {
            navigate(`/hoa?q=${encodeURIComponent(searchVal.trim())}`);
            setSearchOpen(false);
            setSearchVal("");
        }
    }

    return (
        <>
            {/* Top bar */}
            <div className="hidden md:block bg-pink-600 text-white">
                <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                        <Phone size={12} />
                        Hotline: <strong>0922 222 686</strong> · Giao hoa nhanh trong ngày
                    </span>

                    <div className="flex gap-4">
                        <Link to="/lien-he">Liên hệ</Link>
                        <Link to="/blog">Tin tức</Link>
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mr-4">
                        <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center text-lg">
                            🌸
                        </div>

                        <div className="hidden sm:block">
                            <span className="block font-bold text-pink-600 text-base">
                                Lyp Flower
                            </span>
                            <span className="text-xs text-gray-500">
                                Fresh Flower Store
                            </span>
                        </div>
                    </Link>

                    {/* Menu */}
                    <nav className="hidden lg:flex flex-1 items-center gap-2">
                        {navLinks.map(l => (
                            <div key={l.to} className="relative group">

                                <NavLink
                                    to={l.to}
                                    end={l.to === "/"}
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-sm rounded-lg flex items-center gap-1 ${isActive
                                            ? "bg-pink-100 text-pink-600"
                                            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                                        }`
                                    }
                                >
                                    {l.label}
                                    {l.hasDropdown && <ChevronDown size={14} />}
                                </NavLink>

                                {l.hasDropdown && quickCategories.length > 0 && (
                                    <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border py-2 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition">

                                        {quickCategories.map(cat => (
                                            <Link
                                                key={cat.slug}
                                                to={`/hoa?category=${cat.slug}`}
                                                className="block px-4 py-2 text-sm hover:bg-pink-50"
                                            >
                                                🌸 {cat.name}
                                            </Link>
                                        ))}

                                    </div>
                                )}

                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">

                        <button
                            onClick={() => setSearchOpen(v => !v)}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Search size={18} />
                        </button>

                        <Link to="/wishlist" className="relative p-2">
                            <Heart size={18} />
                            {wishlistIds.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {wishlistIds.length}
                                </span>
                            )}
                        </Link>

                        <Link to="/gio-hang" className="relative p-2">
                            <ShoppingCart size={18} />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group">
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 pr-3 rounded-full transition">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border border-pink-200 uppercase">
                                        {user.fullName?.[0] || 'U'}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:flex items-center gap-1">
                                        {user.fullName?.split(' ').pop()}
                                        <ChevronDown size={14} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
                                    </span>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-pink-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-2 z-50">
                                    <div className="p-4 border-b border-gray-50 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-bold uppercase mb-2 shadow-inner">
                                            {user.fullName?.[0] || 'U'}
                                        </div>
                                        <p className="font-bold text-gray-800 line-clamp-1">{user.fullName}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{user.email}</p>
                                        <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${user.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {user.role === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
                                        </span>
                                    </div>

                                    <div className="p-2 space-y-0.5">
                                        {user.role === 'Admin' ? (
                                            <>
                                                <Link to="/admin" className="block px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 rounded-lg hover:text-pink-600 transition-colors">Bảng điều khiển</Link>
                                                <Link to="/admin/don-hang" className="block px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 rounded-lg hover:text-pink-600 transition-colors">Quản lý Đơn hàng</Link>
                                                <Link to="/admin/san-pham" className="block px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 rounded-lg hover:text-pink-600 transition-colors">Quản lý Sản phẩm</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/tai-khoan" className="block px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 rounded-lg hover:text-pink-600 transition-colors">Tài khoản của tôi</Link>
                                                <Link to="/don-hang" className="block px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 rounded-lg hover:text-pink-600 transition-colors">Đơn hàng của tôi</Link>
                                            </>
                                        )}
                                    </div>

                                    <div className="p-2 border-t border-gray-50">
                                        <button
                                            onClick={() => {
                                                logout();
                                                toast.success("Đã đăng xuất thành công");
                                                navigate('/');
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:bg-red-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
                                        >
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/dang-nhap"
                                className="text-sm border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-semibold px-4 py-1.5 rounded-full transition-all"
                            >
                                Đăng nhập
                            </Link>
                        )}

                        <button
                            className="lg:hidden p-2"
                            onClick={() => setMenuOpen(v => !v)}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                    </div>
                </div>

                {/* Search */}
                {searchOpen && (
                    <div className="border-t p-3 bg-white">
                        <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">

                            <input
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                placeholder="Tìm hoa sinh nhật, hoa khai trương..."
                                className="flex-1 border rounded px-3 py-2 text-sm"
                            />

                            <button className="bg-pink-500 text-white px-4 rounded text-sm">
                                Tìm
                            </button>

                        </form>
                    </div>
                )}

            </header>
        </>
    );
}