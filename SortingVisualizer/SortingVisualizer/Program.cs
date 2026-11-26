var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Chuyển hướng HTTP sang HTTPS
app.UseHttpsRedirection();

// Sử dụng file mặc định index.html
app.UseDefaultFiles();

// Cho phép truy cập các file trong wwwroot
app.UseStaticFiles();

// Middleware phân quyền
app.UseAuthorization();

// Ánh xạ các Controller
app.MapControllers();

// Khởi chạy ứng dụng
app.Run();