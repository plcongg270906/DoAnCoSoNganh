using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class SelectionSort
    {
        public static List<SortStep> Sort(
            int[] input, string order = "asc")
        {
            // Kiểm tra chiều sắp xếp
            if (order != "asc" && order != "desc")
            {
                throw new ArgumentException(
                    "Chiều sắp xếp không hợp lệ.");
            }

            bool ascending = order == "asc";

            // Sao chép mảng đầu vào
            int[] arr = (int[])input.Clone();
            List<SortStep> steps = new();

            int n = arr.Length;

            for (int i = 0; i < n; i++)
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
                        Description = "So sánh hai phần tử"
                    });

                    // Xét theo chiều sắp xếp
                    bool shouldSelect = ascending
                        ? arr[j] < arr[selectedIndex]
                        : arr[j] > arr[selectedIndex];

                    if (shouldSelect)
                    {
                        selectedIndex = j;

                        steps.Add(new SortStep
                        {
                            Type = "select",
                            Array = (int[])arr.Clone(),
                            Indices = new[] { selectedIndex },
                            Description = ascending
                                ? "Tìm thấy phần tử nhỏ nhất mới"
                                : "Tìm thấy phần tử lớn nhất mới"
                        });
                    }
                }

                // Hoán đổi hai phần tử nếu cần
                if (selectedIndex != i)
                {
                    (arr[i], arr[selectedIndex]) =
                        (arr[selectedIndex], arr[i]);

                    steps.Add(new SortStep
                    {
                        Type = "swap",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { i, selectedIndex },
                        Description = "Hoán đổi hai phần tử"
                    });
                }

                // Đánh dấu phần tử đã sắp xếp
                steps.Add(new SortStep
                {
                    Type = "sorted",
                    Array = (int[])arr.Clone(),
                    Indices = new[] { i },
                    Description = "Phần tử đã đúng vị trí"
                });
            }

            // Ghi nhận bước hoàn thành
            steps.Add(new SortStep
            {
                Type = "done",
                Array = (int[])arr.Clone(),
                Indices = Array.Empty<int>(),
                Description = ascending
                    ? "Hoàn thành sắp xếp tăng dần"
                    : "Hoàn thành sắp xếp giảm dần"
            });

            return steps;
        }
    }
}
