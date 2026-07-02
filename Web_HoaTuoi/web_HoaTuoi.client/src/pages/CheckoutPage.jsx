// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatVnd } from '../utils/format';
import { resolveImage } from '../utils/imageResolver';
import apiClient from '../api/client';
import { addressApi } from '../api/addresses';
import toast from 'react-hot-toast';
import { MapPin, QrCode, Banknote, X, CheckCircle, User, Phone, MessageSquare, Calendar, ChevronRight, ShoppingBag, CreditCard, Truck, ArrowLeft } from 'lucide-react';

// ============================================================
// Modal QR thanh toán - Gọn nhẹ, chuyên nghiệp
// ============================================================
function QrPaymentModal({ qrInfo, onClose, onConfirm }) {
  const [countdown, setCountdown] = useState(300);

  const qrImageUrl = `https://img.vietqr.io/image/${qrInfo.bankId}-${qrInfo.accountNumber}-qr_only.png?amount=${qrInfo.amount}&addInfo=${encodeURIComponent(qrInfo.description)}&accountName=${encodeURIComponent(qrInfo.accountName)}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(countdown / 60)).padStart(2, '0');
  const seconds = String(countdown % 60).padStart(2, '0');
  const isUrgent = countdown <= 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         style={{ animation: 'fadeIn 0.2s ease' }}>
      <div style={{ width:'100%', maxWidth:'380px', borderRadius:'28px', overflow:'hidden', boxShadow:'0 25px 70px rgba(0,0,0,0.4)', background:'white', animation:'scaleIn 0.25s ease' }}>

        {/* Header xanh lá */}
        <div style={{ background:'linear-gradient(135deg, #00874a 0%, #00b35a 100%)', padding:'16px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {/* Logo VCB */}
            <div style={{ background:'white', borderRadius:'8px', padding:'4px 10px', display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'18px', height:'18px', background:'#006933', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'white', fontSize:'9px', fontWeight:'900' }}>V</span>
              </div>
              <span style={{ color:'#006933', fontSize:'11px', fontWeight:'900' }}>Vietcombank</span>
            </div>
            {/* Countdown + Close */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ color: isUrgent ? '#ffcccc' : 'rgba(255,255,255,0.9)', fontSize:'15px', fontWeight:'700', fontFamily:'monospace' }}>
                {minutes}:{seconds}
              </span>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:'2px', background:'#e0ede7' }}>
          <div style={{ height:'100%', width:`${(countdown/300)*100}%`, background: isUrgent ? '#ff5252' : '#00b35a', transition:'width 1s linear, background 0.5s' }} />
        </div>

        {/* Body */}
        <div style={{ padding:'24px 24px 20px', textAlign:'center' }}>
          <p style={{ fontSize:'11px', color:'#bbb', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 16px' }}>
            Mở app ngân hàng · Quét QR
          </p>

          {/* QR Image */}
          <div style={{ display:'inline-flex', padding:'12px', border:'2px solid #e0f0e8', borderRadius:'20px', background:'#fff', boxShadow:'0 4px 25px rgba(0,140,70,0.1)', marginBottom:'8px' }}>
            <img
              src={qrImageUrl}
              alt="QR thanh toán"
              style={{ width:'320px', height:'320px', objectFit:'contain', borderRadius:'8px', display:'block' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            <div style={{ display:'none', width:'320px', height:'320px', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
              <QrCode size={80} style={{ color:'#00a550' }} />
              <span style={{ fontSize:'12px', color:'#999', textAlign:'center' }}>Không tải được QR.<br/>Vui lòng thử lại.</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding:'0 16px 18px', display:'grid', gridTemplateColumns:'1fr 1.7fr', gap:'8px' }}>
          <button onClick={onClose}
            style={{ padding:'10px', borderRadius:'12px', border:'1.5px solid #e8e8e8', background:'white', color:'#666', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}
            onMouseEnter={e => e.currentTarget.style.background='#f7f7f7'}
            onMouseLeave={e => e.currentTarget.style.background='white'}>
            <X size={12} /> Đóng
          </button>
          <button onClick={onConfirm}
            style={{ padding:'10px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#00b35a,#006933)', color:'white', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', boxShadow:'0 4px 14px rgba(0,160,80,0.3)', transition:'transform 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
            <CheckCircle size={13} /> Đã thanh toán
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9) translateY(14px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  );
}





// ============================================================
// Trang Checkout chính
// ============================================================
export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { state } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate(`/dang-nhap?from=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [user, navigate, location]);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrInfo, setQrInfo] = useState(null);
  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    messageCard: '',
    deliveryTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });
  const [isStorePickup, setIsStorePickup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('QrCode');
  const shippingFee = isStorePickup ? 0 : 30000;
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        receiverName: user.fullName || '',
        receiverPhone: user.phone || '',
        receiverAddress: user.address || '',
      }));

      addressApi.getAddresses()
        .then(res => {
          setSavedAddresses(res);
          const defaultAddr = res.find(a => a.isDefault);
          if (defaultAddr) {
            setForm(f => ({
              ...f,
              receiverName: defaultAddr.fullName,
              receiverPhone: defaultAddr.phoneNumber,
              receiverAddress: defaultAddr.addressLine,
            }));
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const handleSelectAddress = (addr) => {
    setForm(f => ({
      ...f,
      receiverName: addr.fullName,
      receiverPhone: addr.phoneNumber,
      receiverAddress: addr.addressLine,
    }));
  };

  const subtotal = state?.finalAmount ?? items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const finalAmount = subtotal + shippingFee;

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handlePlaceOrder() {
    if (submitted) return;
    if (!form.receiverName || !form.receiverPhone || !form.receiverAddress) {
      return toast.error('Vui lòng điền đầy đủ thông tin');
    }
    setLoading(true);
    setSubmitted(true);
    try {
      const res = await apiClient.post('/orders', {
        type: 'Retail',
        paymentMethod,
        ...form,
        isStorePickup,
        shippingFee,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          mainImageUrl: i.mainImageUrl,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      });

      if (paymentMethod === 'QrCode' && res.data.qrInfo) {
        // Hiển thị modal QR
        setQrInfo(res.data.qrInfo);
        clearCart();
        toast.success('Đơn hàng đã tạo! Quét QR để thanh toán.');
      } else {
        clearCart();
        toast.success('Đặt hàng thành công!');
        navigate('/');
      }
    } catch (err) {
      setSubmitted(false);
      const msg = err.response?.status === 409
        ? err.response.data.message
        : err.response?.status === 429
          ? 'Bạn đang gửi quá nhiều yêu cầu, vui lòng chờ 1 phút'
          : err.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleQrClose() {
    setQrInfo(null);
    navigate('/');
  }

  function handleQrConfirm() {
    toast.success('Cảm ơn bạn! Đơn hàng sẽ được xác nhận khi nhận được thanh toán.');
    setQrInfo(null);
    navigate('/');
  }

  return (
    <>
      {/* Modal QR */}
      {qrInfo && (
        <QrPaymentModal
          qrInfo={qrInfo}
          onClose={handleQrClose}
          onConfirm={handleQrConfirm}
        />
      )}

      <div className="min-h-screen bg-[#fdfdfb] pt-2 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* === Breadcrumbs === */}
          <nav className="flex items-center gap-2 text-[10px] font-medium text-gray-400 mb-3 overflow-x-auto whitespace-nowrap">
            <button onClick={() => navigate('/gio-hang')} className="hover:text-amber-600 transition-colors flex items-center gap-1">
              <ShoppingBag size={10} /> Giỏ hàng
            </button>
            <ChevronRight size={8} />
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">Thanh toán</span>
            <ChevronRight size={8} />
            <span className="opacity-50 text-gray-400">Hoàn tất</span>
          </nav>

          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 font-playfair tracking-tight">Thanh toán</h1>
              <p className="text-[10px] text-gray-500">Hoàn tất đơn hàng của bạn.</p>
            </div>
            <button onClick={() => navigate('/gio-hang')} className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 hover:text-amber-800 transition-colors">
              <ArrowLeft size={12} /> Quay lại
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* === CỘT TRÁI: THÔNG TIN === */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Mục: Thông tin người nhận */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <User size={14} />
                  </div>
                  <h2 className="text-base font-bold text-gray-800 font-playfair tracking-wide uppercase">Thông tin người nhận</h2>
                </div>

                {!isStorePickup && savedAddresses.length > 0 && (
                  <div className="mb-3">
                    <label className="section-label">Từ sổ địa chỉ</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pt-0.5">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`flex-shrink-0 flex items-start gap-2 p-2 rounded-xl border text-left transition-all w-[180px] relative group ${form.receiverAddress === addr.addressLine && form.receiverPhone === addr.phoneNumber ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/30' : 'border-gray-100 bg-white hover:border-amber-200'}`}
                        >
                          <div className={`mt-0.5 p-1 rounded-lg shrink-0 ${form.receiverAddress === addr.addressLine ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                            <MapPin size={12} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-900 truncate">{addr.fullName}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{addr.phoneNumber}</p>
                          </div>
                          {form.receiverAddress === addr.addressLine && form.receiverPhone === addr.phoneNumber && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle size={10} className="text-amber-600" fill="#fffbeb" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative group">
                      <label className="section-label">Họ và tên</label>
                      <div className="relative">
                        <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600" />
                        <input name="receiverName" type="text" value={form.receiverName} onChange={handleChange}
                          className="input pl-9 h-9 text-xs border-gray-100 bg-gray-50/30 focus:bg-white" placeholder="Họ tên người nhận..." />
                      </div>
                    </div>
                    <div className="relative group">
                      <label className="section-label">Số điện thoại</label>
                      <div className="relative">
                        <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-600" />
                        <input name="receiverPhone" type="tel" value={form.receiverPhone} onChange={handleChange}
                          className="input pl-9 h-9 text-xs border-gray-100 bg-gray-50/30 focus:bg-white" placeholder="SĐT..." />
                      </div>
                    </div>
                  </div>

                  {!isStorePickup && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="section-label">Địa chỉ giao hàng</label>
                      <div className="relative group">
                        <MapPin size={12} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-amber-600" />
                        <textarea name="receiverAddress" value={form.receiverAddress} onChange={handleChange}
                          rows={1} className="input pl-9 pt-2 h-9 bg-gray-50/30 border-gray-100 focus:bg-white resize-none text-xs"
                          placeholder="Địa chỉ..." />
                      </div>
                    </div>
                  )}

                  {isStorePickup && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 animate-in fade-in slide-in-from-top-1 duration-200 flex gap-2">
                      <MapPin size={16} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Nhận tại cửa hàng:</p>
                        <p className="text-xs text-gray-700 font-medium">123 Đường Hoa, Q.1, TP. HCM</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mục: Thời gian & Lời nhắn */}
              <div className="bg-white rounded-2xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Calendar size={12} />
                    </div>
                    <h2 className="text-xs font-bold text-gray-800">Thời gian nhận</h2>
                  </div>
                  <input name="deliveryTime" type="datetime-local" value={form.deliveryTime} onChange={handleChange}
                    className="input h-9 text-xs bg-gray-50/30 border-gray-100 focus:bg-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      <MessageSquare size={12} />
                    </div>
                    <h2 className="text-xs font-bold text-gray-800">Lời nhắn trên thiệp</h2>
                  </div>
                  <textarea name="messageCard" value={form.messageCard} onChange={handleChange}
                    rows={1} className="input h-9 pt-2 bg-gray-50/30 border-gray-100 focus:bg-white resize-none text-xs"
                    placeholder="Lời chúc..." />
                </div>
              </div>
            </div>

            {/* === CỘT PHẢI: TÓM TẮT & THANH TOÁN === */}
            <div className="lg:col-span-5 space-y-3 lg:sticky lg:top-4">
              
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] border border-gray-100">
                {/* Header Tóm tắt */}
                <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-amber-700" />
                    <h2 className="text-sm font-bold text-gray-800 font-playfair uppercase tracking-wider">Tóm tắt</h2>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-full">{items.length} món</span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Vận chuyển switch */}
                  <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-xl relative">
                    <button
                      onClick={() => setIsStorePickup(false)}
                      className={`relative z-10 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${!isStorePickup ? 'text-amber-800' : 'text-gray-400'}`}
                    >
                      <Truck size={12} /> Giao tận nơi
                    </button>
                    <button
                      onClick={() => setIsStorePickup(true)}
                      className={`relative z-10 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${isStorePickup ? 'text-amber-800' : 'text-gray-400'}`}
                    >
                      <ShoppingBag size={12} /> Cửa hàng
                    </button>
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 transform ${isStorePickup ? 'translate-x-full left-1' : 'translate-x-0 left-1'}`} />
                  </div>

                  {/* List items */}
                  <div className="space-y-2 max-h-[90px] overflow-y-auto pr-1 custom-scrollbar border-b border-dashed border-gray-200 pb-2">
                    {items.map(i => (
                      <div key={i.productId} className="flex gap-2.5 animate-in fade-in transition-all">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <img
                            src={resolveImage(i.mainImageUrl)}
                            alt={i.productName}
                            className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 truncate">{i.productName}</p>
                          <div className="flex justify-between items-center mt-0.5">
                            <span className="text-[10px] text-gray-400">× {i.quantity}</span>
                            <span className="text-[11px] font-bold text-gray-700">{formatVnd(i.unitPrice * i.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Phương thức thanh toán */}
                  <div className="space-y-2">
                    <label className="section-label flex items-center gap-1">
                      <CreditCard size={10} /> Thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => setPaymentMethod('QrCode')}
                        className={`group relative p-2 border border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'QrCode' ? 'border-amber-400 bg-amber-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-amber-100'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 transition-all ${paymentMethod === 'QrCode' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          <QrCode size={14} />
                        </div>
                        <p className={`text-[10px] font-bold ${paymentMethod === 'QrCode' ? 'text-amber-800' : 'text-gray-600'}`}>Quét QR</p>
                        {paymentMethod === 'QrCode' && <CheckCircle size={10} className="absolute top-1 right-1 text-amber-600" fill="#fffbeb" />}
                      </div>
                      <div
                        onClick={() => setPaymentMethod('COD')}
                        className={`group relative p-2 border border-2 rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === 'COD' ? 'border-amber-400 bg-amber-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-amber-100'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 transition-all ${paymentMethod === 'COD' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-white text-gray-400 border border-gray-100'}`}>
                          <Banknote size={14} />
                        </div>
                        <p className={`text-[10px] font-bold ${paymentMethod === 'COD' ? 'text-amber-800' : 'text-gray-600'}`}>Tiền mặt</p>
                        {paymentMethod === 'COD' && <CheckCircle size={10} className="absolute top-1 right-1 text-amber-600" fill="#fffbeb" />}
                      </div>
                    </div>
                  </div>

                  {/* Tổng kết tiền */}
                  <div className="bg-gray-50/50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-500 font-medium">Tạm tính</span>
                      <span className="font-bold text-gray-800">{formatVnd(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-500 font-medium">Phí giao</span>
                      <span className={`font-bold ${isStorePickup ? 'text-green-600' : 'text-gray-800'}`}>
                        {isStorePickup ? 'Free' : formatVnd(shippingFee)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter mb-0.5">Tổng cộng</p>
                        <span className="text-2xl font-black text-amber-600 font-playfair tracking-tighter">{formatVnd(finalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút đặt hàng */}
                  <div className="pt-0">
                    <button onClick={handlePlaceOrder} disabled={loading || submitted}
                      className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-900/10 hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden">
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        {submitted && !qrInfo ? 'Đang xử lý...' : loading ? 'Chờ xíu...' : paymentMethod === 'QrCode' ? <>Thanh toán <ChevronRight size={14} /></> : <>Xác nhận thanh toán <CheckCircle size={14} /></>}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-[9px] text-gray-400 text-center mt-3 font-medium">
                Bằng việc đặt hàng, bạn đồng ý với <span className="text-amber-700 underline decoration-amber-200 underline-offset-2">Chính sách</span> của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
