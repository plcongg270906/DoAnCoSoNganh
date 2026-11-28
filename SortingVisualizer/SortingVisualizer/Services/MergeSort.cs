using SortingVisualizer.Models;

namespace SortingVisualizer.Services
{
    public class MergeSort
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

            // Ghi nhận một bước mô phỏng
            void Record(
                string type,
                int[] indices,
                string description,
                int[]? range = null,
                List<int>? buffer = null,
                Dictionary<string, int>? pointers = null)
            {
                steps.Add(new SortStep
                {
                    Type = type,
                    Array = (int[])arr.Clone(),
                    Indices = indices,
                    SortedIndices = type == "done"
                        ? Enumerable.Range(0, n).ToArray()
                        : [],
                    MergeRange = range ?? [], // Khác null thì lấy range, null thì lấy mảng rỗng
                    MergeBuffer = buffer?.ToArray(), // Khác null thì chuyển danh sách buffer thành mảng, null thì lấy null
                    Description = description,

                    // Lưu lại trạng thái các con trỏ
                    Pointers = pointers == null
                        ? new()
                        : new Dictionary<string, int>(pointers)
                });
            }

            // Hàm chia mảng bằng đệ quy
            void MergeSortRange(int left, int right)
            {
                // Điều kiện dừng đệ quy
                if (left >= right)
                {
                    return;
                }

                // Xác định vị trí giữa
                int mid = left + (right - left) / 2;

                // Ghi nhận bước chia mảng
                Record(
                    "split",
                    Enumerable.Range(left, right - left + 1).ToArray(),
                    $"Chia đoạn [{left}, {right}] tại vị trí {mid}",
                    new[] { left, mid, right });

                // Sắp xếp nửa bên trái
                MergeSortRange(left, mid);

                // Sắp xếp nửa bên phải
                MergeSortRange(mid + 1, right);

                // Trộn hai nửa đã có thứ tự
                Merge(left, mid, right);
            }


            // Hàm trộn hai đoạn mảng
            void Merge(int left, int mid, int right)
            {
                // Mảng phụ lưu kết quả trộn
                List<int> buffer = new();

                // Vị trí đang xét ở hai nửa
                int i = left;
                int j = mid + 1;

                int[] range = new[] { left, mid, right };

                // Lấy trạng thái hiện tại của các con trỏ
                Dictionary<string, int> GetPointers()
                {
                    Dictionary<string, int> pointers = new();

                    // Con trỏ i còn nằm trong nửa trái
                    if (i <= mid)
                    {
                        pointers["i"] = i;
                    }

                    // Con trỏ j còn nằm trong nửa phải
                    if (j <= right)
                    {
                        pointers["j"] = j;
                    }

                    return pointers;
                }

                // So sánh phần tử của hai nửa
                while (i <= mid && j <= right)
                {
                    Record(
                        "compare",
                        new[] { i, j },
                        $"So sánh {arr[i]} và {arr[j]}",
                        range,
                        buffer,
                        GetPointers());

                    bool takeLeft = ascending
                        ? arr[i] <= arr[j]
                        : arr[i] >= arr[j];

                    if (takeLeft)
                    {
                        buffer.Add(arr[i]);

                        Record(
                            "move",
                            new[] { i },
                            $"Đưa {arr[i]} vào mảng phụ",
                            range,
                            buffer,
                            GetPointers());

                        i++;
                    }
                    else
                    {
                        buffer.Add(arr[j]);

                        Record(
                            "move",
                            new[] { j },
                            $"Đưa {arr[j]} vào mảng phụ",
                            range,
                            buffer,
                            GetPointers());

                        j++;
                    }
                }

                // Đưa các phần tử còn lại bên trái vào mảng phụ
                while (i <= mid)
                {
                    buffer.Add(arr[i]);

                    Record(
                        "move",
                        new[] { i },
                        $"Đưa phần tử còn lại {arr[i]} vào mảng phụ",
                        range,
                        buffer,
                        GetPointers());

                    i++;
                }

                // Đưa các phần tử còn lại bên phải vào mảng phụ
                while (j <= right)
                {
                    buffer.Add(arr[j]);

                    Record(
                        "move",
                        new[] { j },
                        $"Đưa phần tử còn lại {arr[j]} vào mảng phụ",
                        range,
                        buffer,
                        GetPointers());

                    j++;
                }

                // Sao chép từng phần tử từ buffer về mảng chính
                for (int k = left; k <= right; k++)
                {
                    // Vị trí tương ứng trong mảng phụ
                    int bufferIndex = k - left;

                    // Sao chép phần tử
                    arr[k] = buffer[bufferIndex];

                    // Ghi nhận bước sao chép
                    Record(
                        "copy",
                        new[] { k },
                        $"Sao chép buffer[{bufferIndex}] = {buffer[bufferIndex]} vào arr[{k}]",
                        range,
                        buffer,
                        new Dictionary<string, int>
                        {
                            ["k"] = k
                        });
                }

                // Ghi nhận bước trộn hoàn thành
                Record(
                    "merge",
                    Enumerable.Range(left, right - left + 1).ToArray(),
                    $"Hoàn thành trộn đoạn [{left}, {right}]",
                    range,
                    buffer);
            }


            // Bắt đầu sắp xếp
            MergeSortRange(0, n - 1);

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
