using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Text;
using System.Text.Json;

namespace Web_HoaTuoi.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IMongoClient _mongoClient;
        private readonly HttpClient _httpClient;
        private readonly string _geminiApiKey;

        public SearchController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();

            try { DotNetEnv.Env.Load(".env.local"); } catch { }

            var mongoConn = configuration["MONGO_CONNECTION_STRING"]
                            ?? Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")
                            ?? configuration.GetConnectionString("MongoDB");

            if (string.IsNullOrWhiteSpace(mongoConn))
            {
                mongoConn = "mongodb+srv://truongnha474:mongoDb@cluster0.r2doavc.mongodb.net/";
            }

            _mongoClient = new MongoClient(mongoConn);

            var rawKey = configuration["GEMINI_API_KEY"]
                         ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY")
                         ?? string.Empty;

            _geminiApiKey = rawKey.Trim().Trim('"', '\'');
        }

        [HttpPost("semantic-search")]
        public async Task<IActionResult> SemanticSearch([FromBody] SearchRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Query))
            {
                return BadRequest(new { message = "Từ khóa tìm kiếm không được để trống." });
            }

            try
            {
                // Bước 1: Tạo Vector từ API Gemini
                var queryVector = await GetEmbeddingFromGeminiAsync(request.Query);
                if (queryVector == null || queryVector.Count == 0)
                {
                    return StatusCode(500, new { message = "Không thể tạo vector embedding từ Gemini API." });
                }

                // Bước 2: Lấy Database & Collection
                var database = _mongoClient.GetDatabase("HoaTuoiSearchDB");
                var collection = database.GetCollection<BsonDocument>("flower_embeddings");

                // Bước 3: Pipeline Vector Search
                var vectorSearchStage = new BsonDocument("$vectorSearch", new BsonDocument
                {
                    { "index", "vector_index" },
                    { "path", "flower_vector" },
                    { "queryVector", new BsonArray(queryVector) },
                    { "numCandidates", 50 },
                    { "limit", 10 }
                });

                var projectStage = new BsonDocument("$project", new BsonDocument
                {
                    { "_id", 1 },
                    { "ProductId", 1 },
                    { "Name", 1 },
                    { "Slug", 1 },
                    { "MainImageUrl", 1 },
                    { "Description", 1 },
                    { "Meaning", 1 },
                    { "Price", 1 },
                    { "SalePrice", 1 },
                    { "FlowerType", 1 },
                    { "Color", 1 },
                    { "score", new BsonDocument("$meta", "vectorSearchScore") }
                });

                var matchStage = new BsonDocument("$match", new BsonDocument
                {
                    { "score", new BsonDocument("$gte", 0.65) }
                });

                var pipeline = new[] { vectorSearchStage, projectStage, matchStage };
                var resultsBson = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

                var results = resultsBson.Select(doc => new
                {
                    id = doc.GetValue("_id", null)?.ToString(),
                    productId = doc.GetValue("ProductId", 0).AsInt32,
                    name = doc.GetValue("Name", "").AsString,
                    slug = doc.GetValue("Slug", "").AsString,
                    mainImageUrl = doc.GetValue("MainImageUrl", "").AsString,
                    description = doc.GetValue("Description", "").AsString,
                    meaning = doc.GetValue("Meaning", "").AsString,
                    price = doc.GetValue("Price", 0).AsDecimal,
                    salePrice = doc.GetValue("SalePrice", 0).AsDecimal,
                    flowerType = doc.GetValue("FlowerType", "").AsString,
                    color = doc.GetValue("Color", "").AsString,
                    score = doc.GetValue("score", 0.0).AsDouble
                }).ToList();

                // Bước 4: Tạo câu tư vấn chi tiết từ AI
                string aiResponseText = "";
                if (results.Count > 0)
                {
                    aiResponseText = await GenerateAiSummaryAsync(request.Query, results.Cast<dynamic>().ToList());
                }

                return Ok(new
                {
                    message = "Tìm kiếm thành công",
                    query = request.Query,
                    aiResponse = aiResponseText,
                    data = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi xử lý Semantic Search: {ex.Message}" });
            }
        }

        private async Task<List<float>?> GetEmbeddingFromGeminiAsync(string text)
        {
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={_geminiApiKey}";

            var requestBody = new
            {
                model = "models/gemini-embedding-001",
                content = new { parts = new[] { new { text = text } } }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(geminiUrl, jsonContent);

            if (!response.IsSuccessStatusCode) return null;

            using var jsonDoc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            if (jsonDoc.RootElement.TryGetProperty("embedding", out var embedding) &&
                embedding.TryGetProperty("values", out var values))
            {
                List<float> vectorList = new();
                foreach (var val in values.EnumerateArray())
                {
                    vectorList.Add(val.GetSingle());
                }
                return vectorList;
            }

            return null;
        }

        private async Task<string> GenerateAiSummaryAsync(string userQuery, List<dynamic> matchedProducts)
        {
            try
            {
                string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={_geminiApiKey}";

                var productDetails = matchedProducts.Select(p => $"- {p.name} (Loại: {p.flowerType}, Màu: {p.color}, Ý nghĩa: {p.meaning})");
                string productContext = string.Join("\n", productDetails);

                string prompt = $@"Bạn là chuyên gia tư vấn hoa tươi cao cấp của Lyp Flower.
Khách hàng đang tìm kiếm với nhu cầu: '{userQuery}'.
Dưới đây là các sản phẩm phù hợp nhất tìm được từ hệ thống:
{productContext}

Hãy viết một đoạn tư vấn từ 2 - 3 câu (khoảng 60 - 80 từ) thật chuyên nghiệp, ấm áp và tinh tế:
1. Xưng 'Lyp Flower' và chào/đón nhận nhu cầu của khách hàng.
2. Phân tích nhẹ nhàng về ý nghĩa tone màu/loại hoa này phù hợp như thế nào với nhu cầu '{userQuery}'.
3. Lời chúc hoặc lời mời khách hàng khám phá các mẫu hoa bên dưới.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(geminiUrl, jsonContent);

                if (response.IsSuccessStatusCode)
                {
                    using var jsonDoc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
                    var candidates = jsonDoc.RootElement.GetProperty("candidates");
                    if (candidates.GetArrayLength() > 0)
                    {
                        var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            return text.Trim();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AI Summary Error]: {ex.Message}");
            }

            return $"Dựa trên mong muốn '{userQuery}', Lyp Flower xin gợi ý những mẫu hoa mang sắc màu dịu nhẹ cùng ý nghĩa sâu sắc nhất. Đây sẽ là món quà tuyệt vời giúp bạn gửi gắm trọn vẹn tình cảm chân thành và sự trân trọng!";
        }
    }

    public class SearchRequest
    {
        public string Query { get; set; } = string.Empty;
    }
}