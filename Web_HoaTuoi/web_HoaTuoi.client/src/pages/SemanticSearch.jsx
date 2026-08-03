import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resolveImage } from "../utils/imageResolver";

export default function SemanticSearch() {
  const [query, setQuery] = useState(
    () => sessionStorage.getItem("search_query") || ""
  );
  const [results, setResults] = useState(() => {
    const savedResults = sessionStorage.getItem("search_results");
    return savedResults ? JSON.parse(savedResults) : [];
  });
  const [aiResponse, setAiResponse] = useState(
    () => sessionStorage.getItem("search_ai_response") || ""
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(
    () => sessionStorage.getItem("has_searched") === "true"
  );

  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem("search_query", query);
    sessionStorage.setItem("search_results", JSON.stringify(results));
    sessionStorage.setItem("search_ai_response", aiResponse);
    sessionStorage.setItem("has_searched", hasSearched.toString());
  }, [query, results, aiResponse, hasSearched]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setHasSearched(true);
    setAiResponse("");

    try {
      const response = await fetch("/api/Search/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(
          `Lỗi Server (${response.status}): Vui lòng kiểm tra lại kết nối Backend.`
        );
      }

      const data = await response.json();
      setResults(data.data || []);
      setAiResponse(data.aiResponse || "");
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-10 font-sans">
      {/* KHU VỰC TÌM KIẾM */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2.5">
          Tìm Kiếm Bó Hoa Theo Yêu Cầu Của Bạn
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-5">
          Mô tả bó hoa bạn mong muốn (ví dụ: "Hoa tặng sinh nhật màu hồng nhẹ
          nhàng", "Hoa hướng dương tươi thắm")...
        </p>

        <form
          onSubmit={handleSearch}
          className="flex justify-center gap-2.5 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập câu hỏi hoặc mô tả tìm kiếm..."
              className="w-full px-5 py-3 rounded-full border border-slate-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-sm text-gray-700 shadow-xs transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-pink-600 hover:bg-pink-700 text-white font-bold px-7 py-3 rounded-full text-sm cursor-pointer transition-all duration-200 shrink-0 shadow-sm ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-md"
            }`}
          >
            {loading ? "Đang phân tích..." : "Tìm kiếm"}
          </button>
        </form>

        {errorMessage && (
          <p className="text-red-600 mt-4 text-sm font-bold bg-red-50 py-2 px-4 rounded-xl border border-red-200 inline-block">
            ⚠️ {errorMessage}
          </p>
        )}
      </div>

      {/* CÂU TƯ VẤN SÂU SẮC TỪ AI */}
      {!loading && aiResponse && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 md:p-5 mb-8 flex items-start gap-3 shadow-xs">
          <span className="text-2xl shrink-0">✨</span>
          <div>
            <div className="font-bold text-pink-600 text-xs tracking-wider uppercase mb-1">
              GỢI Ý TỪ TRỢ LÝ AI LYP FLOWER
            </div>
            <div className="text-gray-700 text-sm md:text-base leading-relaxed">
              {aiResponse}
            </div>
          </div>
        </div>
      )}

      {/* SKELETON LOADING KHI ĐANG TÌM KIẾM */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 p-4 space-y-3 animate-pulse"
            >
              <div className="bg-gray-200 h-60 rounded-xl w-full"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
              <div className="bg-gray-200 h-10 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* THÔNG BÁO KHI KHÔNG CÓ KẾT QUẢ */}
      {!loading && hasSearched && results.length === 0 && !errorMessage && (
        <div className="text-center text-gray-500 my-10 py-8 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-gray-800">
            Không tìm thấy bó hoa phù hợp với mô tả của bạn.
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Hãy thử mô tả lại theo cách khác hoặc dùng các từ khóa gợi ý như{" "}
            <span className="text-pink-600 font-medium">
              "hoa hồng đỏ", "hoa sinh nhật"
            </span>
            ...
          </p>
        </div>
      )}

      {/* DANH SÁCH KẾT QUẢ */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => {
            const displayPrice =
              product.salePrice > 0 ? product.salePrice : product.price;
            const hasSale =
              product.salePrice > 0 && product.salePrice < product.price;
            const productDetailLink = `/hoa/${product.slug}`;
            const imageSrc = resolveImage(
              product.mainImageUrl || product.imageUrl
            );
            const matchScore = product.score
              ? (product.score * 100).toFixed(1)
              : null;

            return (
              <div
                key={product.id || product.productId}
                className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col justify-between pb-4"
              >
                <div>
                  {/* Khung Ảnh */}
                  <div className="relative overflow-hidden aspect-square bg-gray-50">
                    <Link to={productDetailLink} className="block w-full h-full">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Badge Giảm Giá */}
                    {hasSale && (
                      <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-xs">
                        -
                        {Math.round(
                          ((product.price - product.salePrice) /
                            product.price) *
                            100
                        )}
                        %
                      </div>
                    )}
                  </div>

                  {/* Thông Tin */}
                  <div className="pt-4 px-4 text-center">
                    <Link
                      to={productDetailLink}
                      className="block group-hover:text-pink-600 transition-colors"
                    >
                      <h3 className="text-base font-bold text-slate-800 line-clamp-1 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mb-2 flex items-center justify-center gap-2">
                      <span className="text-pink-600 font-bold text-lg">
                        {Number(displayPrice).toLocaleString("vi-VN")} đ
                      </span>
                      {hasSale && (
                        <span className="text-gray-400 line-through text-xs">
                          {Number(product.price).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    {matchScore && (
                      <div className="text-xs text-gray-500">
                        Độ tương đồng:{" "}
                        <span className="text-emerald-600 font-bold">
                          {matchScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nút Xem Chi Tiết */}
                <div className="px-4 mt-4">
                  <button
                    onClick={() => navigate(productDetailLink)}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors duration-200"
                  >
                    XEM CHI TIẾT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}