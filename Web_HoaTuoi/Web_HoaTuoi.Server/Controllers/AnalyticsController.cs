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

        // 1. Biểu đồ doanh thu (Lấy từ HoaTuoi_DWH)
        [HttpGet("revenue-chart")]
        public IActionResult GetRevenueChart([FromQuery] string type = "year")
        {
            using var connection = new SqlConnection(_dwhConnectionString);
            
            // Lấy doanh thu theo tháng (để khớp yêu cầu "Doanh thu theo tháng" của đồ án)
            var sql = @"
                SELECT 
                    dt.Month,
                    SUM(fs.TotalAmount) AS Revenue
                FROM Fact_Sales fs
                JOIN Dim_Time dt ON fs.TimeKey = dt.TimeKey
                GROUP BY dt.Month
                ORDER BY dt.Month;";
            
            var data = connection.Query(sql).ToList();
            
            var result = Enumerable.Range(1, 12).Select(month => new
            {
                Label = $"Tháng {month}",
                Revenue = data.FirstOrDefault(d => d.Month == month)?.Revenue ?? 0
            }).ToList();

            return Ok(result);
        }

        // 2. Top hoa bán chạy (Lấy từ HoaTuoi_DWH)
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

        // 3. Phân khúc khách hàng (Lấy từ HoaTuoi_DWH)
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
