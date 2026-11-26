namespace SortingVisualizer.Models
{
    public class SortResponse
    {
        // Thuật toán đã sử dụng
        public string Algorithm { get; set; } = "";

        // Chiều sắp xếp
        public string Order { get; set; } = "";

        // Mảng ban đầu
        public int[] Original { get; set; } = [];

        // Mảng sau khi sắp xếp
        public int[] Sorted { get; set; } = [];

        // Danh sách các bước mô phỏng
        public List<SortStep> Steps { get; set; } = new();

        // Thống kê các thao tác
        public SortStatistics Statistics { get; set; } = new();
    }

    public class SortStatistics
    {
        // Số lần so sánh
        public int Comparisons { get; set; }

        // Số lần hoán đổi
        public int Swaps { get; set; }

        // Số bước dịch chuyển phần tử (Type = "move")
        public int Moves { get; set; }
    }
}
