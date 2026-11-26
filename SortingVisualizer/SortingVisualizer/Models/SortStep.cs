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

        // Giá trị phần tử đang được giữ tạm
        public int? KeyValue { get; set; }

        // Vị trí trống về mặt logic
        public int? HoleIndex { get; set; }

        // Phạm vi đang xử lý: left, mid, right
        public int[] MergeRange { get; set; } = [];

        // Mảng phụ chứa kết quả đang trộn
        public int[]? MergeBuffer { get; set; }

        // Vị trí hiện tại của phần tử chốt
        public int? PivotIndex { get; set; }

        // Phạm vi đang phân hoạch: left, right
        public int[] PartitionRange { get; set; } = [];

        // Số lượng phần tử thuộc vùng Heap đang xử lý
        public int? HeapSize { get; set; }
    }
}
