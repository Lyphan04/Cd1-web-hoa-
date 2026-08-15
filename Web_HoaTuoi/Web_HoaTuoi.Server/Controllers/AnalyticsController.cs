using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;

namespace Web_HoaTuoi.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly string _dwhConnectionString;

        public AnalyticsController(IConfiguration configuration)
        {
            _dwhConnectionString = configuration.GetConnectionString("DwhConnection")!;
        }

        // 1. Chỉ số tổng quan KPI (Lấy từ HoaTuoi_DWH)
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            using var connection = new SqlConnection(_dwhConnectionString);
            var sql = @"
                SELECT 
                    ISNULL(SUM(TotalAmount), 0) AS TotalRevenue,
                    ISNULL(SUM(Profit), 0) AS TotalProfit,
                    ISNULL(SUM(Quantity), 0) AS TotalQty,
                    COUNT(DISTINCT OrderId) AS TotalOrders
                FROM Fact_Sales;";
            
            var data = connection.QueryFirstOrDefault(sql);
            return Ok(data);
        }

        // 2. Biểu đồ doanh thu & lợi nhuận theo tháng (Lấy từ HoaTuoi_DWH)
        [HttpGet("revenue-chart")]
        public IActionResult GetRevenueChart([FromQuery] string type = "year")
        {
            using var connection = new SqlConnection(_dwhConnectionString);
            var sql = @"
                SELECT 
                    dt.Month,
                    SUM(fs.TotalAmount) AS Revenue,
                    SUM(fs.Profit) AS Profit
                FROM Fact_Sales fs
                JOIN Dim_Time dt ON fs.TimeKey = dt.TimeKey
                GROUP BY dt.Month
                ORDER BY dt.Month;";
            
            var data = connection.Query(sql).ToList();
            
            var result = Enumerable.Range(1, 12).Select(month => {
                var row = data.FirstOrDefault(d => d.Month == month);
                return new
                {
                    Label = $"Tháng {month}",
                    Revenue = row?.Revenue ?? 0,
                    Profit = row?.Profit ?? 0
                };
            }).ToList();

            return Ok(result);
        }

        // 3. Kích hoạt đồng bộ dữ liệu phân tích ETL thủ công
        [HttpPost("sync")]
        public async Task<IActionResult> RunEtlSync()
        {
            try
            {
                using var connection = new SqlConnection(_dwhConnectionString);
                await connection.ExecuteAsync("sp_ETL_Load_HoaTuoi_DWH", commandType: CommandType.StoredProcedure);
                return Ok(new { success = true, message = "Đồng bộ dữ liệu phân tích (ETL) từ CSDL giao dịch sang DWH thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi đồng bộ ETL: {ex.Message}" });
            }
        }

        // 4. Top hoa bán chạy (Lấy từ HoaTuoi_DWH)
        [HttpGet("top-products")]
        public IActionResult GetTopProducts()
        {
            using var connection = new SqlConnection(_dwhConnectionString);
            var sql = @"
                SELECT TOP 5 
                    dp.ProductKey AS productId,
                    dp.ProductName AS productName,
                    SUM(fs.Quantity) AS totalSold
                FROM Fact_Sales fs
                JOIN Dim_Product dp ON fs.ProductKey = dp.ProductKey
                GROUP BY dp.ProductKey, dp.ProductName
                ORDER BY totalSold DESC;";
            
            var data = connection.Query(sql);
            return Ok(data);
        }

        // 5. Phân khúc khách hàng (Lấy từ HoaTuoi_DWH)
        [HttpGet("customer-segments")]
        public IActionResult GetCustomerSegments()
        {
            using var connection = new SqlConnection(_dwhConnectionString);
            var sql = @"
                WITH CustomerSpending AS (
                    SELECT 
                        dc.CustomerKey,
                        SUM(fs.TotalAmount) AS TotalSpent
                    FROM Fact_Sales fs
                    JOIN Dim_Customer dc ON fs.CustomerKey = dc.CustomerKey
                    WHERE dc.CustomerKey != -1
                    GROUP BY dc.CustomerKey
                )
                SELECT 
                    CASE 
                        WHEN TotalSpent >= 5000000 THEN N'Khách VIP (>5tr)'
                        WHEN TotalSpent >= 2000000 THEN N'Khách quen (2-5tr)'
                        ELSE N'Khách phổ thông (<2tr)'
                    END AS segment,
                    COUNT(CustomerKey) AS count
                FROM CustomerSpending
                GROUP BY 
                    CASE 
                        WHEN TotalSpent >= 5000000 THEN N'Khách VIP (>5tr)'
                        WHEN TotalSpent >= 2000000 THEN N'Khách quen (2-5tr)'
                        ELSE N'Khách phổ thông (<2tr)'
                    END
                ORDER BY count DESC;";
            
            var data = connection.Query(sql);
            return Ok(data);
        }
    }
}
