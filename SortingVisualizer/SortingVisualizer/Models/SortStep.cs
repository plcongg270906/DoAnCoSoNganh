namespace SortingVisualizer.Models
{
    public class SortStep
    {
        // Loại thao tác đang thực hiện
        public string Type { get; set; } = "";

        // Trạng thái mảng tại bước hiện tại
        public int[] Array { get; set; } = [];

        // Vị trí các phần tử đang được xử lý
        public int[] Indices { get; set; } = [];

        // Vị trí các phần tử đã sắp xếp hoàn tất
        public int[] SortedIndices { get; set; } = [];

        // Giải thích thao tác đang diễn ra
        public string Description { get; set; } = "";
    }
}
