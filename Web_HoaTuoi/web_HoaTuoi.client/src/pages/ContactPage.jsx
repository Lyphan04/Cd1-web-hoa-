import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

export default function ContactPage() {
    function handleSubmit(e) {
        e.preventDefault();
        alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header Banner */}
            <div className="bg-pink-50 py-16 text-center">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto italic">
                        "Lyp Flower luôn sẵn lòng lắng nghe và hỗ trợ bạn tìm được những đóa hoa tuyệt vời nhất."
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Hotline hỗ trợ</h3>
                                <p className="text-pink-600 font-bold text-lg">0922 222 686</p>
                                <p className="text-xs text-gray-500 mt-1">Hỗ trợ 24/7 cho mọi đơn hàng hỏa tốc.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Email liên hệ</h3>
                                <p className="text-gray-700 font-medium whitespace-nowrap">hello@lypflower.vn</p>
                                <p className="text-xs text-gray-500 mt-1">Phản hồi trong vòng 24 giờ làm việc.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Giờ làm việc</h3>
                                <p className="text-gray-700 font-medium">07:00 - 22:00</p>
                                <p className="text-xs text-gray-500 mt-1">Tất cả các ngày trong tuần, kể cả Lễ/Tết.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900">Gửi lời nhắn cho Lyp Flower</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                                    <input required type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
                                    <input required type="tel" placeholder="09xx xxx xxx" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email</label>
                                <input required type="email" placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Chủ đề</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition bg-white">
                                    <option>Tư vấn đặt hoa sinh nhật</option>
                                    <option>Khiếu nại dịch vụ/sản phẩm</option>
                                    <option>Hợp tác kinh doanh/Sự kiện</option>
                                    <option>Khác</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Nội dung tin nhắn</label>
                                <textarea required rows={5} placeholder="Bạn cần chúng tôi hỗ trợ điều gì?" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full md:w-auto px-10 py-4 bg-pink-600 text-white rounded-full font-bold hover:bg-pink-700 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-200">
                                <Send size={18} /> GỬI TIN NHẮN
                            </button>
                        </form>
                    </div>

                </div>

                {/* Google Maps Embed */}
                <div className="mt-16 rounded-[2rem] overflow-hidden shadow-xl border-8 border-white bg-gray-100 h-96 relative">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3243171120054!2d106.69745161533423!3d10.786448392314545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4c3a0701dd%3A0xc6651811e54457e5!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1689000000000!5m2!1svi!2s" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Bản đồ vị trí cửa hàng Lyp Flower"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
