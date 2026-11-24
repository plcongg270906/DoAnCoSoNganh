namespace SortingVisualizer.Models
{
    public class SortRequest
    {
        // Thuật toán được người dùng lựa chọn
        public string Algorithm { get; set; } = "";

        // Mảng số nguyên cần sắp xếp
        public int[]? Values { get; set; }

        // Chiều sắp xếp, mặc định là tăng dần
        public string Order { get; set; } = "asc";
    }
}
