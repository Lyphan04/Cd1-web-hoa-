import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { 
    ChevronLeft, ShoppingBag, Clock, CheckCircle2, Package, XCircle, ChevronRight, X
} from "lucide-react"
import { orderApi } from "../api/orders"
import { formatVnd } from "../utils/format"
import { resolveImage } from "../utils/imageResolver"
import toast from "react-hot-toast"

export default function OrdersPage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const [filterStatus, setFilterStatus] = useState("all")

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate("/dang-nhap")
            return
        }

        setLoadingOrders(true)
        orderApi.getMyOrders()
            .then(res => setOrders(res))
            .catch(() => toast.error("Không thể tải lịch sử đơn hàng"))
            .finally(() => setLoadingOrders(false))
    }, [user, navigate])

    if (!user) return null

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={12} /> };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={12} /> };
            case 'processing': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Clock size={12} /> };
            case 'shipping': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Package size={12} /> };
            case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={12} /> };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: <Clock size={12} /> };
        }
    }

    const handleViewOrder = async (id) => {
        try {
            const data = await orderApi.getOrder(id)
            setSelectedOrder(data)
            setShowOrderModal(true)
        } catch (err) {
            toast.error("Không thể lấy chi tiết đơn hàng")
        }
    }

    const handleCancelOrder = async (id) => {
        if (!confirm("Bạn có chắc chắn muốn huỷ đơn hàng này?")) return;
        setIsCancelling(true)
        try {
            await orderApi.cancelOrder(id)
            toast.success("Huỷ đơn hàng thành công")
            setShowOrderModal(false)
            setLoadingOrders(true)
            const res = await orderApi.getMyOrders()
            setOrders(res)
            setLoadingOrders(false)
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi huỷ đơn hàng")
        } finally {
            setIsCancelling(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        if (filterStatus === "all") return true;
        const status = order.status?.toLowerCase() || "";
        if (filterStatus === "processing") return status === "pending" || status === "processing";
        return status === filterStatus;
    });

    const orderTabs = [
        { id: "all", label: "Tất cả" },
        { id: "processing", label: "Đang xử lý" },
        { id: "shipping", label: "Đang giao" },
        { id: "completed", label: "Hoàn thành" },
        { id: "cancelled", label: "Đã huỷ" }
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFD] py-6 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate("/tai-khoan")}
                    className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors text-[10px] font-black uppercase tracking-widest group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Quay về tài khoản
                </button>

                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden min-h-[500px] p-6 md:p-10">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-8">
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Lịch sử của bạn</h1>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Những món quà yêu thương bạn đã dành tặng</p>
                        </header>

                        {/* Order Status Filters */}
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                            {orderTabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setFilterStatus(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filterStatus === tab.id ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {tab.label}
                                    {tab.id === 'all' && <span className="ml-1 opacity-50">({orders.length})</span>}
                                </button>
                            ))}
                        </div>

                        {loadingOrders ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <div className="space-y-4">
                                {filteredOrders.map(order => {
                                    const status = getStatusStyle(order.status);
                                    return (
                                        <div 
                                            key={order.id} 
                                            onClick={() => handleViewOrder(order.id)}
                                            className="group p-5 border border-gray-100 rounded-3xl hover:border-pink-50 hover:bg-white hover:shadow-xl hover:shadow-pink-50/10 transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                                        <Package size={22} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm">Đơn hàng #{order.id}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${status.bg} ${status.text}`}>
                                                                {status.icon} {order.status}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-bold tracking-tight">• {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Tổng giá trị</p>
                                                        <p className="font-black text-pink-500 text-lg">{formatVnd(order.finalAmount)}</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full border border-gray-50 flex items-center justify-center text-gray-300 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all">
                                                        <ChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items Preview */}
                                            <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="flex-shrink-0 flex items-center gap-3 bg-gray-50/50 p-2 pr-4 rounded-2xl border border-gray-50 group-hover:bg-white group-hover:border-pink-50 transition-all">
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-white">
                                                            <img 
                                                                src={resolveImage(item.mainImageUrl || item.productImage)} 
                                                                alt={item.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-bold text-gray-700 truncate w-32">{item.productName}</p>
                                                            <div className="flex items-center justify-between mt-0.5">
                                                                <p className="text-[10px] text-gray-400 font-medium">x{item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4 border-2 border-dashed border-gray-50 rounded-[2.5rem] bg-gray-50/30">
                                <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto text-gray-300">
                                    <ShoppingBag size={40} />
                                </div>
                                <div>
                                    <p className="text-gray-900 font-bold uppercase tracking-widest text-sm">Chưa có đơn hàng nào</p>
                                    <p className="text-xs text-gray-400 mt-2">Hỗ trợ chọn hoa nhanh qua Zalo: 0967.823.155</p>
                                </div>
                                <button 
                                    onClick={() => navigate("/hoa")}
                                    className="inline-block mt-4 px-8 py-3.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-pink-500 transition-all shadow-xl shadow-gray-200 hover:shadow-pink-200"
                                >
                                    Khám phá cửa hàng
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-2 opacity-40">
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Bảo mật SSL 256-bit</p>
                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900">Chi tiết Đơn hàng #{selectedOrder.id}</h2>
                            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Trạng thái</p>
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg ${getStatusStyle(selectedOrder.status).bg} ${getStatusStyle(selectedOrder.status).text}`}>
                                        {getStatusStyle(selectedOrder.status).icon} {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Ngày đặt</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')} {new Date(selectedOrder.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Người nhận</p>
                                    <p className="font-bold text-gray-900 mb-1">{selectedOrder.receiverName}</p>
                                    <p className="text-sm text-gray-600 mb-1">{selectedOrder.receiverPhone}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{selectedOrder.receiverAddress}</p>
                                </div>
                                <div className="p-4 border border-gray-100 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Thanh toán</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tạm tính:</span>
                                            <span className="font-medium">{formatVnd(selectedOrder.totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phí giao hàng:</span>
                                            <span className="font-medium">{formatVnd(selectedOrder.shippingFee)}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <span className="font-bold">Tổng cộng:</span>
                                            <span className="font-black text-pink-500">{formatVnd(selectedOrder.finalAmount)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {selectedOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Card */}
                            {selectedOrder.messageCard && (
                                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase text-pink-400 tracking-wider mb-2">Lời nhắn</p>
                                    <p className="text-sm text-gray-800 italic">"{selectedOrder.messageCard}"</p>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Sản phẩm</p>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl">
                                            <img src={resolveImage(item.mainImageUrl || item.productImage)} alt={item.productName} className="w-16 h-16 object-cover rounded-lg" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{item.productName}</h4>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">x{item.quantity}</span>
                                                    <span className="text-sm font-bold text-gray-900">{formatVnd(item.unitPrice)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing') && (
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                        disabled={isCancelling}
                                        className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCancelling ? "Đang huỷ..." : "Huỷ đơn hàng"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
