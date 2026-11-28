using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class InsertionSort
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

            for (int i = 1; i < n; i++)
            {
                int key = arr[i];
                int j = i - 1;

                // Ghi nhận bước chọn key
                steps.Add(new SortStep
                {
                    Type = "select",
                    Array = (int[])arr.Clone(),
                    Indices = new[] { i },
                    SortedIndices = [],
                    KeyValue = key,
                    HoleIndex = i,
                    Description = $"Chọn phần tử {key} làm key",

                    // Ghi nhận vị trí các con trỏ
                    Pointers = new Dictionary<string, int>
                    {
                        ["i"] = i,
                        ["j"] = j,
                        ["holeIndex"] = i
                    }
                });

                while (j >= 0)
                {
                    // Ghi nhận bước so sánh với key
                    steps.Add(new SortStep
                    {
                        Type = "compare",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { j, j + 1 },
                        SortedIndices = [],
                        KeyValue = key,
                        HoleIndex = j + 1,
                        Description = $"So sánh {arr[j]} với key = {key}",

                        // Cập nhật vị trí các con trỏ
                        Pointers = new Dictionary<string, int>
                        {
                            ["i"] = i,
                            ["j"] = j,
                            ["holeIndex"] = j + 1
                        }
                    });

                    bool shouldMove = ascending
                        ? arr[j] > key
                        : arr[j] < key;

                    if (!shouldMove)
                    {
                        break;
                    }

                    // Dịch chuyển phần tử sang phải
                    arr[j + 1] = arr[j];

                    // Ghi nhận bước dịch chuyển
                    steps.Add(new SortStep
                    {
                        Type = "move",
                        Array = (int[])arr.Clone(),
                        Indices = new[] { j, j + 1 },
                        SortedIndices = [],
                        KeyValue = key,
                        HoleIndex = j,
                        Description = $"Dịch chuyển {arr[j]} từ vị trí {j} sang vị trí {j + 1}",

                        // Ô trống đã chuyển sang trái
                        Pointers = new Dictionary<string, int>
                        {
                            ["i"] = i,
                            ["j"] = j,
                            ["holeIndex"] = j
                        }
                    });

                    j--;
                }

                // Chèn key vào vị trí thích hợp
                arr[j + 1] = key;

                // Ghi nhận bước chèn
                steps.Add(new SortStep
                {
                    Type = "insert",
                    Array = (int[])arr.Clone(),
                    Indices = new[] { j + 1 },
                    SortedIndices = [],
                    KeyValue = null,
                    HoleIndex = null,
                    Description = $"Chèn key = {key} vào vị trí {j + 1}",

                    // Đánh dấu vị trí chèn
                    Pointers = new Dictionary<string, int>
                    {
                        ["i"] = i,
                        ["j"] = j,
                        ["j+1"] = j + 1
                    }
                });
            }


            // Ghi nhận bước hoàn thành
            steps.Add(new SortStep
            {
                Type = "done",
                Array = (int[])arr.Clone(),
                Indices = [],
                SortedIndices = Enumerable.Range(0, n).ToArray(),//tạo một mảng chứa tất cả chỉ số từ 0 đến n - 1
                Description = ascending
                    ? "Hoàn thành sắp xếp tăng dần"
                    : "Hoàn thành sắp xếp giảm dần"
            });

            return steps;
        }
    }
}
