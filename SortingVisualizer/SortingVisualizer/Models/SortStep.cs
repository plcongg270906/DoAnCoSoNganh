namespace SortingVisualizer.Models
{
    public class SortStep
    {
        public string Type { get; set; } = ""; //Loại thao tác: so sánh, hoán đổi, hoàn thành...
        public int[] Array { get; set; } = []; //Trạng thái mảng tại bước hiện tại
        public int[] Indices { get; set; } = []; //Vị trí các phần tử cần làm nổi bật
        public string Description { get; set; } = ""; //Giải thích thao tác đang diễn ras
    }
}
