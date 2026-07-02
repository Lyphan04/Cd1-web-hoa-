import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { productApi } from "../api/products";
import { categoryApi } from "../api/categories";
import { resolveImage } from "../utils/imageResolver";

import FlowerCard from "../components/product/FlowerCard";
import { reviewApi } from "../api/reviews";
import { Star, ShoppingBag, Users } from "lucide-react";

const getCategoryImg = (slug, dbImageUrl) => {
    // Ưu tiên fallback sang ảnh cứng trong assets
    const assetMap = {
        'hoa-hong': 'hh1.jpg',
        'hoa-tulip': 'tl1.jpg',
        'hoa-huong-duong': 'hhd1.jpg',
        'hoa-cam-tu-cau': 'ctc1.jpg',
        'hoa-cuoi': 'hc1.jpg',
        'gio-hoa': 'gh1.jpg',
        'hoa-lan': 'l5.jpg',
        'vali-hoa': '1.jpg'
    };

    if (assetMap[slug]) return resolveImage(assetMap[slug]);
    if (dbImageUrl) return resolveImage(dbImageUrl);

    return resolveImage('gh1.jpg'); // default
}

export default function HomePage() {

    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ averageRating: 5.0, totalReviews: 0, totalSold: 0 })

    useEffect(() => {

        Promise.all([
            productApi.getProducts({ page: 1, pageSize: 12, sortBy: "random" }),
            categoryApi.getAll(),
            reviewApi.getShopStats()
        ])
            .then(([p, c, s]) => {

                setProducts(p.items)
                setCategories(c)
                setStats(s)

            })
            .finally(() => setLoading(false))

    }, [])


    if (loading) return <div className="text-center p-20">Loading...</div>


    return (

        <div className="space-y-3 pb-10">

            {/* ================= HERO ================= */}

            <section className="bg-pink-50 py-10">

                <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center">

                    {/* TEXT */}
                    <div>

                        <h1 className="text-5xl font-bold text-pink-600 leading-tight font-playfair">
                            Hoa tươi cho
                            mọi khoảnh khắc yêu thương 🌸
                        </h1>

                        <p className="mt-6 mb-10 text-gray-600 text-lg">
                            Những bó hoa tươi được tuyển chọn và thiết kế tinh tế để,
                            bạn gửi gắm yêu thương trong mọi dịp đặc biệt
                        </p>

                    </div>

                    {/* IMAGE */}
                    <img
                        src="/banner.png"
                        alt="hoa"
                        className="rounded-3xl shadow-lg"
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://placehold.co/600x400/f8c8dc/333?text=Banner";
                        }}
                    />

                </div>

            </section>


            {/* ================= CATEGORIES ================= */}

            <section className="py-8">

                <h2 className="text-3xl font-bold text-center mb-6 font-playfair">
                    Danh mục hoa
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

                    {categories.map(c => (

                        <Link
                            key={c.id}
                            to={`/hoa?category=${c.slug}`}
                            className="text-center group"
                        >

                            <div className="border-4 border-pink-100 rounded-[2rem] overflow-hidden p-1 group-hover:border-pink-300 transition-colors duration-300">
                                <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                                    <img
                                        src={getCategoryImg(c.slug, c.imageUrl)}
                                        alt={c.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                        onError={(e) => { e.currentTarget.src = "https://placehold.co/100/f8c8dc/333?text=Icon" }}
                                    />
                                </div>
                            </div>

                            <p className="mt-4 font-bold text-gray-800">

                                {c.name}

                            </p>

                        </Link>

                    ))}

                </div>

            </section>





            {/* ================= FEATURED PRODUCTS ================= */}

            <section className="container mx-auto">

                <h2 className="text-2xl font-medium text-center mb-6 text-gray-800 tracking-widest uppercase">

                    SẢN PHẨM NỔI BẬT

                </h2>

                <div className="grid md:grid-cols-4 gap-8">

                    {products.slice(0, 12).map(p => (

                        <FlowerCard key={p.id} product={p} />

                    ))}

                </div>

            </section>


            {/* ================= SERVICES ================= */}

            <section className="bg-gray-50 py-10">

                <div className="container mx-auto grid md:grid-cols-4 gap-10 text-center">

                    <div>

                        <div className="text-4xl">🚚</div>

                        <h3 className="font-bold mt-4">

                            Giao hoa nhanh

                        </h3>

                        <p className="text-sm text-gray-500 mt-2">

                            Giao trong 2 giờ nội thành

                        </p>

                    </div>


                    <div>

                        <div className="text-4xl">🌹</div>

                        <h3 className="font-bold mt-4">

                            Hoa tươi mỗi ngày

                        </h3>

                        <p className="text-sm text-gray-500 mt-2">

                            Hoa nhập mới mỗi sáng

                        </p>

                    </div>


                    <div>

                        <div className="text-4xl">🎁</div>

                        <h3 className="font-bold mt-4">

                            Thiết kế theo yêu cầu

                        </h3>

                        <p className="text-sm text-gray-500 mt-2">

                            Bó hoa theo mong muốn

                        </p>

                    </div>


                    <div>

                        <div className="text-4xl">💬</div>

                        <h3 className="font-bold mt-4">

                            Tư vấn 24/7

                        </h3>

                        <p className="text-sm text-gray-500 mt-2">

                            Luôn sẵn sàng hỗ trợ

                        </p>

                    </div>

                </div>

            </section>


            {/* ================= STORY ================= */}

            <section className="container mx-auto grid md:grid-cols-2 gap-10 items-center">

                <img
                    src="/banner2.png"
                    alt="shop hoa"
                    className="rounded-3xl"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/600x600/f8c8dc/333?text=Story" }}
                />


                <div>

                    <h2 className="text-3xl font-bold font-playfair">

                        Câu chuyện của shop hoa

                    </h2>

                    <p className="mt-6 text-gray-600 leading-relaxed">
                        Chúng tôi tin rằng mỗi bó hoa đều mang trong mình
                        một thông điệp yêu thương.
                        Từ hoa sinh nhật, hoa cưới, hoa khai trương
                        đến hoa tặng người yêu — tất cả đều được thiết kế
                        tỉ mỉ bởi đội ngũ florist chuyên nghiệp.
                    </p>

                </div>

            </section>


            {/* ================= BLOG ================= */}

            <section className="bg-pink-50 py-6">

                <div className="container mx-auto">

                    <h2 className="text-3xl font-bold text-center mb-12 font-playfair">

                        Cẩm nang & ý nghĩa các loài hoa

                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 text-left">

                        <Link to="/blog/y-nghia-hoa-hong" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={resolveImage("hh1.jpg")} alt="Hoa hồng" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 uppercase tracking-wider">Cảm hứng hoa</div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold font-playfair text-lg mb-2 group-hover:text-pink-600 transition">Ngôn ngữ kỳ diệu của các loài hoa tại Lyp Flower</h3>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">Mỗi đóa hoa mang trong mình một sứ giả thầm lặng, gửi gắm tâm tư mà lời nói chẳng thể diễn tả hết. Khám phá ý nghĩa sâu sắc của hoa hồng, lan, tulip...</p>
                                <p className="text-[10px] text-pink-500 mt-4 font-bold flex items-center gap-1 uppercase tracking-wider">Đọc thêm <span>→</span></p>
                            </div>
                        </Link>

                        <Link to="/blog/hoa-cuoi-dep" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={resolveImage("hc1.jpg")} alt="Hoa cưới" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 uppercase tracking-wider">Bộ sưu tập hoa</div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold font-playfair text-lg mb-2 group-hover:text-pink-600 transition">Khơi nguồn cảm hứng cho ngày trọng đại</h3>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">Trong giấc mơ về một hôn lễ hoàn hảo, đóa hoa cầm tay chính là mảnh ghép cuối cùng tôn vinh vẻ đẹp thiêng liêng rạng ngời của nàng.</p>
                                <p className="text-[10px] text-pink-500 mt-4 font-bold flex items-center gap-1 uppercase tracking-wider">Đọc thêm <span>→</span></p>
                            </div>
                        </Link>

                        <Link to="/blog/cach-cham-hoa-tuoi" className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={resolveImage("tl1.jpg")} alt="Chăm sóc hoa" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 uppercase tracking-wider">Cẩm nang hoa</div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold font-playfair text-lg mb-2 group-hover:text-pink-600 transition">Lắng nghe tiếng thở của những đóa hoa</h3>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">Chăm sóc hoa không chỉ là kỹ thuật, mà là liệu pháp tâm hồn. Hãy cùng học cách nâng niu để giữ mãi vẻ tươi mới cho không gian của bạn.</p>
                                <p className="text-[10px] text-pink-500 mt-4 font-bold flex items-center gap-1 uppercase tracking-wider">Đọc thêm <span>→</span></p>
                            </div>
                        </Link>

                    </div>

                </div>

            </section>


            {/* ================= COMMITMENTS ================= */}

            <section className="container mx-auto mt-4">

                <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-3xl p-6 lg:p-8 text-center shadow-sm">

                    <h2 className="text-xl md:text-2xl font-bold font-playfair text-pink-700 mb-6">

                        Lời cam kết yêu thương từ Lyp flower

                    </h2>

                    <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">

                        Chúng tôi cam kết mang đến những bông hoa tươi thắm nhất,
                        được chọn lọc kỹ càng mỗi ngày để thay bạn gửi gắm
                        hàng vạn lời yêu thương đến người nhận.

                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-xl mb-4">✨</div>
                            <h3 className="font-bold font-playfair text-xl mb-2">Chất lượng hàng đầu</h3>
                            <p className="text-gray-500 text-sm">Hoa được nhập mới mỗi ngày từ các nông trại uy tín nhất Đà Lạt và nguồn nội địa/nhập khẩu.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-xl mb-4">🎨</div>
                            <h3 className="font-bold font-playfair text-xl mb-2">Thiết kế tinh tế</h3>
                            <p className="text-gray-500 text-sm">Đội ngũ florist chuyên nghiệp với phong cách cắm hoa hiện đại, sang trọng và độc đáo.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-xl mb-4">💝</div>
                            <h3 className="font-bold font-playfair text-xl mb-2">Tận tâm phục vụ</h3>
                            <p className="text-gray-500 text-sm">Luôn lắng nghe và tư vấn nhiệt tình để bạn chọn được món quà ưng ý nhất cho mọi dịp.</p>
                        </div>
                    </div>

                </div>

            </section>

        </div>

    )

}