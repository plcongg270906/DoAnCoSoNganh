using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class BubbleSort
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
                // Kiểm tra có xảy ra hoán đổi hay không
                bool swapped = false;

                for (int j = 0; j < n - i - 1; j++)
                {
                    // Ghi nhận bước so sánh
                    steps.Add(new SortStep
                    {
                        Type = "compare",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { j, j + 1 },
                        SortedIndices = sortedIndices.ToArray(),
                        Description = $"So sánh {arr[j]} và {arr[j + 1]}"
                    });

                    // Xét chiều sắp xếp
                    bool shouldSwap = ascending
                        ? arr[j] > arr[j + 1]
                        : arr[j] < arr[j + 1];

                    if (shouldSwap)
                    {
                        // Hoán đổi hai phần tử liền kề
                        (arr[j], arr[j + 1]) =
                            (arr[j + 1], arr[j]);

                        swapped = true;

                        // Ghi nhận bước hoán đổi
                        steps.Add(new SortStep
                        {
                            Type = "swap",
                            Array = (int[])arr.Clone(),
                            Indices = new[] { j, j + 1 },
                            SortedIndices = sortedIndices.ToArray(),
                            Description = $"Hoán đổi {arr[j + 1]} và {arr[j]}"
                        });
                    }
                }

                // Vị trí cuối đoạn chưa sắp xếp
                int sortedIndex = n - i - 1;

                // Đánh dấu vị trí đã hoàn thành
                sortedIndices.Add(sortedIndex);

                steps.Add(new SortStep
                {
                    Type = "sorted",
                    Array = (int[])arr.Clone(),
                    Indices = new[] { sortedIndex },
                    SortedIndices = sortedIndices.ToArray(),
                    Description = $"Phần tử {arr[sortedIndex]} đã đúng vị trí"
                });

                // Nếu không có hoán đổi thì mảng đã có thứ tự
                if (!swapped)
                {
                    break;
                }
            }

            // Đánh dấu tất cả vị trí đã hoàn thành
            sortedIndices.Clear();

            for (int i = 0; i < n; i++)
            {
                sortedIndices.Add(i);
            }

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
