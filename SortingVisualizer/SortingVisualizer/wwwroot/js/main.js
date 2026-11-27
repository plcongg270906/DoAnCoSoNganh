// Hiển thị thông tin thuật toán
// và chuyển giao diện sáng/tối.

// Sau này main.js sẽ được mở rộng
// để kết nối API và bộ phát animation.

import {
    algorithms,
    getHighlightedLines
} from "./algorithms.js";

import {
    MAX_ARRAY_SIZE,
    parseArray,
    generateRandomArray,
    formatArray
} from "./utils.js";

import { sortArray } from "./api.js";

import { Visualizer } from "./visualizer.js";

import { Player } from "./player.js";

// ==================== KHỞI TẠO ====================

// Hàm lấy phần tử HTML theo id
const $ = id => document.getElementById(id);

// Thuật toán được chọn mặc định
let selectedAlgorithm = "selection";

// Lưu toàn bộ kết quả trả về từ Backend
let sortResult = null;

// Phân biệt các yêu cầu API
let requestVersion = 0;

// Khởi tạo bộ hiển thị mô phỏng
const visualizer = new Visualizer();

// Khởi tạo bộ điều khiển mô phỏng
const player = new Player(showPreview);

// Lấy danh sách 6 nút lựa chọn thuật toán
const algorithmButtons =
    document.querySelectorAll(".algorithm-btn");


// ==================== HIỂN THỊ DANH SÁCH ====================

// Hiển thị nguyên lý, ưu điểm và nhược điểm
function renderList(id, items) {

    const list = $(id);

    // Xóa nội dung cũ
    list.replaceChildren();

    // Tạo từng phần tử li
    for (const item of items) {

        const li = document.createElement("li");

        li.textContent = item;

        list.append(li);
    }
}


// ==================== HIỂN THỊ MÃ NGUỒN ====================

// Hiển thị các dòng C# cùng số thứ tự,
// để sau này có thể tô sáng từng dòng.
function renderCode(code) {

    const container = $("algorithm-code");

    // Xóa mã nguồn cũ
    container.replaceChildren();

    code.forEach((row, index) => {

        // Tạo phần tử chứa dòng code
        const element = document.createElement("span");

        element.className = "code-line";

        // Lưu chỉ số dòng code
        element.dataset.line = String(index);

        // Tạo số thứ tự dòng
        const number = document.createElement("span");

        number.className = "line-number";

        number.textContent = String(index + 1);

        // Thêm số thứ tự và nội dung code
        element.append(
            number,
            document.createTextNode(row.text || " ")
        );

        // Thêm dòng code vào vùng hiển thị
        container.append(element);
    });

    // Đưa thanh cuộn về vị trí ban đầu
    container.closest("pre").scrollTop = 0;

    container.closest("pre").scrollLeft = 0;
}


// ==================== LỰA CHỌN THUẬT TOÁN ====================

function selectAlgorithm(key) {

    // Kiểm tra thuật toán có tồn tại không
    if (!Object.hasOwn(algorithms, key)) {
        return;
    }

    // Cập nhật thuật toán được chọn
    selectedAlgorithm = key;

    // Hủy trạng thái dữ liệu đã chuẩn bị trước đó
    invalidateSortResult();

    // Lưu thuật toán được chọn
    localStorage.setItem(
        "sorting-visualizer-algorithm",
        selectedAlgorithm
    );

    // Lấy thông tin thuật toán
    const info = algorithms[selectedAlgorithm];


    // Tô màu nút đang được chọn
    for (const button of algorithmButtons) {

        const active =
            button.dataset.algorithm === key;

        button.classList.toggle("active", active);

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    }


    // Cập nhật tên thuật toán
    $("algorithm-title").textContent = info.name;

    $("info-title").textContent =
        `Giới thiệu ${info.name} — ${info.vietnameseName}`;


    // Cập nhật giới thiệu thuật toán
    $("algorithm-description").textContent =
        info.description +
        " Độ phức tạp bên dưới tính cho thuật toán gốc, không tính bộ nhớ lưu các bước mô phỏng.";


    // Cập nhật độ phức tạp
    $("best-complexity").textContent =
        info.complexity.best;

    $("average-complexity").textContent =
        info.complexity.average;

    $("worst-complexity").textContent =
        info.complexity.worst;

    $("space-complexity").textContent =
        info.complexity.space;


    // Cập nhật nguyên lý hoạt động
    renderList(
        "algorithm-principles",
        info.principles
    );

    // Cập nhật ưu điểm
    renderList(
        "algorithm-advantages",
        info.advantages
    );

    // Cập nhật nhược điểm
    renderList(
        "algorithm-disadvantages",
        info.disadvantages
    );


    // Hiển thị mã nguồn C#
    renderCode(info.code);


    // Cập nhật trạng thái
    $("simulation-status").textContent =
        "Sẵn sàng";

    $("step-description").textContent =
        `Đã chọn ${info.name}. Hãy nhập và áp dụng dữ liệu.`;

    // Ẩn thông báo lỗi
    $("input-error").hidden = true;
}


// ==================== SỰ KIỆN CHỌN THUẬT TOÁN ====================

for (const button of algorithmButtons) {

    button.addEventListener("click", () => {

        selectAlgorithm(
            button.dataset.algorithm
        );

    });
}


// ==================== GIAO DIỆN SÁNG / TỐI ====================

// Lấy nút chuyển giao diện
const themeButton = $("theme-toggle");


// Áp dụng giao diện
function applyTheme(theme) {

    // Thay đổi data-theme trên thẻ html
    document.documentElement.dataset.theme = theme;

    // Kiểm tra có đang sử dụng giao diện tối không
    const dark = theme === "dark";

    // Cập nhật nội dung nút
    themeButton.textContent = dark
        ? "Giao diện sáng"
        : "Giao diện tối";

    themeButton.setAttribute(
        "aria-label",
        dark
            ? "Chuyển sang giao diện sáng"
            : "Chuyển sang giao diện tối"
    );
}


// Lấy giao diện đã lưu trước đó
let savedTheme = null;

try {

    savedTheme = localStorage.getItem(
        "sorting-visualizer-theme"
    );

} catch {

    // Trình duyệt có thể chặn localStorage.
}


// Mặc định sử dụng giao diện tối
applyTheme(
    savedTheme === "light"
        ? "light"
        : "dark"
);


// Sự kiện nhấn nút chuyển giao diện
themeButton.addEventListener("click", () => {

    const theme =
        document.documentElement.dataset.theme === "dark"
            ? "light"
            : "dark";

    // Áp dụng giao diện mới
    applyTheme(theme);

    // Lưu giao diện vào localStorage
    try {

        localStorage.setItem(
            "sorting-visualizer-theme",
            theme
        );

    } catch {

        // Giao diện vẫn chuyển được
        // nếu trình duyệt không cho phép lưu.
    }
});



// ==================== CẤU HÌNH DỮ LIỆU ĐẦU VÀO ====================

// Giới hạn số lượng phần tử trên giao diện
$("array-size").max = MAX_ARRAY_SIZE;

// Sử dụng chức năng kiểm tra dữ liệu tự viết
$("sort-form").noValidate = true;


// ==================== HIỂN THỊ THÔNG BÁO LỖI ====================

function showError(message) {

    const errorElement = $("input-error");

    errorElement.textContent = message;

    errorElement.hidden = false;
}


// ==================== ẨN THÔNG BÁO LỖI ====================

function hideError() {

    const errorElement = $("input-error");

    errorElement.textContent = "";

    errorElement.hidden = true;
}


// ==================== XÓA TRẠNG THÁI DỮ LIỆU CŨ ====================

function invalidateSortResult() {

    // Không sử dụng kết quả cũ nữa
    sortResult = null;

    // Bỏ qua các phản hồi API cũ nếu có
    requestVersion++;

    // Dừng và xóa trạng thái bộ điều khiển
    player.clear();

    // Xóa mô phỏng trước đó
    visualizer.clear();

    // Khôi phục tên nút bắt đầu
    $("play-btn").textContent = "Bắt đầu";

    // Đặt lại bộ điều khiển
    $("progress-slider").value = 0;
    $("progress-slider").max = 0;
    $("progress-slider").disabled = true;

    $("previous-btn").disabled = true;
    $("next-btn").disabled = true;
    $("reset-btn").disabled = true;
    $("play-btn").disabled = true;
    $("pause-btn").disabled = true;

    // Xóa trạng thái tô sáng mã nguồn
    document.querySelectorAll(".code-line.active")
        .forEach(line => line.classList.remove("active"));

    // Xóa thông tin trạng thái thuật toán
    $("variables-container").textContent =
        "Chưa có dữ liệu.";

    // Đặt lại các chỉ số thống kê
    $("comparison-count").textContent = "0";

    $("swap-count").textContent = "0";

    $("move-count").textContent = "0";

    $("step-count").textContent = "0 / 0";

    // Cho phép áp dụng lại dữ liệu
    $("apply-btn").disabled = false;

    // Đặt lại trạng thái
    $("simulation-status").textContent =
        "Sẵn sàng";

    $("simulation-status").dataset.state =
        "ready";

    $("step-description").textContent =
        "Hãy áp dụng dữ liệu để chuẩn bị mô phỏng.";

    hideError();
}


// ==================== TẠO MẢNG NGẪU NHIÊN ====================

$("random-btn").addEventListener("click", () => {

    invalidateSortResult();

    try {

        // Lấy các tham số từ giao diện
        const size = $("array-size").value;

        const min = $("min-value").value;

        const max = $("max-value").value;


        // Tạo mảng ngẫu nhiên
        const values = generateRandomArray(
            size,
            min,
            max
        );


        // Hiển thị mảng vào ô nhập liệu
        $("array-input").value =
            formatArray(values);


        // Cập nhật thông báo
        $("step-description").textContent =
            `Đã tạo ngẫu nhiên ${values.length} phần tử. ` +
            "Nhấn Áp dụng dữ liệu để chuẩn bị mô phỏng.";

    } catch (error) {

        showError(error.message);
    }
});


// ==================== ÁP DỤNG DỮ LIỆU ====================

$("sort-form").addEventListener("submit", async event => {

    // Ngăn trình duyệt tải lại trang
    event.preventDefault();

    invalidateSortResult();

    const currentVersion = requestVersion;

    try {

        // Chuyển dữ liệu nhập thành mảng số nguyên
        const values = parseArray(
            $("array-input").value
        );


        // Lấy chiều sắp xếp
        const order = $("sort-order").value;


        // Chuẩn hóa định dạng dữ liệu nhập
        $("array-input").value =
            formatArray(values);


        // Vô hiệu hóa nút khi đang gửi yêu cầu
        $("apply-btn").disabled = true;


        // Hiển thị trạng thái đang xử lý
        $("simulation-status").textContent =
            "Đang xử lý...";

        $("simulation-status").dataset.state =
            "loading";

        $("step-description").textContent =
            "Đang gửi dữ liệu đến Backend C#...";


        // Gọi API sắp xếp
        const result = await sortArray(
            selectedAlgorithm,
            values,
            order
        );


        // Bỏ qua nếu dữ liệu đã thay đổi
        // trong lúc chờ phản hồi từ API
        if (currentVersion !== requestVersion) {
            return;
        }

        // Lưu kết quả trả về từ Backend
        sortResult = result;

        // Chuẩn bị các frame và tạo các cột
        visualizer.load(sortResult);

        // Lấy tốc độ đang được chọn
        const speed = Number(
            $("speed-select").value
        );

        // Đồng bộ tốc độ animation
        visualizer.setSpeed(speed);

        // Đồng bộ tốc độ chuyển bước
        player.setSpeed(speed);

        // Nạp tổng số bước cho bộ điều khiển
        player.load(sortResult.steps.length);

        // Kiểm tra dữ liệu trong Console
        console.log("Kết quả từ Backend:", sortResult);

    } catch (error) {

        // Bỏ qua lỗi từ yêu cầu cũ
        if (currentVersion !== requestVersion) {
            return;
        }

        sortResult = null;

        showError(error.message);

        $("simulation-status").textContent =
            "Lỗi dữ liệu";

        $("simulation-status").dataset.state =
            "error";

        $("step-description").textContent =
            "Không thể chuẩn bị dữ liệu mô phỏng.";

    } finally {

        // Chỉ cập nhật nút của yêu cầu hiện tại
        if (currentVersion === requestVersion) {

            $("apply-btn").disabled = false;
        }
    }
});


// ==================== THEO DÕI THAY ĐỔI DỮ LIỆU ====================

// Khi người dùng sửa mảng
$("array-input").addEventListener("input", () => {

    invalidateSortResult();

    $("step-count").textContent = "0 / 0";
});


// Khi người dùng đổi chiều sắp xếp
$("sort-order").addEventListener("change", () => {

    invalidateSortResult();

    $("step-count").textContent = "0 / 0";
});

// Ghi rõ đây là mã nguồn C# đã được rút gọn
document.querySelector(".code-panel h2").textContent =
    "Mã nguồn C# (rút gọn)";


// ==================== HIỂN THỊ TRẠNG THÁI THUẬT TOÁN ====================

function renderVariables(step) {

    const container = $("variables-container");

    container.replaceChildren();

    // Hiển thị các biến có dữ liệu
    function addVariable(name, value) {

        if (value == null) {
            return;
        }

        const element = document.createElement("span");

        element.className = "variable-chip";

        element.textContent =
            `${name} = ${value}`;

        container.append(element);
    }


    // Thông tin dùng chung
    addVariable("Type", step.type);

    addVariable("n", step.array.length);

    addVariable(
        "Indices",
        `[${(step.indices ?? []).join(", ")}]`
    );

    addVariable(
        "SortedIndices",
        `[${(step.sortedIndices ?? []).join(", ")}]`
    );


    // Insertion Sort
    addVariable("key", step.keyValue);

    addVariable("holeIndex", step.holeIndex);


    // Merge Sort
    if (step.mergeRange?.length === 3) {

        const [left, mid, right] =
            step.mergeRange;

        addVariable("left", left);
        addVariable("mid", mid);
        addVariable("right", right);
    }


    // Quick Sort
    if (step.pivotIndex != null) {

        addVariable(
            "pivotIndex",
            step.pivotIndex
        );

        addVariable(
            "pivot",
            step.array[step.pivotIndex]
        );
    }

    if (step.partitionRange?.length === 2) {

        const [left, right] =
            step.partitionRange;

        addVariable("left", left);
        addVariable("right", right);
    }


    // Heap Sort
    addVariable("heapSize", step.heapSize);
}


// ==================== TÔ SÁNG MÃ NGUỒN ====================

function highlightCode(step, index) {

    // Lấy bước tiếp theo để phân biệt
    // các thao tác đặc biệt của Heap Sort
    const nextStep = sortResult.steps[index];

    const highlighted = getHighlightedLines(
        selectedAlgorithm,
        step,
        nextStep
    );

    const codeLines =
        document.querySelectorAll(".code-line");

    // Cập nhật trạng thái từng dòng
    for (const line of codeLines) {

        const active = highlighted.includes(
            Number(line.dataset.line)
        );

        line.classList.toggle(
            "active",
            active
        );
    }


    // Tìm dòng đầu tiên đang được tô sáng
    const activeLine =
        document.querySelector(".code-line.active");

    if (!activeLine) {

        return;
    }

    // Chỉ cuộn bên trong khung code,
    // không cuộn toàn bộ website
    const pre = activeLine.closest("pre");

    const lineRect =
        activeLine.getBoundingClientRect();

    const preRect =
        pre.getBoundingClientRect();

    if (lineRect.top < preRect.top ||
        lineRect.bottom > preRect.bottom) {

        pre.scrollTop +=
            lineRect.top -
            preRect.top -
            pre.clientHeight / 3;
    }
}


// ==================== HIỂN THỊ FRAME HIỆN TẠI ====================

function showPreview(index, animate = true, state = "ready") {

    // Kiểm tra đã có dữ liệu chưa
    if (!sortResult) {

        return;
    }

    const total = sortResult.steps.length;


    // Vị trí bước hiện tại
    const previewIndex = index;


    // Hiển thị các cột
    const step = visualizer.render(
        previewIndex,
        animate
    );

    if (!step) {

        return;
    }


    // ==================== MÔ TẢ THAO TÁC ====================

    $("step-description").textContent =
        step.description;


    // ==================== THỐNG KÊ ====================

    // Lấy các bước đã thực hiện
    const processed = sortResult.steps.slice(
        0,
        previewIndex
    );


    // Số lần so sánh
    $("comparison-count").textContent =
        processed.filter(
            step => step.type === "compare"
        ).length;


    // Số lần hoán đổi
    $("swap-count").textContent =
        processed.filter(
            step => step.type === "swap"
        ).length;


    // Số lần dịch chuyển
    $("move-count").textContent =
        processed.filter(
            step => step.type === "move"
        ).length;


    // ==================== THANH TIẾN TRÌNH ====================

    $("step-count").textContent =
        `${previewIndex} / ${total}`;

    $("progress-slider").max = total;

    $("progress-slider").value =
        previewIndex;

    $("progress-slider").disabled = false;


    // ==================== TRẠNG THÁI MÔ PHỎNG ====================

    const playing = state === "playing";

    const paused = state === "paused";

    const done = state === "done";


    // ==================== CẬP NHẬT CÁC NÚT ====================

    // Nút bắt đầu
    $("play-btn").disabled = playing;

    // Nút tạm dừng
    $("pause-btn").disabled = !playing;

    // Nút bước trước
    $("previous-btn").disabled =
        previewIndex === 0;

    // Nút bước tiếp
    $("next-btn").disabled =
        previewIndex === total;

    // Nút đặt lại
    $("reset-btn").disabled =
        previewIndex === 0 && !playing;


    // ==================== TÊN NÚT BẮT ĐẦU ====================

    if (done) {

        $("play-btn").textContent =
            "Chạy lại";

    } else if (playing) {

        $("play-btn").textContent =
            "Đang chạy";

    } else if (paused) {

        $("play-btn").textContent =
            "Tiếp tục";

    } else {

        $("play-btn").textContent =
            "Bắt đầu";
    }


    // ==================== HIỂN THỊ TRẠNG THÁI ====================

    const status = $("simulation-status");

    if (done) {

        status.textContent = "Hoàn thành";

        status.dataset.state = "done";

    } else if (playing) {

        status.textContent = "Đang mô phỏng";

        status.dataset.state = "playing";

    } else if (paused) {

        status.textContent = "Tạm dừng";

        status.dataset.state = "paused";

    } else {

        status.textContent = "Sẵn sàng";

        status.dataset.state = "ready";
    }


    // ==================== BIẾN VÀ MÃ NGUỒN ====================

    // Cập nhật các biến thuật toán
    renderVariables(step);

    // Tô sáng mã nguồn C#
    highlightCode(step, previewIndex);
}


// ==================== BẮT ĐẦU / TIẾP TỤC ====================

$("play-btn").addEventListener("click", () => {

    player.play();
});


// ==================== TẠM DỪNG ====================

$("pause-btn").addEventListener("click", () => {

    player.pause();
});


// ==================== BƯỚC TIẾP ====================

$("next-btn").addEventListener("click", () => {

    player.next();
});


// ==================== BƯỚC TRƯỚC ====================

$("previous-btn").addEventListener("click", () => {

    player.previous();
});


// ==================== ĐẶT LẠI ====================

$("reset-btn").addEventListener("click", () => {

    player.reset();
});


// ==================== TUA TIẾN TRÌNH ====================

$("progress-slider").addEventListener("input", () => {

    const index = Number(
        $("progress-slider").value
    );

    player.seek(index, false);
});


// ==================== ĐIỀU CHỈNH TỐC ĐỘ ====================

$("speed-select").addEventListener("change", () => {

    const speed = Number(
        $("speed-select").value
    );

    // Thay đổi tốc độ chuyển động
    visualizer.setSpeed(speed);

    // Thay đổi tốc độ chuyển bước
    player.setSpeed(speed);
});


// ==================== KHỞI CHẠY ====================

// Lấy thuật toán đã được lưu trước đó
const savedAlgorithm = localStorage.getItem(
    "sorting-visualizer-algorithm"
);

// Khôi phục thuật toán nếu hợp lệ
if (savedAlgorithm &&
    Object.hasOwn(algorithms, savedAlgorithm)) {

    selectAlgorithm(savedAlgorithm);

} else {

    // Mặc định chọn Selection Sort
    selectAlgorithm("selection");
}
