using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class HeapSort
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
                    HeapSize = 0,
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
                int heapSize)
            {
                steps.Add(new SortStep
                {
                    Type = type,
                    Array = (int[])arr.Clone(),
                    Indices = indices,
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = heapSize,
                    Description = description
                });
            }

            // Điều chỉnh cấu trúc Heap
            void Heapify(int heapSize, int root)
            {
                // Điều chỉnh Heap từ nút root
                while (true)
                {
                    // Vị trí phần tử lớn nhất hoặc nhỏ nhất
                    int selectedIndex = root;

                    // Xác định vị trí hai nút con
                    int left = 2 * root + 1;
                    int right = 2 * root + 2;

                    // Kiểm tra nút con bên trái
                    if (left < heapSize)
                    {
                        Record(
                            "compare",
                            new[] { selectedIndex, left },
                            $"So sánh {arr[selectedIndex]} và {arr[left]}",
                            heapSize);

                        bool shouldSelectLeft = ascending
                            ? arr[left] > arr[selectedIndex]
                            : arr[left] < arr[selectedIndex];

                        if (shouldSelectLeft)
                        {
                            selectedIndex = left;
                        }
                    }

                    // Kiểm tra nút con bên phải
                    if (right < heapSize)
                    {
                        Record(
                            "compare",
                            new[] { selectedIndex, right },
                            $"So sánh {arr[selectedIndex]} và {arr[right]}",
                            heapSize);

                        bool shouldSelectRight = ascending
                            ? arr[right] > arr[selectedIndex]
                            : arr[right] < arr[selectedIndex];

                        if (shouldSelectRight)
                        {
                            selectedIndex = right;
                        }
                    }

                    // Nếu nút gốc đã thỏa mãn tính chất Heap
                    if (selectedIndex == root)
                    {
                        break;
                    }

                    // Hoán đổi nút gốc với nút được chọn
                    (arr[root], arr[selectedIndex]) =
                        (arr[selectedIndex], arr[root]);

                    Record(
                        "swap",
                        new[] { root, selectedIndex },
                        $"Hoán đổi {arr[selectedIndex]} và {arr[root]}",
                        heapSize);

                    // Tiếp tục điều chỉnh Heap tại vị trí mới
                    root = selectedIndex;
                }
            }

            // GIAI ĐOẠN 1: Xây dựng Heap
            for (int i = n / 2 - 1; i >= 0; i--)
            {
                Heapify(n, i);
            }

            // Ghi nhận bước xây dựng Heap hoàn thành
            Record(
                "heap",
                Enumerable.Range(0, n).ToArray(),
                ascending
                    ? "Hoàn thành xây dựng Max Heap"
                    : "Hoàn thành xây dựng Min Heap",
                n);

            // GIAI ĐOẠN 2: Sắp xếp
            for (int i = n - 1; i > 0; i--)
            {
                // Hoán đổi nút gốc với phần tử cuối Heap
                (arr[0], arr[i]) = (arr[i], arr[0]);

                Record(
                    "swap",
                    new[] { 0, i },
                    $"Hoán đổi {arr[i]} và {arr[0]}",
                    i + 1);

                // Đánh dấu phần tử đã đúng vị trí
                sortedIndices.Add(i);

                Record(
                    "sorted",
                    new[] { i },
                    $"Phần tử {arr[i]} đã đúng vị trí",
                    i);

                // Điều chỉnh lại Heap sau khi thu nhỏ
                Heapify(i, 0);
            }

            // Đánh dấu toàn bộ vị trí đã hoàn thành
            sortedIndices = Enumerable.Range(0, n).ToList();

            // Ghi nhận bước hoàn thành
            Record(
                "done",
                [],
                ascending
                    ? "Hoàn thành sắp xếp tăng dần"
                    : "Hoàn thành sắp xếp giảm dần",
                0);

            return steps;
        }
    }
}
