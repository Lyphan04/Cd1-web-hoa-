using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Web_HoaTuoi.Server.Data;
using Web_HoaTuoi.Server.DTOs;
using Web_HoaTuoi.Server.Models;
using Web_HoaTuoi.Server.Services;

namespace Web_HoaTuoi.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    // === Thông tin tài khoản ngân hàng để tạo VietQR ===
    private const string QrBankId = "VCB";               // Vietcombank
    private const string QrAccountNumber = "1029045872"; // Số tài khoản thật
    private const string QrAccountName = "PHAN THI KIM LY"; // Tên tài khoản

    private readonly AppDbContext _db;
    private readonly IInventoryService _inventory;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        AppDbContext db,
        IInventoryService inventory,
        ILogger<OrdersController> logger)
    {
        _db = db;
        _inventory = inventory;
        _logger = logger;
    }

    // POST /api/orders
    [HttpPost]
    [Authorize]
    [EnableRateLimiting("OrderLimit")]
    public async Task<ActionResult<object>> CreateOrder([FromBody] CreateOrderRequest req)
    {
        if (!req.Items.Any())
            return BadRequest(new { message = "Giỏ hàng trống." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var stockItems = req.Items
            .Select(i => (i.ProductId, i.Quantity))
            .ToList();

        var stockDecremented = false;

        try
        {
            // ===== Trừ kho Redis =====
            var outOfStock = await _inventory.DecrementStockAsync(stockItems);

            if (outOfStock.Any())
            {
                var names = await _db.Products
                    .Where(p => outOfStock.Contains(p.Id))
                    .Select(p => p.Name)
                    .ToListAsync();

                return Conflict(new
                {
                    message = $"Hết hàng: {string.Join(", ", names)}"
                });
            }

            stockDecremented = true;

            // ===== Tạo OrderItems =====
            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var item in req.Items)
            {
                totalAmount += item.UnitPrice * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    ProductImage = item.MainImageUrl,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity
                });
            }

            // ===== Tạo mã đơn =====
            var orderCode =
                $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";

            var order = new Order
            {
                OrderCode = orderCode,
                UserId = userId,
                Status = OrderStatus.Pending,
                ReceiverName = req.ReceiverName,
                ReceiverPhone = req.ReceiverPhone,
                ReceiverAddress = req.ReceiverAddress,
                MessageCard = req.MessageCard,
                DeliveryTime = req.DeliveryTime,
                IsStorePickup = req.IsStorePickup,
                ShippingFee = req.ShippingFee,
                TotalAmount = totalAmount,
                FinalAmount = totalAmount + req.ShippingFee,
                IsPaid = false,
                CreatedAt = DateTime.UtcNow,
                Items = orderItems
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // ===== Update Stock SQL =====
            foreach (var item in req.Items)
            {
                await _db.Products
                    .Where(p => p.Id == item.ProductId)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(p => p.Stock,
                            p => p.Stock - item.Quantity)
                        .SetProperty(p => p.SoldCount,
                            p => p.SoldCount + item.Quantity));
            }

            var summary = new OrderSummaryDto(
                order.Id,
                order.OrderCode,
                order.Status.ToString(),
                order.FinalAmount,
                order.IsPaid,
                order.CreatedAt,
                order.Items.Select(i => new CartItemDto(
                    i.ProductId,
                    i.ProductName,
                    i.ProductImage ?? "",
                    i.UnitPrice,
                    i.Quantity)));

            // ===== Trả về thông tin QR nếu chọn thanh toán QR =====
            object? qrInfo = null;
            if (req.PaymentMethod == "QrCode")
            {
                qrInfo = new
                {
                    bankId = QrBankId,
                    accountNumber = QrAccountNumber,
                    accountName = QrAccountName,
                    amount = (long)order.FinalAmount,
                    description = $"DH {order.OrderCode}",
                    orderCode = order.OrderCode
                };
            }

            return Ok(new
            {
                orderSummary = summary,
                qrInfo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi tạo đơn hàng");

            if (stockDecremented)
                await _inventory.RestoreStockAsync(stockItems);

            return StatusCode(500, new
            {
                message = "Lỗi hệ thống khi tạo đơn hàng."
            });
        }
    }

    // GET /api/orders/my
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetMyOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.OrderCode,
                o.Status.ToString(),
                o.FinalAmount,
                (bool?)o.IsPaid ?? false,
                o.CreatedAt,
                o.Items.Select(i => new CartItemDto(
                    i.ProductId,
                    i.ProductName,
                    i.ProductImage ?? "",
                    i.UnitPrice,
                    i.Quantity))))
            .ToListAsync();

        return Ok(orders);
    }

    // GET /api/orders/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<OrderDetailDto>> GetOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o =>
                o.Id == id && (isAdmin || o.UserId == userId));

        if (order is null)
            return NotFound();

        var dto = new OrderDetailDto(
            order.Id,
            order.OrderCode,
            order.Status.ToString(),
            order.ReceiverName,
            order.ReceiverPhone,
            order.ReceiverAddress,
            order.MessageCard,
            order.DeliveryTime,
            order.IsStorePickup,
            order.ShippingFee,
            order.TotalAmount,
            order.FinalAmount,
            order.IsPaid,
            order.VnpayTransactionId,
            order.Items.Select(i => new CartItemDto(
                i.ProductId,
                i.ProductName,
                i.ProductImage ?? "",
                i.UnitPrice,
                i.Quantity)),
            order.CreatedAt);

        return Ok(dto);
    }

    // GET /api/orders  (Admin)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> GetAllOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null)
    {
        var query = _db.Orders.AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var parsedStatus))
        {
            query = query.Where(o => o.Status == parsedStatus);
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id,
                o.OrderCode,
                Status = o.Status.ToString(),
                o.ReceiverName,
                o.ReceiverPhone,
                o.FinalAmount,
                IsPaid = (bool?)o.IsPaid ?? false,
                o.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Total = total,
            Page = page,
            PageSize = pageSize,
            Items = items
        });
    }

    // PUT /api/orders/{id}/cancel
    [HttpPut("{id:int}/cancel")]
    [Authorize]
    public async Task<ActionResult> CancelOrder(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order is null)
            return NotFound();

        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Processing)
            return BadRequest(new { message = "Chỉ có thể huỷ đơn hàng chưa được giao." });

        order.Status = OrderStatus.Cancelled;

        // Restore stock
        foreach (var item in order.Items)
        {
            await _db.Products
                .Where(p => p.Id == item.ProductId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(p => p.Stock, p => p.Stock + item.Quantity)
                    .SetProperty(p => p.SoldCount, p => p.SoldCount - item.Quantity));
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Huỷ đơn hàng thành công" });
    }

    // PUT /api/orders/{id}/status
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateStatus(
        int id,
        [FromBody] UpdateOrderStatusRequest req)
    {
        var order = await _db.Orders.FindAsync(id);

        if (order is null)
            return NotFound();

        if (!Enum.TryParse<OrderStatus>(req.Status, out var newStatus))
            return BadRequest(new { message = "Status không hợp lệ." });

        order.Status = newStatus;

        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public record UpdateOrderStatusRequest(string Status);