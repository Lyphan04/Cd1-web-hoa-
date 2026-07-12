using System;
using System.Collections.Generic;
using System.Data;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace Web_HoaTuoi.VectorTool
{
    class Program
    {
        // Định nghĩa cấu trúc Document để lưu vào MongoDB
        public class FlowerEmbeddingDocument
        {
            // [BsonId]
            // [BsonRepresentation(BsonType.ObjectId)]
            // public string Id { get; set; }
            public int ProductId { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Slug { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Meaning { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public decimal SalePrice { get; set; }
            public bool IsOnSale { get; set; }
            public string FlowerType { get; set; } = string.Empty;
            public string Color { get; set; } = string.Empty;
            public string BouquetSize { get; set; } = string.Empty;
            public string Occasion { get; set; } = string.Empty;
            public double WeightKg { get; set; }

            // Trường lưu Vector phục vụ Semantic Search
            [BsonElement("flower_vector")]
            public List<float> FlowerVector { get; set; } = new();

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        }

        static async Task Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.WriteLine("=== CÔNG CỤ CHUYỂN ĐỔI & NẠP VECTOR HOA TƯƠI (GEMINI) ===");

            try
            {
                DotNetEnv.Env.Load(".env.local");
            }
            catch
            {
                Console.WriteLine("Không tìm thấy file .env.local, chương trình sẽ lấy trực tiếp từ Environment Variables.");
            }

            // Đọc các thông tin cấu hình từ Environment Variables
            string sqlConnectionString = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING") ?? "";
            string mongoConnectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING") ?? "";
            string geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? "";

            if (string.IsNullOrEmpty(sqlConnectionString) || string.IsNullOrEmpty(mongoConnectionString) || string.IsNullOrEmpty(geminiApiKey))
            {
                Console.WriteLine("Lỗi: Thiếu cấu hình trong môi trường hoặc file .env.local!");
                Console.WriteLine("Cần cấu hình: SQL_CONNECTION_STRING, MONGO_CONNECTION_STRING, GEMINI_API_KEY");
                return;
            }

            // Lấy dữ liệu từ SQL Server
            Console.WriteLine("\n[1/4] Đang kết nối SQL Server để lấy danh sách hoa...");
            List<FlowerEmbeddingDocument> flowers = new();

            try
            {
                using var connection = new SqlConnection(sqlConnectionString);
                await connection.OpenAsync();

                string query = "SELECT Id, Name, Slug, Description, Meaning, Price, FlowerType, Color, IsOnSale, BouquetSize, Occasion, WeightKg FROM Products";
                using var command = new SqlCommand(query, connection);
                using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    flowers.Add(new FlowerEmbeddingDocument
                    {
                        ProductId = reader.GetInt32(0),
                        Name = reader.IsDBNull(1) ? "" : reader.GetString(1),
                        Slug = reader.IsDBNull(2) ? "" : reader.GetString(2),
                        Description = reader.IsDBNull(3) ? "" : reader.GetString(3),
                        Meaning = reader.IsDBNull(4) ? "" : reader.GetString(4),
                        Price = reader.IsDBNull(5) ? 0 : reader.GetDecimal(5),
                        FlowerType = reader.IsDBNull(6) ? "" : reader.GetString(6),
                        Color = reader.IsDBNull(7) ? "" : reader.GetString(7),
                        IsOnSale = !reader.IsDBNull(8) && reader.GetBoolean(8),
                        BouquetSize = reader.IsDBNull(9) ? "" : reader.GetString(9),
                        Occasion = reader.IsDBNull(10) ? "" : reader.GetString(10),
                        WeightKg = reader.IsDBNull(11) ? 0 : (double)reader.GetDouble(11)
                    });
                }
                Console.WriteLine($"Lấy thành công {flowers.Count} sản phẩm hoa từ SQL Server.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi kết nối SQL Server: {ex.Message}");
                return;
            }

            if (flowers.Count == 0) return;

            // 3. Khởi tạo kết nối MongoDB và HttpClient cho Gemini
            using var httpClient = new HttpClient();
            var mongoClient = new MongoClient(mongoConnectionString);
            var database = mongoClient.GetDatabase("HoaTuoiSearchDB");
            var collection = database.GetCollection<FlowerEmbeddingDocument>("flower_embeddings");

            Console.WriteLine("\n[2/4] Đang xử lý tạo Vector (Gemini) và nạp lên MongoDB Atlas...");
            int successCount = 0;

            // Tạo URL cho API Gemini
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={geminiApiKey}";
            foreach (var flower in flowers)
            {
                // Gộp thông tin tối ưu hóa ngữ nghĩa cho Embedding
                string fullTextToEmbed = $"Tên hoa: {flower.Name}. " +
                         $"Loại hoa: {flower.FlowerType}. " +
                         $"Màu sắc: {flower.Color}. " +
                         $"Kích thước: {flower.BouquetSize}. " +
                         $"Trọng lượng: {flower.WeightKg} kg. " +
                         $"Dịp tặng phù hợp: {flower.Occasion}. " +
                         $"Ý nghĩa: {flower.Meaning}. " +
                         $"Mô tả chi tiết: {flower.Description}";

                try
                {
                    Console.Write($" -> Đang xử lý: {flower.Name}... ");

                    // Request body chuẩn chỉnh theo tài liệu API của Google
                    var requestBody = new
                    {
                        model = "models/gemini-embedding-001",
                        content = new
                        {
                            parts = new[] { new { text = fullTextToEmbed } }
                        }
                    };

                    var response = await httpClient.PostAsJsonAsync(geminiUrl, requestBody);

                    if (!response.IsSuccessStatusCode)
                    {
                        string errorResponse = await response.Content.ReadAsStringAsync();
                        // In thêm StatusCode để bắt bệnh
                        Console.WriteLine($"Lỗi API Gemini (Status: {response.StatusCode}): {errorResponse}");
                        continue;
                    }

                    // Parse kết quả trả về (Cấu trúc: embedding.values)
                    using var jsonDoc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
                    var valuesElement = jsonDoc.RootElement
                        .GetProperty("embedding")
                        .GetProperty("values");

                    List<float> vectorList = new();
                    foreach (var val in valuesElement.EnumerateArray())
                    {
                        vectorList.Add(val.GetSingle());
                    }

                    flower.FlowerVector = vectorList;

                    // Lưu/Cập nhật vào MongoDB (Upsert theo ProductId)
                    var filter = Builders<FlowerEmbeddingDocument>.Filter.Eq(f => f.ProductId, flower.ProductId);
                    await collection.ReplaceOneAsync(filter, flower, new ReplaceOptions { IsUpsert = true });

                    Console.WriteLine("Đã nạp xong!");
                    successCount++;

                    // Giữ delay 2 giây
                    await Task.Delay(2000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Thất bại: {ex.Message}");
                }
            }

            Console.WriteLine($"\n=== HOÀN THÀNH ===");
            Console.WriteLine($"Đã nạp thành công: {successCount}/{flowers.Count} sản phẩm hoa lên MongoDB Atlas.");
        }
    }
}