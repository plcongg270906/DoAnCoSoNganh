
// ==================== KHỞI TẠO VISUALIZER ====================

export class Visualizer {

    constructor() {

        // Lấy các thành phần HTML
        this.area = document.getElementById("visualization-area");
        this.bars = document.getElementById("bars-container");
        this.indices = document.getElementById("indices-container");

        this.auxiliary = document.getElementById("auxiliary-area");

        this.keyContainer = document.getElementById("key-container");
        this.keyValue = document.getElementById("key-value");

        this.bufferContainer = document.getElementById("buffer-container");
        this.bufferValues = document.getElementById("buffer-values");

        this.heapContainer = document.getElementById("heap-container");
        this.heapTree = document.getElementById("heap-tree");

        // Dữ liệu mô phỏng
        this.algorithm = "";
        this.original = [];
        this.frames = [];

        // Danh sách các cột được giữ cố định
        this.nodes = [];

        // Cột biểu diễn ô trống của Insertion Sort
        this.hole = null;

        // Vị trí trục số 0
        this.zeroPosition = 50;

        // Phạm vi giá trị
        this.min = 0;
        this.max = 0;
        this.span = 1;
    }


    // ==================== XÓA MÔ PHỎNG CŨ ====================

    clear() {

        this.algorithm = "";
        this.original = [];
        this.frames = [];
        this.nodes = [];
        this.hole = null;

        this.bars.replaceChildren();
        this.indices.replaceChildren();

        this.keyValue.textContent = "";
        this.bufferValues.replaceChildren();
        this.heapTree.replaceChildren();

        this.heapTree.style.minWidth = "";

        this.auxiliary.hidden = true;
        this.keyContainer.hidden = true;
        this.bufferContainer.hidden = true;
        this.heapContainer.hidden = true;

        this.area.style.setProperty(
            "--zero-position", "100%"
        );
    }


    // ==================== NHẬN DỮ LIỆU TỪ API ====================

    load(result) {

        // Xóa dữ liệu trước đó
        this.clear();

        this.algorithm = result.algorithm;

        this.original = [...result.original];

        // Tính phạm vi giá trị để vẽ biểu đồ
        this.min = Math.min(0, ...this.original);
        this.max = Math.max(0, ...this.original);

        this.span = this.max - this.min || 1;

        // Chừa khoảng trống phía trên và dưới
        this.zeroPosition = this.max === this.min
            ? 50
            : 8 + (this.max / this.span) * 84;

        this.area.style.setProperty(
            "--zero-position",
            `${this.zeroPosition}%`
        );

        // Chuẩn bị các trạng thái mô phỏng
        this.buildFrames(result);

        // Tạo các cột duy nhất một lần
        this.createBars();

        // Hiển thị trạng thái ban đầu
        return this.render(0, false);
    }


    // ==================== XÂY DỰNG CÁC FRAME ====================

    buildFrames(result) {

        const n = this.original.length;

        // Mỗi phần tử có ID là vị trí ban đầu
        // Ví dụ: [5, 2, 4, 1] có các ID [0, 1, 2, 3]
        let slots = Array.from(
            { length: n },
            (_, index) => index
        );

        // ID của key trong Insertion Sort
        let heldId = null;

        // ID các phần tử được đưa vào buffer
        let bufferIds = [];


        // Bổ sung trạng thái ban đầu
        this.frames.push({

            step: {
                type: "initial",
                array: [...this.original],
                indices: [],
                sortedIndices: [],
                keyValue: null,
                holeIndex: null,
                mergeRange: [],
                mergeBuffer: null,
                pivotIndex: null,
                partitionRange: [],
                heapSize: this.algorithm === "heap"
                    ? n
                    : null,
                description: "Mảng ban đầu. Sẵn sàng mô phỏng."
            },

            slots: [...slots]
        });


        // Duyệt các bước do Backend trả về
        for (const step of result.steps) {

            const indices = step.indices ?? [];

            const [a, b] = indices;


            // ---------- Hoán đổi phần tử ----------

            if (step.type === "swap") {

                [slots[a], slots[b]] =
                    [slots[b], slots[a]];
            }


            // ---------- Insertion Sort ----------

            if (this.algorithm === "insertion") {

                // Giữ tạm phần tử key
                if (step.type === "select") {

                    heldId = slots[step.holeIndex];

                    slots[step.holeIndex] = null;
                }

                // Dịch chuyển phần tử sang ô trống
                if (step.type === "move") {

                    slots[b] = slots[a];

                    slots[a] = null;
                }

                // Chèn key vào đúng vị trí
                if (step.type === "insert") {

                    slots[a] = heldId;

                    heldId = null;
                }
            }


            // ---------- Merge Sort ----------

            if (this.algorithm === "merge") {

                // Bắt đầu một phạm vi xử lý mới
                if (step.type === "split") {

                    bufferIds = [];
                }

                // Đưa ID tương ứng vào mảng phụ
                if (step.type === "move") {

                    // Buffer có một phần tử nghĩa là
                    // đang bắt đầu một lần trộn mới
                    if (step.mergeBuffer?.length === 1) {

                        bufferIds = [];
                    }

                    bufferIds.push(slots[a]);
                }

                // Sao chép thứ tự ID từ buffer
                // về đoạn mảng chính
                if (step.type === "merge") {

                    const [left, mid, right] =
                        step.mergeRange;

                    slots.splice(
                        left,
                        right - left + 1,
                        ...bufferIds
                    );

                    bufferIds = [];
                }
            }


            // Lưu trạng thái vị trí của các phần tử
            this.frames.push({

                step: step,

                slots: [...slots]
            });
        }
    }


    // ==================== TẠO CÁC CỘT ====================

    createBars() {

        for (let i = 0; i < this.original.length; i++) {

            // Tạo cột
            const bar = document.createElement("div");

            bar.className = "bar";

            // ID không thay đổi trong quá trình sắp xếp
            bar.dataset.id = String(i);


            // Tạo nhãn giá trị
            const label = document.createElement("span");

            label.className = "bar-value";

            label.textContent =
                String(this.original[i]);

            bar.append(label);

            this.bars.append(bar);

            this.nodes.push(bar);


            // Tạo chỉ số vị trí trong mảng
            const index = document.createElement("span");

            index.textContent = `[${i}]`;

            index.style.flex = "1";
            index.style.textAlign = "center";

            this.indices.append(index);
        }


        // Tạo ô trống dành cho Insertion Sort
        this.hole = document.createElement("div");

        this.hole.className = "bar hole";

        this.hole.hidden = true;

        this.bars.append(this.hole);
    }


    // ==================== XÁC ĐỊNH MÀU SẮC ====================

    getBarClass(step, index) {

        // Ưu tiên vị trí đã hoàn thành
        if (step.sortedIndices?.includes(index)) {

            return "sorted";
        }

        // Pivot trong Quick Sort
        if (step.pivotIndex === index) {

            return "pivot";
        }

        // Vị trí đang được xử lý
        if (step.indices?.includes(index)) {

            switch (step.type) {

                case "compare":
                    return "compare";

                case "swap":
                    return "swap";

                case "select":
                    return "selected";

                case "move":
                    return "move";

                case "insert":
                    return "insert";

                case "split":
                    return "split";

                case "merge":
                    return "merge";

                case "heap":
                    return "heap";
            }
        }


        // Xác định phần tử nằm ngoài đoạn Merge Sort
        if (step.mergeRange?.length === 3) {

            const [left, mid, right] =
                step.mergeRange;

            if (index < left || index > right) {

                return "outside-range";
            }
        }


        // Xác định phần tử nằm ngoài vùng phân hoạch
        if (step.partitionRange?.length === 2) {

            const [left, right] =
                step.partitionRange;

            if (index < left || index > right) {

                return "outside-range";
            }
        }

        return "";
    }


    // ==================== TÍNH VỊ TRÍ CỘT ====================

    positionBar(bar, index, value) {

        const n = this.original.length;

        // Chiều rộng của một vị trí
        const slotWidth = 100 / n;

        // Cột chiếm 80% vị trí
        bar.style.width = `${slotWidth * 0.8}%`;

        // Tạo khoảng cách giữa các cột
        bar.style.left = `${slotWidth * 0.1}%`;

        // Di chuyển ngang bằng transform
        bar.style.transform =
            `translateX(${index * 125}%)`;


        // Tính chiều cao theo độ lớn giá trị
        const height = Math.max(
            2,
            Math.abs(value) / this.span * 84
        );


        // Số dương nằm phía trên trục 0
        // Số âm nằm phía dưới trục 0
        const top = value >= 0
            ? this.zeroPosition - height
            : this.zeroPosition;

        bar.style.top = `${top}%`;

        bar.style.height = `${height}%`;


        // Xử lý nhãn của cột quá thấp
        bar.classList.toggle(
            "small",
            height < 15
        );

        bar.classList.toggle(
            "negative",
            value < 0
        );
    }


    // ==================== HIỂN THỊ TỪNG FRAME ====================

    render(frameIndex, animate = true) {

        if (!Number.isInteger(frameIndex) ||
            frameIndex < 0 ||
            frameIndex >= this.frames.length) {

            return null;
        }

        const frame = this.frames[frameIndex];

        const step = frame.step;


        // Cập nhật từng cột dựa trên ID
        for (let id = 0; id < this.nodes.length; id++) {

            const bar = this.nodes[id];

            // Tìm vị trí hiện tại của phần tử
            const index = frame.slots.indexOf(id);


            // Phần tử key đang được giữ tạm
            if (index === -1) {

                bar.hidden = true;

                continue;
            }

            bar.hidden = false;


            // Bật hoặc tắt chuyển động
            bar.style.transition = animate
                ? ""
                : "none";


            // Cập nhật lớp màu sắc
            bar.className = "bar";

            const state = this.getBarClass(
                step,
                index
            );

            if (state) {

                bar.classList.add(state);
            }


            // Cập nhật vị trí cột
            this.positionBar(
                bar,
                index,
                this.original[id]
            );


            // Hiển thị giá trị khi rê chuột
            bar.title =
                `Vị trí ${index}: ${this.original[id]}`;
        }


        // Hiển thị ô trống của Insertion Sort
        this.renderHole(step, animate);

        // Hiển thị thành phần riêng của thuật toán
        this.renderAuxiliary(step);

        return step;
    }


    // ==================== Ô TRỐNG INSERTION SORT ====================

    renderHole(step, animate) {

        if (!this.hole) {

            return;
        }

        if (step.holeIndex == null) {

            this.hole.hidden = true;

            return;
        }

        const n = this.original.length;

        const slotWidth = 100 / n;

        this.hole.hidden = false;

        this.hole.style.transition = animate
            ? ""
            : "none";

        this.hole.style.width =
            `${slotWidth * 0.8}%`;

        this.hole.style.left =
            `${slotWidth * 0.1}%`;

        this.hole.style.transform =
            `translateX(${step.holeIndex * 125}%)`;

        this.hole.style.height = "14%";

        this.hole.style.top =
            `${Math.max(0, this.zeroPosition - 14)}%`;

        this.hole.title = "Vị trí trống";
    }


    // ==================== THÀNH PHẦN MÔ PHỎNG RIÊNG ====================

    renderAuxiliary(step) {

        const showKey =
            this.algorithm === "insertion" &&
            step.keyValue != null;

        const showBuffer =
            this.algorithm === "merge" &&
            step.mergeRange?.length === 3;

        const showHeap =
            this.algorithm === "heap";


        this.auxiliary.hidden =
            !(showKey || showBuffer || showHeap);

        this.keyContainer.hidden = !showKey;

        this.bufferContainer.hidden = !showBuffer;

        this.heapContainer.hidden = !showHeap;


        // Hiển thị key
        if (showKey) {

            this.keyValue.textContent =
                String(step.keyValue);
        }


        // Hiển thị mảng phụ
        if (showBuffer) {

            this.renderBuffer(
                step.mergeBuffer ?? []
            );
        }


        // Hiển thị cây Heap
        if (showHeap) {

            this.renderHeap(step);
        }
    }


    // ==================== MẢNG PHỤ MERGE SORT ====================

    renderBuffer(values) {

        this.bufferValues.replaceChildren();

        if (values.length === 0) {

            const text = document.createElement("span");

            text.textContent = "Mảng phụ đang rỗng";

            this.bufferValues.append(text);

            return;
        }

        for (const value of values) {

            const item = document.createElement("div");

            item.className = "buffer-item";

            item.textContent = String(value);

            this.bufferValues.append(item);
        }
    }


    // ==================== HÀM TẠO PHẦN TỬ SVG ====================

    createSvg(tag, attributes = {}) {

        const element = document.createElementNS(
            "http://www.w3.org/2000/svg",
            tag
        );

        for (const [name, value] of
            Object.entries(attributes)) {

            element.setAttribute(
                name,
                String(value)
            );
        }

        return element;
    }


    // ==================== HIỂN THỊ CÂY HEAP ====================

    renderHeap(step) {

        this.heapTree.replaceChildren();

        const size = step.heapSize ?? 0;


        // Heap rỗng khi hoàn thành
        if (size === 0) {

            this.heapTree.style.minWidth = "";

            this.heapTree.setAttribute(
                "viewBox", "0 0 320 140"
            );

            const text = this.createSvg("text", {

                x: 160,
                y: 70,
                fill: "var(--sorted)",
                "text-anchor": "middle",
                "font-size": 14
            });

            text.textContent =
                "Heap rỗng — Sắp xếp hoàn thành";

            this.heapTree.append(text);

            return;
        }


        // Tính số tầng của cây
        const depth = Math.floor(
            Math.log2(size)
        );

        const width = Math.max(
            320,
            2 ** depth * 68
        );

        const height = (depth + 1) * 74;

        this.heapTree.setAttribute(
            "viewBox",
            `0 0 ${width} ${height}`
        );

        this.heapTree.style.minWidth =
            size > 10 ? `${width}px` : "";


        // Tính tọa độ từng nút
        const positions = [];

        for (let i = 0; i < size; i++) {

            const level = Math.floor(
                Math.log2(i + 1)
            );

            const firstIndex =
                2 ** level - 1;

            const position =
                i - firstIndex;

            const count = 2 ** level;

            positions.push({

                x: (position + 0.5)
                    * width / count,

                y: 28 + level * 74
            });
        }


        // Vẽ các đường nối cha - con
        for (let i = 1; i < size; i++) {

            const parent = Math.floor(
                (i - 1) / 2
            );

            const edge = this.createSvg("line", {

                x1: positions[parent].x,
                y1: positions[parent].y,
                x2: positions[i].x,
                y2: positions[i].y,

                class: "heap-edge"
            });

            this.heapTree.append(edge);
        }


        // Vẽ các nút của Heap
        for (let i = 0; i < size; i++) {

            const { x, y } = positions[i];

            const state = this.getBarClass(step, i);

            const group = this.createSvg("g", {

                class: `heap-node ${state}`
            });


            // Hình tròn biểu diễn nút
            const circle = this.createSvg("circle", {

                cx: x,
                cy: y,
                r: 21
            });


            // Giá trị của nút
            const value = this.createSvg("text", {

                x: x,
                y: y,
                "font-size":
                    String(step.array[i]).length > 4
                        ? 9
                        : 14
            });

            value.textContent =
                String(step.array[i]);

            group.append(circle, value);

            this.heapTree.append(group);


            // Hiển thị chỉ số của nút
            const index = this.createSvg("text", {

                x: x,
                y: y + 34,
                fill: "var(--muted)",
                "font-size": 10,
                "text-anchor": "middle"
            });

            index.textContent = `[${i}]`;

            this.heapTree.append(index);
        }
    }


    // ==================== ĐIỀU CHỈNH TỐC ĐỘ ====================

    setSpeed(speed) {

        if (!Number.isFinite(speed) || speed <= 0) {

            return;
        }

        this.area.style.setProperty(
            "--duration",
            `${520 / speed}ms`
        );
    }
}
