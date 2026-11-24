using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class SelectionSort
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

            for (int i = 0; i < n - 1; i++)
            {
                int selectedIndex = i;

                for (int j = i + 1; j < n; j++)
                {
                    // Ghi nhận bước so sánh
                    steps.Add(new SortStep
                    {
                        Type = "compare",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { selectedIndex, j },
                        SortedIndices = sortedIndices.ToArray(),
                        Description = $"So sánh {arr[selectedIndex]} và {arr[j]}"
                    });

                    // Xét theo chiều sắp xếp
                    bool shouldSelect = ascending
                        ? arr[j] < arr[selectedIndex]
                        : arr[j] > arr[selectedIndex];

                    if (shouldSelect)
                    {
                        selectedIndex = j;

                        // Ghi nhận phần tử được chọn
                        steps.Add(new SortStep
                        {
                            Type = "select",
                            Array = (int[])arr.Clone(),
                            Indices = new[] { selectedIndex },
                            SortedIndices = sortedIndices.ToArray(),
                            Description = ascending
                                ? $"Tìm thấy phần tử nhỏ nhất mới: {arr[selectedIndex]}"
                                : $"Tìm thấy phần tử lớn nhất mới: {arr[selectedIndex]}"
                        });
                    }
                }

                // Hoán đổi nếu cần
                if (selectedIndex != i)
                {
                    (arr[i], arr[selectedIndex]) =
                        (arr[selectedIndex], arr[i]);

                    steps.Add(new SortStep
                    {
                        Type = "swap",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { i, selectedIndex },
                        SortedIndices = sortedIndices.ToArray(),
                        Description = $"Hoán đổi {arr[selectedIndex]} và {arr[i]}"
                    });
                }

                // Thêm vị trí i vào danh sách đã sắp xếp
                sortedIndices.Add(i);

                // Ghi nhận phần tử đã đúng vị trí
                steps.Add(new SortStep
                {
                    Type = "sorted",
                    Array = (int[])arr.Clone(),
                    Indices = new[] { i },
                    SortedIndices = sortedIndices.ToArray(),
                    Description = $"Phần tử {arr[i]} đã đúng vị trí"
                });
            }

            // Đánh dấu phần tử cuối cùng đã đúng vị trí
            sortedIndices.Add(n - 1);

            // Ghi nhận bước hoàn thành
            steps.Add(new SortStep
            {
                Type = "done",
                Array = (int[])arr.Clone(),
                Indices = Array.Empty<int>(),
                SortedIndices = sortedIndices.ToArray(),
                Description = ascending
                    ? "Hoàn thành sắp xếp tăng dần"
                    : "Hoàn thành sắp xếp giảm dần"
            });

            return steps;
        }
    }
}
