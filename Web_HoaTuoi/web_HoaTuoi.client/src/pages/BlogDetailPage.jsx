// src/pages/BlogDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { resolveImage } from '../utils/imageResolver';

function blogTag(type) {
    return type === 'Lookbook' ? 'Bộ sưu tập' : 'Cảm hứng hoa';
}

export default function BlogDetailPage() {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BLOG_POSTS = {
        'y-nghia-hoa-hong': {
            title: 'Ngôn ngữ kỳ diệu của các loài hoa tại Lyp Flower',
            type: 'Lifestyle',
            coverImageUrl: 'hh1.jpg',
            content: `
                <p>Mỗi đóa hoa không chỉ là một tạo vật xinh đẹp của thiên nhiên, mà còn là một sứ giả thầm lặng, mang trong mình những tâm tư, tình cảm mà đôi khi lời nói chẳng thể diễn tả hết. Tại Lyp Flower, chúng tôi tin rằng việc tặng hoa là trao đi một phần tâm hồn.</p>
                
                <h3>1. Hoa Hồng - Bản tình ca bất hủ</h3>
                <p>Không gì có thể thay thế vị thế của hoa hồng trong trái tim những người yêu nhau. Nếu <strong>Hồng Đỏ</strong> là lời tự tình mãnh liệt, nồng cháy nhất thì <strong>Hồng Trắng</strong> lại là sự tôn thờ vẻ đẹp thuần khiết, chân thành. <strong>Hồng Sen</strong> mang nét dịu dàng, duyên dáng như chính người phụ nữ Việt Nam.</p>
                
                <h3>2. Lan Hồ Điệp - Vẻ đẹp vương giả</h3>
                <p>Được mệnh danh là "nữ hoàng của các loài hoa lan", Lan Hồ Điệp tượng trưng cho sự sang trọng, quý phái và thịnh vượng. Một chậu lan tinh tế không chỉ làm bừng sáng không gian mà còn là lời chúc cho sự bền vững và may mắn trường tồn.</p>

                <h3>3. Hoa Tulip - Biểu tượng của sự hoàn hảo</h3>
                <p>Tulip mang vẻ đẹp thanh tao, đại diện cho những cảm xúc chân thành và sự che chở. Mỗi màu sắc của Tulip như một gam màu của cuộc sống: màu vàng rực rỡ như nắng mai, màu đỏ nồng nàn như hơi thở tình yêu.</p>

                <h3>4. Hoa Hướng Dương - Nguồn năng lượng tích cực</h3>
                <p>Luôn hướng về phía mặt trời, hoa hướng dương nhắc nhở chúng ta về hy vọng, sự kiên trì và lòng trung thành. Đây là món quà tuyệt vời để khích lệ tinh thần, tiếp thêm sức mạnh cho những người thân yêu.</p>
                
                <p>Hãy để mỗi đóa hoa tại Lyp Flower giúp bạn kể câu chuyện của riêng mình, để sự chân thành được lan tỏa một cách tinh tế và trọn vẹn nhất.</p>
            `
        },
        'hoa-cuoi-dep': {
            title: 'Khơi nguồn cảm hứng cho ngày trọng đại',
            type: 'Lookbook',
            coverImageUrl: 'hc1.jpg',
            content: `
                <p>Ngày cưới là khoảnh khắc kỳ diệu khi hai tâm hồn hòa làm một. Và trong giấc mơ về một hôn lễ hoàn hảo, đóa hoa cầm tay cô dâu chính là mảnh ghép cuối cùng, tôn vinh vẻ đẹp rạng ngời và thiêng liêng ấy.</p>
                
                <h3>Nghệ thuật chọn hoa cưới</h3>
                <p>Một bó hoa cưới đẹp không chỉ nằm ở sự đắt giá, mà ở cách nó hòa quyện với tính cách và tà váy cưới của nàng. Chúng tôi yêu cái cách những đóa <strong>Cẩm Tú Cầu</strong> bồng bềnh như mây, hòa cùng nét kiêu sa của <strong>Hoa Hồng</strong> để tạo nên một tổng thể vừa hiện đại, vừa lãng mạn.</p>
                
                <h3>Xu hướng bền vững và thiên nhiên</h3>
                <p>Năm nay, các cô dâu đang dần yêu chuộng những bó hoa mang hơi thở của cỏ cây hoa dại - mộc mạc nhưng vô cùng tinh tế. Sử dụng những tone màu pastel dịu nhẹ như xanh mint, hồng trà hay kem sữa để tạo nên một không gian cưới thơ mộng và bình yên.</p>
                
                <p>Tại Lyp Flower, mỗi bó hoa cưới là một tác phẩm nghệ thuật thủ công, được florist nâng niu từng cánh hoa để cùng nàng bước đi trong hạnh phúc.</p>
            `
        },
        'cach-cham-hoa-tuoi': {
            title: 'Lắng nghe tiếng thở của những đóa hoa',
            type: 'Lifestyle',
            coverImageUrl: 'tl1.jpg',
            content: `
                <p>Hoa cũng giống như tình yêu, cần sự nâng niu và chăm sóc mỗi ngày để giữ mãi vẻ tươi mới. Việc chăm sóc hoa không chỉ là kỹ thuật, mà còn là một liệu pháp giúp tâm hồn ta tĩnh lặng và yêu đời hơn.</p>
                
                <h3>Bí mật để hoa luôn rạng rỡ</h3>
                <p>Hãy bắt đầu một ngày mới bằng việc thay nước cho bình hoa của bạn. Nguồn nước mát lành, sạch sẽ chính là nhựa sống giúp hoa căng tràn. Đừng quên một lát cắt chéo nhẹ nơi cuống hoa - đó là cách bạn giúp hoa hít thở sâu hơn và đón nhận nguồn dưỡng chất dồi dào.</p>
                
                <p>Hãy đặt hoa ở nơi có ánh sáng dịu nhẹ, tránh xa hơi nóng gay gắt. Một chút không gian thoáng đãng xen lẫn sự quan tâm mỗi sớm mai sẽ giúp bình hoa của bạn bền bỉ và tỏa hương thơm ngát suốt cả tuần.</p>
                
                <p>Chăm sóc hoa là cách chúng ta học cách chậm lại, để cảm nhận vẻ đẹp mong manh nhưng đầy sức sống của thiên nhiên ngay trong chính ngôi nhà mình.</p>
            `
        }
    };

    useEffect(() => {
        setLoading(true);
        const found = BLOG_POSTS[slug];
        if (found) {
            setBlog(found);
            setError(null);
        } else {
            setError('Không tìm thấy bài viết.');
        }
        setLoading(false);
    }, [slug]);

    if (loading) return <div className="min-h-screen pt-32 pb-20 px-4 text-center text-stone-400">Đang tải...</div>;
    if (error || !blog) return <div className="min-h-screen pt-32 pb-20 px-4 text-center text-stone-500">{error}</div>;

    return (
        <div style={{ backgroundColor: '#fffdfb' }} className="min-h-screen pb-24 pt-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Back button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-bold text-stone-400 hover:text-pink-500 mb-12 transition-colors uppercase tracking-[0.2em]">
                    <ChevronLeft size={12} /> Quay lại Tin tức
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 bg-stone-50 text-stone-400 rounded-full mb-6 border border-stone-100">
                        {blogTag(blog.type)}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-stone-800 leading-tight" style={{ fontFamily: "serif" }}>
                        {blog.title}
                    </h1>
                </div>

                {/* Cover Image */}
                {blog.coverImageUrl && (
                    <div className="w-full rounded-2xl overflow-hidden mb-16 shadow-sm border border-stone-50">
                        <img
                            src={resolveImage(blog.coverImageUrl)}
                            alt={blog.title}
                            className="w-full h-auto object-cover max-h-[550px]"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-stone max-w-none 
                    prose-p:text-stone-600 prose-p:leading-[1.8] prose-p:text-[15px]
                    prose-headings:text-stone-800 prose-headings:font-serif prose-h3:text-lg prose-h3:mt-10
                    prose-strong:text-stone-700
                    prose-li:text-stone-600 prose-li:text-[15px]"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />
            </div>
        </div>
    );
}
