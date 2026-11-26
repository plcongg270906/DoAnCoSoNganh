using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SortingVisualizer.Models;
using SortingVisualizer.Services;

namespace SortingVisualizer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SortController : ControllerBase
    {
        [HttpPost]
        public IActionResult Sort([FromBody] SortRequest request)
        {
            // Kiểm tra mảng đầu vào
            if (request.Values == null)
            {
                return BadRequest(new
                {
                    message = "Mảng đầu vào không được null."
                });
            }

            // Giới hạn số lượng phần tử
            if (request.Values.Length > 20)
            {
                return BadRequest(new
                {
                    message = "Mảng không được vượt quá 20 phần tử."
                });
            }

            // Kiểm tra chiều sắp xếp
            if (request.Order != "asc" &&
                request.Order != "desc")
            {
                return BadRequest(new
                {
                    message = "Chiều sắp xếp không hợp lệ."
                });
            }

            List<SortStep> steps;

            // Lựa chọn thuật toán
            switch (request.Algorithm)
            {
                case "selection":
                    steps = SelectionSort.Sort(
                        request.Values, request.Order);
                    break;

                case "bubble":
                    steps = BubbleSort.Sort(
                        request.Values, request.Order);
                    break;

                case "insertion":
                    steps = InsertionSort.Sort(
                        request.Values, request.Order);
                    break;

                case "merge":
                    steps = MergeSort.Sort(
                        request.Values, request.Order);
                    break;
                    
                default:
                    return BadRequest(new
                    {
                        message = "Thuật toán không hợp lệ hoặc chưa được hỗ trợ."
                    });
            }

            // Thống kê các thao tác
            SortStatistics statistics = new()
            {
                Comparisons = steps.Count(
                    step => step.Type == "compare"),

                Swaps = steps.Count(
                    step => step.Type == "swap"),

                Moves = steps.Count(
                    step => step.Type == "move")
            };

            // Tạo dữ liệu phản hồi
            SortResponse response = new()
            {
                Algorithm = request.Algorithm,
                Order = request.Order,
                Original = (int[])request.Values.Clone(),
                Sorted = (int[])steps.Last().Array.Clone(),
                Steps = steps,
                Statistics = statistics
            };

            // Trả kết quả về frontend
            return Ok(response);
        }
    }
}
