// Thông tin thuật toán và mã C# minh họa từ các Services của dự án.
// Mã C# đã lược bỏ kiểm tra đầu vào và ghi nhận bước mô phỏng.
// Mỗi dòng có thể được gắn một hoặc nhiều loại thao tác để tô sáng.
function line(text, ...types) {
    return { text, types };
}

export const algorithms = {

    // ==================== SELECTION SORT ====================

    selection: {
        name: "Selection Sort",
        vietnameseName: "Sắp xếp chọn",

        description: "Selection Sort tìm phần tử nhỏ nhất (hoặc lớn nhất khi sắp xếp giảm dần) trong đoạn chưa sắp xếp, sau đó đưa phần tử đó về đầu đoạn.",

        complexity: {
            best: "O(n²)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)"
        },

        principles: [
            "Duyệt từ đầu đến vị trí áp cuối của mảng.",
            "Tìm phần tử phù hợp nhất trong đoạn chưa sắp xếp.",
            "Hoán đổi với phần tử đầu đoạn nếu cần.",
            "Cố định vị trí vừa xử lý và lặp lại."
        ],

        advantages: [
            "Dễ hiểu và dễ cài đặt.",
            "Số lần hoán đổi tối đa là n - 1.",
            "Chỉ cần bộ nhớ phụ hằng số."
        ],

        disadvantages: [
            "Luôn thực hiện số lần so sánh bậc hai, kể cả khi mảng đã có thứ tự.",
            "Phiên bản hoán đổi trực tiếp không ổn định."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('for (int i = 0; i < n - 1; i++)'),
            line('{'),
            line('    int selectedIndex = i;'),
            line('    for (int j = i + 1; j < n; j++)'),
            line('    {'),
            line('        bool shouldSelect = ascending', 'compare'),
            line('            ? arr[j] < arr[selectedIndex]', 'compare'),
            line('            : arr[j] > arr[selectedIndex];', 'compare'),
            line('        if (shouldSelect)'),
            line('            selectedIndex = j;', 'select'),
            line('    }'),
            line('    if (selectedIndex != i)'),
            line('        (arr[i], arr[selectedIndex]) =', 'swap'),
            line('            (arr[selectedIndex], arr[i]);', 'swap'),
            line('    // Vị trí i đã hoàn thành.', 'sorted'),
            line('}'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    },


    // ==================== BUBBLE SORT ====================

    bubble: {
        name: "Bubble Sort",
        vietnameseName: "Sắp xếp nổi bọt",

        description: "Bubble Sort so sánh các phần tử liền kề và hoán đổi khi chúng sai thứ tự. Sau mỗi lượt duyệt, một phần tử được đưa về cuối đoạn chưa sắp xếp.",

        complexity: {
            best: "O(n)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)"
        },

        principles: [
            "Duyệt các cặp phần tử liền kề.",
            "Hoán đổi nếu cặp phần tử sai thứ tự.",
            "Thu hẹp vùng chưa sắp xếp sau mỗi lượt.",
            "Dừng sớm nếu một lượt không có hoán đổi."
        ],

        advantages: [
            "Đơn giản, dễ quan sát bằng mô phỏng.",
            "Có thể dừng sớm nhờ biến swapped.",
            "Ổn định vì không hoán đổi các giá trị bằng nhau."
        ],

        disadvantages: [
            "Chậm với dữ liệu lớn.",
            "Có thể cần nhiều lần so sánh và hoán đổi."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('for (int i = 0; i < n - 1; i++)'),
            line('{'),
            line('    bool swapped = false;'),
            line('    for (int j = 0; j < n - i - 1; j++)'),
            line('    {'),
            line('        bool shouldSwap = ascending', 'compare'),
            line('            ? arr[j] > arr[j + 1]', 'compare'),
            line('            : arr[j] < arr[j + 1];', 'compare'),
            line('        if (shouldSwap)'),
            line('        {'),
            line('            (arr[j], arr[j + 1]) =', 'swap'),
            line('                (arr[j + 1], arr[j]);', 'swap'),
            line('            swapped = true;', 'swap'),
            line('        }'),
            line('    }'),
            line('    int sortedIndex = n - i - 1;', 'sorted'),
            line('    // Vị trí sortedIndex đã hoàn thành.', 'sorted'),
            line('    if (!swapped) break;'),
            line('}'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    },


    // ==================== INSERTION SORT ====================

    insertion: {
        name: "Insertion Sort",
        vietnameseName: "Sắp xếp chèn",

        description: "Insertion Sort giữ tạm phần tử key, dịch chuyển các phần tử đứng trước chưa đúng thứ tự sang phải và chèn key vào vị trí thích hợp trong đoạn đã có thứ tự.",

        complexity: {
            best: "O(n)",
            average: "O(n²)",
            worst: "O(n²)",
            space: "O(1)"
        },

        principles: [
            "Xem phần tử đầu tiên là đoạn đã có thứ tự.",
            "Giữ tạm phần tử tiếp theo làm key.",
            "Dịch chuyển các phần tử không phù hợp sang phải.",
            "Chèn key vào ô trống và mở rộng đoạn đã có thứ tự."
        ],

        advantages: [
            "Hiệu quả với mảng nhỏ hoặc gần có thứ tự.",
            "Ổn định với điều kiện so sánh nghiêm ngặt.",
            "Không cần mảng phụ."
        ],

        disadvantages: [
            "Chậm khi mảng lớn và có nhiều phần tử sai thứ tự.",
            "Có thể phát sinh nhiều lần dịch chuyển."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('for (int i = 1; i < n; i++)'),
            line('{'),
            line('    int key = arr[i];', 'select'),
            line('    int j = i - 1;'),
            line('    while (j >= 0)'),
            line('    {'),
            line('        bool shouldMove = ascending', 'compare'),
            line('            ? arr[j] > key', 'compare'),
            line('            : arr[j] < key;', 'compare'),
            line('        if (!shouldMove) break;'),
            line('        arr[j + 1] = arr[j];', 'move'),
            line('        j--;'),
            line('    }'),
            line('    arr[j + 1] = key;', 'insert'),
            line('}'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    },


    // ==================== MERGE SORT ====================

    merge: {
        name: "Merge Sort",
        vietnameseName: "Sắp xếp trộn",

        description: "Merge Sort sử dụng chia để trị: chia đoạn mảng thành hai nửa, sắp xếp đệ quy rồi trộn hai nửa có thứ tự bằng một mảng phụ (buffer).",

        complexity: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n log n)",
            space: "O(n)"
        },

        principles: [
            "Chia đoạn mảng tại vị trí giữa.",
            "Sắp xếp đệ quy nửa trái và nửa phải.",
            "So sánh đầu hai nửa, đưa phần tử phù hợp vào buffer.",
            "Đưa phần còn lại vào buffer rồi sao chép về mảng chính."
        ],

        advantages: [
            "Độ phức tạp thời gian ổn định O(n log n).",
            "Ổn định vì ưu tiên nửa trái khi hai giá trị bằng nhau.",
            "Phù hợp với dữ liệu lớn."
        ],

        disadvantages: [
            "Cần bộ nhớ phụ O(n).",
            "Có chi phí gọi đệ quy và sao chép dữ liệu."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('void MergeSortRange(int left, int right)'),
            line('{'),
            line('    if (left >= right) return;'),
            line('    int mid = left + (right - left) / 2;', 'split'),
            line('    MergeSortRange(left, mid);'),
            line('    MergeSortRange(mid + 1, right);'),
            line('    Merge(left, mid, right);'),
            line('}'),
            line('void Merge(int left, int mid, int right)'),
            line('{'),
            line('    List<int> buffer = new();'),
            line('    int i = left, j = mid + 1;'),
            line('    while (i <= mid && j <= right)'),
            line('    {'),
            line('        bool takeLeft = ascending', 'compare'),
            line('            ? arr[i] <= arr[j]', 'compare'),
            line('            : arr[i] >= arr[j];', 'compare'),
            line('        if (takeLeft)'),
            line('            buffer.Add(arr[i++]);', 'move-left'),
            line('        else'),
            line('            buffer.Add(arr[j++]);', 'move-right'),
            line('    }'),
            line('    while (i <= mid)'),
            line('        buffer.Add(arr[i++]);', 'remaining-left'),
            line('    while (j <= right)'),
            line('        buffer.Add(arr[j++]);', 'remaining-right'),
            line('    for (int k = left; k <= right; k++)', 'copy'),
            line('    {'),
            line('        int bufferIndex = k - left;', 'copy'),
            line('        arr[k] = buffer[bufferIndex];', 'copy'),
            line('    }'),
            line('    // Hoàn thành trộn đoạn.', 'merge'),
            line('}'),
            line('MergeSortRange(0, n - 1);'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    },


    // ==================== QUICK SORT ====================

    quick: {
        name: "Quick Sort",
        vietnameseName: "Sắp xếp nhanh",

        description: "Quick Sort chọn phần tử cuối đoạn làm pivot, phân hoạch theo chiều sắp xếp rồi tiếp tục xử lý đệ quy hai đoạn ở hai bên pivot (phân hoạch Lomuto).",

        complexity: {
            best: "O(n log n)",
            average: "O(n log n)",
            worst: "O(n²)",
            space: "O(log n) TB; O(n) xấu nhất"
        },

        principles: [
            "Chọn phần tử cuối đoạn làm pivot.",
            "Duyệt và đưa các phần tử thỏa điều kiện về bên trái pivot.",
            "Hoán đổi pivot về vị trí cuối cùng.",
            "Sắp xếp đệ quy hai đoạn còn lại."
        ],

        advantages: [
            "Thường nhanh trong thực tế.",
            "Phân hoạch ngay trên mảng chính.",
            "Không cần buffer như Merge Sort."
        ],

        disadvantages: [
            "Có thể suy giảm xuống O(n²) khi phân hoạch mất cân bằng, chẳng hạn mảng đã có thứ tự với cách chọn pivot cuối.",
            "Phiên bản Lomuto này không ổn định và có thể dùng O(n) ngăn xếp đệ quy."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('void QuickSortRange(int left, int right)'),
            line('{'),
            line('    if (left > right) return;'),
            line('    if (left == right) return;', 'sorted-single'),
            line('    int pivotIndex = Partition(left, right);'),
            line('    // Pivot đã đúng vị trí.', 'sorted-pivot'),
            line('    QuickSortRange(left, pivotIndex - 1);'),
            line('    QuickSortRange(pivotIndex + 1, right);'),
            line('}'),
            line('int Partition(int left, int right)'),
            line('{'),
            line('    int pivot = arr[right];', 'pivot'),
            line('    int i = left - 1;'),
            line('    for (int j = left; j < right; j++)'),
            line('    {'),
            line('        bool shouldMove = ascending', 'compare'),
            line('            ? arr[j] <= pivot', 'compare'),
            line('            : arr[j] >= pivot;', 'compare'),
            line('        if (shouldMove)'),
            line('        {'),
            line('            i++;'),
            line('            if (i != j)'),
            line('                (arr[i], arr[j]) = (arr[j], arr[i]);', 'swap-partition'),
            line('        }'),
            line('    }'),
            line('    int finalPivotIndex = i + 1;'),
            line('    if (finalPivotIndex != right)'),
            line('        (arr[finalPivotIndex], arr[right]) =', 'swap-pivot'),
            line('            (arr[right], arr[finalPivotIndex]);', 'swap-pivot'),
            line('    return finalPivotIndex;'),
            line('}'),
            line('QuickSortRange(0, n - 1);'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    },


    // ==================== HEAP SORT ====================

    heap: {
        name: "Heap Sort",
        vietnameseName: "Sắp xếp vun đống",

        description: "Heap Sort xây dựng Max Heap khi tăng dần hoặc Min Heap khi giảm dần. Sau đó đưa nút gốc về cuối vùng Heap, thu nhỏ vùng và khôi phục tính chất Heap.",

        complexity: {
            best: "O(n)*",
            average: "O(n log n)",
            worst: "O(n log n)",
            space: "O(1)"
        },

        principles: [
            "Biểu diễn mảng dưới dạng cây nhị phân hoàn chỉnh.",
            "Xây dựng Heap từ nút cha cuối cùng đến gốc.",
            "Hoán đổi gốc với phần tử cuối Heap và cố định vị trí đó.",
            "Thu nhỏ Heap, gọi Heapify từ gốc và lặp lại."
        ],

        advantages: [
            "Độ phức tạp xấu nhất O(n log n).",
            "Không cần mảng phụ hoặc đệ quy trong phiên bản Heapify lặp.",
            "Minh họa được cấu trúc cây nhị phân."
        ],

        disadvantages: [
            "Không ổn định do hoán đổi các vị trí xa nhau.",
            "Khó hiểu hơn các thuật toán cơ bản.",
            "* Bản Heapify này dừng sớm khi các giá trị bằng nhau nên đạt O(n) với mảng toàn giá trị bằng nhau; với các khóa phân biệt, thường trình bày tốt nhất là O(n log n)."
        ],

        code: [
            line('bool ascending = order == "asc";'),
            line('void Heapify(int heapSize, int root)'),
            line('{'),
            line('    while (true)'),
            line('    {'),
            line('        int selectedIndex = root;'),
            line('        int left = 2 * root + 1;'),
            line('        int right = 2 * root + 2;'),
            line('        if (left < heapSize)'),
            line('        {'),
            line('            bool shouldSelectLeft = ascending', 'compare-left'),
            line('                ? arr[left] > arr[selectedIndex]', 'compare-left'),
            line('                : arr[left] < arr[selectedIndex];', 'compare-left'),
            line('            if (shouldSelectLeft) selectedIndex = left;', 'select-left'),
            line('        }'),
            line('        if (right < heapSize)'),
            line('        {'),
            line('            bool shouldSelectRight = ascending', 'compare-right'),
            line('                ? arr[right] > arr[selectedIndex]', 'compare-right'),
            line('                : arr[right] < arr[selectedIndex];', 'compare-right'),
            line('            if (shouldSelectRight) selectedIndex = right;', 'select-right'),
            line('        }'),
            line('        if (selectedIndex == root) break;'),
            line('        (arr[root], arr[selectedIndex]) =', 'swap-heapify'),
            line('            (arr[selectedIndex], arr[root]);', 'swap-heapify'),
            line('        root = selectedIndex;'),
            line('    }'),
            line('}'),
            line('for (int i = n / 2 - 1; i >= 0; i--)'),
            line('    Heapify(n, i);'),
            line('// Xây dựng Heap hoàn thành.', 'heap'),
            line('for (int i = n - 1; i > 0; i--)'),
            line('{'),
            line('    (arr[0], arr[i]) = (arr[i], arr[0]);', 'swap-extract'),
            line('    // Vị trí i đã hoàn thành.', 'sorted'),
            line('    Heapify(i, 0);'),
            line('}'),
            line('// Toàn bộ mảng đã sắp xếp.', 'done')
        ]
    }
};


// ==================== XÁC ĐỊNH DÒNG CODE TÔ SÁNG ====================

// Trả về chỉ số các dòng C# liên quan tới một bước API.
// Chỉ số bắt đầu từ 0.
// Đây là ánh xạ thao tác, không phải trình gỡ lỗi C# theo từng câu lệnh.

export function getHighlightedLines(
    algorithm, step, nextStep = null) {

    // Kiểm tra thuật toán và bước mô phỏng
    if (!Object.hasOwn(algorithms, algorithm) || !step) {
        return [];
    }

    let type = step.type;
    const indices = step.indices ?? [];


    // Xử lý riêng cho Merge Sort
    if (algorithm === "merge" && type === "move") {

        const mid = step.mergeRange?.[1];

        if (!Number.isInteger(mid) ||
            !Number.isInteger(indices[0])) {
            return [];
        }

        // Xác định phần tử thuộc nửa trái hay nửa phải
        const left = indices[0] <= mid;

        // Kiểm tra có phải phần tử còn lại hay không
        const remaining = (step.description ?? "")
            .startsWith("Đưa phần tử còn lại");

        type = remaining
            ? (left ? "remaining-left" : "remaining-right")
            : (left ? "move-left" : "move-right");
    }


    // Xử lý riêng cho Quick Sort
    if (algorithm === "quick") {

        if (type === "swap") {

            type = (step.description ?? "")
                .startsWith("Đưa pivot")
                ? "swap-pivot"
                : "swap-partition";
        }

        if (type === "sorted") {

            type = step.pivotIndex == null
                ? "sorted-single"
                : "sorted-pivot";
        }
    }


    // Xử lý riêng cho Heap Sort
    if (algorithm === "heap") {

        // Highlight bước cập nhật selectedIndex
        if (type === "select") {

            type = indices[0] % 2 === 1
                ? "select-left"
                : "select-right";
        }

        if (type === "compare" &&
            Number.isInteger(indices[1])) {

            // Con trái có chỉ số lẻ,
            // con phải có chỉ số chẵn.
            type = indices[1] % 2 === 1
                ? "compare-left"
                : "compare-right";
        }

        if (type === "swap") {

            // Phép đưa gốc về cuối Heap
            // được ghi ngay trước bước sorted.
            if (nextStep) {

                type = nextStep.type === "sorted"
                    ? "swap-extract"
                    : "swap-heapify";

                return algorithms.heap.code.flatMap(
                    (row, i) =>
                        row.types.includes(type) ? [i] : []
                );
            }

            // Nếu chưa có thông tin bước tiếp theo,
            // tô cả hai vị trí hoán đổi có thể xảy ra.
            return algorithms.heap.code.flatMap(
                (row, i) =>
                    row.types.some(
                        t => t === "swap-heapify" ||
                            t === "swap-extract"
                    ) ? [i] : []
            );
        }
    }


    // Tìm các dòng code tương ứng với loại thao tác
    return algorithms[algorithm].code.flatMap(
        (row, i) =>
            row.types.includes(type) ? [i] : []
    );
}
