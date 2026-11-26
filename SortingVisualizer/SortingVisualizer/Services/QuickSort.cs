using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class QuickSort
    {
        public static List<SortStep> Sort(
            int[] input, string order = "asc")
        {
            // Kiểm tra mảng đầu vào
            if (input == null)
            {
                throw new ArgumentNullException(
                    nameof(input), "Mảng đầu vào không được null.");
            }

            // Kiểm tra chiều sắp xếp
            if (order != "asc" && order != "desc")
            {
                throw new ArgumentException(
                    "Chiều sắp xếp không hợp lệ.");
            }

            bool ascending = order == "asc";

            // Sao chép mảng đầu vào
            int[] arr = (int[])input.Clone();

            // Danh sách các bước mô phỏng
            List<SortStep> steps = new();

            // Danh sách vị trí đã sắp xếp hoàn tất
            List<int> sortedIndices = new();

            int n = arr.Length;

            // Mảng rỗng hoặc chỉ có một phần tử
            if (n <= 1)
            {
                steps.Add(new SortStep
                {
                    Type = "done",
                    Array = (int[])arr.Clone(),
                    Indices = [],
                    SortedIndices = n == 1 ? new[] { 0 } : [],
                    Description = n == 0
                        ? "Mảng rỗng, không cần sắp xếp"
                        : "Mảng chỉ có một phần tử, không cần sắp xếp"
                });

                return steps;
            }
            // Ghi nhận một bước mô phỏng
            void Record(
                string type,
                int[] indices,
                string description,
                int? pivotIndex = null,
                int[]? range = null)
            {
                steps.Add(new SortStep
                {
                    Type = type,
                    Array = (int[])arr.Clone(),
                    Indices = indices,
                    SortedIndices = sortedIndices.ToArray(),
                    PivotIndex = pivotIndex,
                    PartitionRange = range ?? [],
                    Description = description
                });
            }

            // Hàm sắp xếp đệ quy
            void QuickSortRange(int left, int right)
            {
                // Đoạn mảng không có phần tử
                if (left > right)
                {
                    return;
                }

                // Đoạn mảng chỉ có một phần tử
                if (left == right)
                {
                    sortedIndices.Add(left);

                    Record(
                        "sorted",
                        new[] { left },
                        $"Phần tử {arr[left]} đã đúng vị trí");

                    return;
                }

                // Phân hoạch và lấy vị trí cuối cùng của pivot
                int pivotIndex = Partition(left, right);

                // Đánh dấu pivot đã đúng vị trí
                sortedIndices.Add(pivotIndex);

                Record(
                    "sorted",
                    new[] { pivotIndex },
                    $"Pivot {arr[pivotIndex]} đã đúng vị trí",
                    pivotIndex,
                    new[] { left, right });

                // Sắp xếp đoạn bên trái pivot
                QuickSortRange(left, pivotIndex - 1);

                // Sắp xếp đoạn bên phải pivot
                QuickSortRange(pivotIndex + 1, right);
            }

            // Hàm phân hoạch 
            int Partition(int left, int right)
            {
                // Chọn phần tử cuối đoạn làm pivot
                int pivot = arr[right];

                int[] range = new[] { left, right };

                Record(
                    "pivot",
                    new[] { right },
                    $"Chọn phần tử {pivot} làm pivot",
                    right,
                    range);

                // Vị trí cuối của vùng thỏa mãn điều kiện
                int i = left - 1;

                // Duyệt các phần tử trước pivot
                for (int j = left; j < right; j++)
                {
                    // Ghi nhận bước so sánh
                    Record(
                        "compare",
                        new[] { j, right },
                        $"So sánh {arr[j]} với pivot = {pivot}",
                        right,
                        range);

                    // Xét chiều sắp xếp
                    bool shouldMove = ascending
                        ? arr[j] <= pivot
                        : arr[j] >= pivot;

                    if (shouldMove)
                    {
                        i++;

                        // Chỉ hoán đổi khi hai vị trí khác nhau
                        if (i != j)
                        {
                            (arr[i], arr[j]) =
                                (arr[j], arr[i]);

                            Record(
                                "swap",
                                new[] { i, j },
                                $"Hoán đổi {arr[j]} và {arr[i]}",
                                right,
                                range);
                        }
                    }
                }

                // Xác định vị trí cuối cùng của pivot
                int finalPivotIndex = i + 1;

                // Đưa pivot về đúng vị trí
                if (finalPivotIndex != right)
                {
                    (arr[finalPivotIndex], arr[right]) =
                        (arr[right], arr[finalPivotIndex]);

                    Record(
                        "swap",
                        new[] { finalPivotIndex, right },
                        $"Đưa pivot {pivot} từ vị trí {right} " +
                        $"về vị trí {finalPivotIndex}",
                        finalPivotIndex,
                        range);
                }

                return finalPivotIndex;
            }

            // Bắt đầu sắp xếp
            QuickSortRange(0, n - 1);

            // Chuẩn hóa thứ tự các chỉ số đã hoàn thành
            sortedIndices = Enumerable.Range(0, n).ToList();

            // Ghi nhận bước hoàn thành
            Record(
                "done",
                [],
                ascending
                    ? "Hoàn thành sắp xếp tăng dần"
                    : "Hoàn thành sắp xếp giảm dần");

            return steps;
        }
    }
}
