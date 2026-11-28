
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

        // Lưu các nút và cấu trúc cố định của cây Heap
        this.heapView = null;

        // Dữ liệu mô phỏng
        this.algorithm = "";
        this.original = [];
        this.frames = [];

        // Danh sách các cột được giữ cố định
        this.nodes = [];

        // Cột biểu diễn ô trống của Insertion Sort
        this.hole = null;

        // Quản lý animation sao chép từ buffer
        this.copyFlight = null;

        // Frame gần nhất được yêu cầu hiển thị
        this.lastFrameIndex = null;

        // Tốc độ mô phỏng hiện tại
        this.speed = 1;

        // Danh sách các con trỏ thuật toán
        this.pointerNodes = new Map();

        // Tạo vùng chứa con trỏ
        this.pointerLayer = document.createElement("div");

        this.pointerLayer.className = "pointer-layer";

        this.pointerLayer.hidden = true;

        this.pointerLayer.setAttribute("aria-hidden", "true");

        // Thêm vùng con trỏ vào khu vực mô phỏng
        this.area.append(this.pointerLayer);


        // ==================== KHUNG PHẠM VI ====================

        // Tạo vùng chứa khung
        this.rangeLayer = document.createElement("div");

        this.rangeLayer.className = "range-layer";

        this.rangeLayer.setAttribute("aria-hidden", "true");


        // Tạo khung nét đứt
        this.rangeBox = document.createElement("div");

        this.rangeBox.className = "active-range";


        // Tạo đường phân chia hai nửa
        this.rangeDivider = document.createElement("div");

        this.rangeDivider.className = "range-divider";

        this.rangeDivider.hidden = true;


        // Thêm đường phân chia vào trong khung
        this.rangeBox.append(this.rangeDivider);

        // Thêm khung vào vùng chứa
        this.rangeLayer.append(this.rangeBox);

        // Đặt vùng chứa khung phía sau các cột
        this.area.prepend(this.rangeLayer);

        // Vị trí trục số 0
        this.zeroPosition = 50;

        // Phạm vi giá trị
        this.min = 0;
        this.max = 0;
        this.span = 1;

        // Quản lý animation khi sắp xếp hoàn thành
        this.completionAnimations = [];

        this.completionFrame = null;
    }


    // ==================== XÓA MÔ PHỎNG CŨ ====================

    clear() {
        // Hủy animation hoàn thành
        this.stopCompletionWave();

        // Hủy animation sao chép đang chạy
        this.stopCopyFlight();

        // Đặt lại vị trí frame
        this.lastFrameIndex = null;

        this.algorithm = "";
        this.original = [];
        this.frames = [];
        this.nodes = [];
        this.hole = null;

        // Xóa toàn bộ con trỏ cũ
        this.pointerNodes.clear();

        this.pointerLayer.replaceChildren();

        this.pointerLayer.hidden = true;

        // Khôi phục kích thước vùng mô phỏng
        this.area.classList.remove("has-pointers");

        // Đặt lại khoảng trống phía trên
        this.area.style.removeProperty(
            "--pointer-top-extra"
        );

        // Đặt lại chiều rộng con trỏ
        this.pointerLayer.style.removeProperty(
            "--pointer-slot-width"
        );

        // Ẩn khung phạm vi cũ
        this.rangeBox.style.transition = "none";

        this.rangeBox.classList.remove("visible");

        this.rangeDivider.hidden = true;

        // Đặt lại vị trí và kích thước khung
        this.rangeBox.style.left = "0%";

        this.rangeBox.style.width = "0%";

        this.bars.replaceChildren();
        this.indices.replaceChildren();

        this.keyValue.textContent = "";
        this.bufferValues.replaceChildren();
        this.heapTree.replaceChildren();
        this.heapView = null;

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

        // Kiểm tra có bước nào sử dụng con trỏ không
        const hasPointers = result.steps.some(step => {

            return Object.keys(
                step.pointers ?? {}
            ).length > 0;
        });

        // Dành không gian cho con trỏ nếu cần
        this.area.classList.toggle(
            "has-pointers",
            hasPointers
        );

        this.pointerLayer.hidden = !hasPointers;

        // Dành không gian phía trên cho con trỏ trùng
        if (hasPointers) {

            const lanes = this.getMaxPointerLanes(
                result.steps
            );

            // Một con trỏ nằm dưới,
            // các con trỏ còn lại nằm trên
            const extra = (lanes - 1) * 31;

            this.area.style.setProperty(
                "--pointer-top-extra",
                `${extra}px`
            );

            this.pointerLayer.style.setProperty(
                "--pointer-slot-width",
                `${100 / this.original.length}%`
            );
        }

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

            // Trạng thái vị trí tạm thời khi sao chép
            let frameSlots = null;

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

                // ---------- Sao chép từng phần tử ----------

                if (step.type === "copy") {

                    const [left] = step.mergeRange;

                    // Vị trí đang được sao chép
                    const target = step.indices[0];

                    // Sao chép trạng thái ID trước khi trộn
                    frameSlots = [...slots];

                    // Các ID đã được sao chép
                    const copiedIds = new Set();


                    // Cập nhật những vị trí đã sao chép
                    for (let pos = left; pos <= target; pos++) {

                        const id = bufferIds[pos - left];

                        frameSlots[pos] = id;

                        copiedIds.add(id);
                    }


                    // Xử lý những ID xuất hiện trùng lặp
                    for (let pos = 0; pos < n; pos++) {

                        // Bỏ qua những vị trí đã sao chép
                        if (pos >= left && pos <= target) {

                            continue;
                        }

                        // Sử dụng ID tạm nếu phần tử gốc
                        // đã được sao chép đến vị trí khác
                        if (copiedIds.has(frameSlots[pos])) {

                            frameSlots[pos] = n + pos;
                        }
                    }
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

                // Ưu tiên trạng thái sao chép tạm thời
                slots: frameSlots ?? [...slots]
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

        // Tạo các cột tạm thời cho Merge Sort
        if (this.algorithm === "merge") {

            const n = this.original.length;

            for (let i = 0; i < n; i++) {

                // Sao chép cấu trúc của cột gốc
                const bar = this.nodes[i].cloneNode(true);

                // Gán ID tạm thời
                bar.dataset.id = String(n + i);

                // Mặc định không hiển thị
                bar.hidden = true;

                // Thêm vào vùng mô phỏng
                this.bars.append(bar);

                // Lưu vào danh sách các cột
                this.nodes.push(bar);
            }
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

                case "copy":
                    return "copy";

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

        // Làm mờ phần tử chưa được xét trong Insertion Sort
        if (this.algorithm === "insertion" &&
            Number.isInteger(step.pointers?.i) &&
            index > step.pointers.i) {

            return "outside-range";
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

    renderFrame(frameIndex, animate = true) {

        if (!Number.isInteger(frameIndex) ||
            frameIndex < 0 ||
            frameIndex >= this.frames.length) {

            return null;
        }

        const frame = this.frames[frameIndex];

        const step = frame.step;

        // Khôi phục trạng thái hiển thị của ô giữ key
        this.keyValue.classList.remove(
            "key-flight-placeholder"
        );

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


            // Xác định giá trị của cột
            const value = id < this.original.length
                ? this.original[id]
                : step.array[index];


            // Cập nhật nhãn giá trị
            bar.querySelector(".bar-value").textContent =
                String(value);


            // Cập nhật vị trí và chiều cao cột
            this.positionBar(
                bar,
                index,
                value
            );


            // Hiển thị giá trị khi rê chuột
            bar.title =
                `Vị trí ${index}: ${value}`;
        }


        // Hiển thị ô trống của Insertion Sort
        this.renderHole(step, animate);

        // Hiển thị thành phần riêng của thuật toán
        this.renderAuxiliary(step, frame, animate);

        // Hiển thị các con trỏ thuật toán
        this.renderPointers(step, animate);

        // Hiển thị khung phạm vi xử lý
        this.renderRange(step, animate);

        // Animation khi hoàn thành sắp xếp
        this.renderCompletionWave(frame, animate);

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

    renderAuxiliary(step, frame = null, animate = true) {

        const showKey =
            this.algorithm === "insertion" &&
            step.keyValue != null;

        const showBuffer =
            this.algorithm === "merge" &&
            step.mergeRange?.length === 3;

        const showHeap =
            this.algorithm === "heap" &&
            this.original.length > 0;


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

            // Chỉ số phần tử nguồn trong buffer
            const sourceIndex = step.type === "copy"
                ? step.indices[0] - step.mergeRange[0]
                : -1;

            this.renderBuffer(
                step.mergeBuffer ?? [],
                sourceIndex
            );
        }

        // Hiển thị cây Heap trong suốt quá trình mô phỏng
        this.heapContainer.hidden = !showHeap;

        if (showHeap && frame) {

            this.renderHeap(step, frame, animate);
        }
    }

    // ==================== MẢNG PHỤ MERGE SORT ====================

    renderBuffer(values, sourceIndex = -1) {

        this.bufferValues.replaceChildren();

        if (values.length === 0) {

            const text = document.createElement("span");

            text.textContent = "Mảng phụ đang rỗng";

            this.bufferValues.append(text);

            return;
        }


        // Duyệt từng phần tử trong buffer
        for (const [index, value] of values.entries()) {

            const item = document.createElement("div");

            item.className = "buffer-item";

            item.textContent = String(value);

            item.title = `buffer[${index}] = ${value}`;


            // Đánh dấu phần tử đang được sao chép
            if (index === sourceIndex) {

                item.classList.add("copy-source");
            }


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


    // ==================== KHỞI TẠO CÂY HEAP ====================

    createHeapView() {

        this.heapTree.replaceChildren();

        const n = this.original.length;

        if (n === 0) {
            return;
        }

        // ---------- KÍCH THƯỚC CÂY ----------

        const depth = Math.floor(Math.log2(n));

        const width = Math.max(
            320,
            2 ** depth * 84
        );

        const height = (depth + 1) * 100 + 8;

        this.heapTree.setAttribute(
            "viewBox",
            `0 0 ${width} ${height}`
        );

        this.heapTree.style.minWidth = "";

        // Lưu tọa độ các vị trí
        const positions = [];

        // Lưu nút theo ID phần tử
        const nodes = [];

        // Lưu đường nối
        const edges = [];

        // Lưu nhãn con trỏ
        const pointerLabels = [];


        // ---------- TÍNH TỌA ĐỘ ----------

        for (let i = 0; i < n; i++) {

            const level = Math.floor(
                Math.log2(i + 1)
            );

            const firstIndex = 2 ** level - 1;

            const position = i - firstIndex;

            const count = 2 ** level;

            positions.push({

                x: (position + 0.5)
                    * width / count,

                y: 28 + level * 100
            });
        }


        // ---------- TẠO ĐƯỜNG NỐI ----------

        for (let i = 1; i < n; i++) {

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

            edges[i] = edge;
        }


        // ---------- TẠO CÁC NÚT CỐ ĐỊNH ----------

        for (let id = 0; id < n; id++) {

            const value = this.original[id];

            const group = this.createSvg("g", {

                class: "heap-node",

                "data-id": id
            });

            // Hình tròn của nút
            const circle = this.createSvg("circle", {

                cx: 0,
                cy: 0,
                r: 21
            });

            // Giá trị của nút
            const label = this.createSvg("text", {

                x: 0,
                y: 0,

                "font-size": Math.min(
                    14,
                    64 / String(value).length
                )
            });

            label.textContent = String(value);

            // Nhóm hình ảnh bên trong nút
            const body = this.createSvg("g", {

                class: "heap-node-body"
            });

            body.append(circle, label);

            group.append(body);

            // Ghi nhận vị trí ban đầu của nút
            group.dataset.slot = String(id);

            // Đặt nút ở vị trí ban đầu
            const { x, y } = positions[id];

            group.style.transition = "none";

            group.style.transform =
                `translate(${x}px, ${y}px)`;

            this.heapTree.append(group);

            nodes[id] = group;
        }


        // ---------- TẠO CHỈ SỐ VÀ CON TRỎ ----------

        for (let i = 0; i < n; i++) {

            const { x, y } = positions[i];

            // Chỉ số vị trí cố định
            const index = this.createSvg("text", {

                x: x,
                y: y + 34,

                fill: "var(--muted)",

                "font-size": 10,

                "text-anchor": "middle"
            });

            index.textContent = `[${i}]`;

            this.heapTree.append(index);


            // Nhãn con trỏ tại vị trí
            const pointerText = this.createSvg("text", {

                x: x,
                y: y + 50,

                class: "heap-pointer-text",

                "text-anchor": "middle",

                "font-size": 11
            });

            this.heapTree.append(pointerText);

            pointerLabels[i] = pointerText;
        }


        // ---------- LƯU CẤU TRÚC CÂY ----------

        this.heapView = {

            positions,

            nodes,

            edges,

            pointerLabels,

            lastFrame: null
        };
    }

    // ==================== XÁC ĐỊNH ĐƯỜNG NỐI HEAP ====================

    getHeapPath(from, to) {

        const ancestors = new Set();

        const edges = new Set();

        let current = from;


        // Tìm các nút tổ tiên của nút nguồn
        while (current >= 0) {

            ancestors.add(current);

            if (current === 0) {
                break;
            }

            current = Math.floor(
                (current - 1) / 2
            );
        }


        // Tìm tổ tiên chung
        current = to;

        while (!ancestors.has(current)) {

            edges.add(current);

            current = Math.floor(
                (current - 1) / 2
            );
        }

        const commonAncestor = current;


        // Lấy đường nối từ nguồn tới tổ tiên chung
        current = from;

        while (current !== commonAncestor) {

            edges.add(current);

            current = Math.floor(
                (current - 1) / 2
            );
        }

        return edges;
    }


    // ==================== CẬP NHẬT CÂY HEAP ====================

    renderHeap(step, frame, animate = true) {

        const n = this.original.length;

        if (n === 0 || !frame) {
            return;
        }

        // Chỉ tạo cây nếu chưa tồn tại
        if (!this.heapView ||
            !this.heapTree.contains(this.heapView.nodes[0])) {

            this.createHeapView();

            animate = false;
        }

        const {

            positions,

            nodes,

            edges,

            pointerLabels

        } = this.heapView;


        // Số phần tử còn thuộc Heap
        const heapSize = step.type === "initial"
            ? n
            : (step.heapSize ?? n);

        // Tránh phát lại hiệu ứng khi người dùng tạm dừng, tua tiến trình hoặc đặt lại
        // Xác định bước mô phỏng trước đó
        const previousFrame = this.heapView.lastFrame;

        const frameChanged = previousFrame !== frame;

        // Chỉ chạy Rise / Sink khi tiến một bước
        const isForward = previousFrame !== null &&
            this.frames.indexOf(frame) ===
            this.frames.indexOf(previousFrame) + 1;

        const animateSwap =
            animate &&
            isForward &&
            step.type === "swap";

        // ---------- CẬP NHẬT VỊ TRÍ CÁC NÚT ----------

        for (let id = 0; id < n; id++) {

            // Lấy nút theo ID cố định
            const node = nodes[id];

            // Tìm vị trí hiện tại của phần tử
            const index = frame.slots.indexOf(id);

            if (index === -1) {
                continue;
            }

            const { x, y } = positions[index];


            // ---------- HIỆU ỨNG RISE / SINK ----------

            // Vị trí trước khi di chuyển
            const oldIndex = Number(node.dataset.slot);

            // Nhóm hình ảnh bên trong nút
            const body = node.querySelector(
                ".heap-node-body"
            );

            if (body && (frameChanged || !animate)) {

                // Xóa hiệu ứng trước đó
                body.classList.remove(
                    "rise",
                    "sink"
                );

                if (animateSwap &&
                    Number.isInteger(oldIndex) &&
                    oldIndex >= 0 &&
                    oldIndex < n &&
                    oldIndex !== index) {

                    const oldY = positions[oldIndex].y;

                    const newY = positions[index].y;

                    // Cho phép hiệu ứng chạy lại
                    body.getBoundingClientRect();

                    // Nút di chuyển lên tầng trên
                    if (newY < oldY) {

                        body.classList.add("rise");
                    }

                    // Nút di chuyển xuống tầng dưới
                    else if (newY > oldY) {

                        body.classList.add("sink");
                    }
                }
            }


            // Lưu vị trí mới của nút
            node.dataset.slot = String(index);


            // Bật hoặc tắt animation
            node.style.transition = animate
                ? ""
                : "none";

            // Di chuyển nút đến tọa độ mới
            node.style.transform =
                `translate(${x}px, ${y}px)`;

            // Lấy trạng thái giống mảng chính
            const state = this.getBarClass(
                step,
                index
            );

            node.setAttribute(
                "class",
                `heap-node ${state}`
            );

            // Nút đã hoàn thành
            if (index >= heapSize ||
                step.type === "done") {

                node.classList.add("sorted");
            }
        }

        // ---------- CẬP NHẬT ĐƯỜNG NỐI ----------

        let activeEdges = new Set();

        let edgeState = "";

        const indices = step.indices ?? [];


        // So sánh hoặc hoán đổi
        if ((step.type === "compare" ||
            step.type === "swap") &&
            indices.length === 2) {

            const [from, to] = indices;

            if (Number.isInteger(from) &&
                Number.isInteger(to) &&
                from >= 0 && from < heapSize &&
                to >= 0 && to < heapSize) {

                activeEdges = this.getHeapPath(
                    from,
                    to
                );

                edgeState = step.type;
            }
        }


        // Chọn nút con làm selectedIndex
        if (step.type === "select") {

            const root = step.pointers?.root;

            const selected =
                step.pointers?.selectedIndex;

            if (Number.isInteger(root) &&
                Number.isInteger(selected) &&
                root >= 0 && root < heapSize &&
                selected >= 0 && selected < heapSize) {

                activeEdges = this.getHeapPath(
                    root,
                    selected
                );

                edgeState = "selected";
            }
        }

        // Cập nhật từng đường nối
        for (let i = 1; i < n; i++) {

            const edge = edges[i];

            // Xóa hiệu ứng của bước trước
            edge.classList.remove(
                "compare",
                "selected",
                "swap"
            );

            const inactive = i >= heapSize;

            // Đường nối ngoài Heap
            edge.classList.toggle(
                "inactive",
                inactive
            );

            // Làm nổi bật đường nối đang xử lý
            if (!inactive &&
                activeEdges.has(i) &&
                edgeState) {

                edge.classList.add(edgeState);
            }
        }



        // ---------- CẬP NHẬT CON TRỎ ----------

        const pointers = {
            ...(step.pointers ?? {})
        };

        // Luôn ẩn con trỏ i trên cây Heap
        delete pointers.i;

        if (step.type === "swap") {

            // Ẩn sel khi hoán đổi
            delete pointers.selectedIndex;

            // Ẩn root khi hoán đổi nút gốc
            // với phần tử cuối Heap
            if (Number.isInteger(step.pointers?.i)) {

                delete pointers.root;
            }
        }

        const pointerStyles = {

            root: {
                label: "root",
                color: "var(--flag)"
            },

            left: {
                label: "L",
                color: "var(--compare)"
            },

            right: {
                label: "R",
                color: "var(--swap)"
            },

            selectedIndex: {
                label: "sel",
                color: "var(--flag)"
            },

            i: {
                label: "i",
                color: "var(--compare)"
            }
        };


        for (let i = 0; i < n; i++) {

            const pointerText = pointerLabels[i];

            // Xóa nhãn cũ
            pointerText.replaceChildren();

            // Không hiển thị con trỏ ngoài Heap
            if (i >= heapSize) {
                continue;
            }

            // Tìm con trỏ tại vị trí hiện tại
            const activePointers = Object.entries(
                pointers
            ).filter(([name, position]) =>
                position === i
            );

            activePointers.forEach(([name], order) => {

                const style = pointerStyles[name] ?? {

                    label: name,

                    color: "var(--flag)"
                };

                // Phân cách các con trỏ trùng vị trí
                if (order > 0) {

                    const separator = this.createSvg(
                        "tspan",
                        {
                            fill: "var(--muted)"
                        }
                    );

                    separator.textContent = " / ";

                    pointerText.append(separator);
                }

                // Tạo nhãn màu tương ứng
                const label = this.createSvg("tspan", {

                    fill: style.color
                });

                label.textContent = style.label;

                pointerText.append(label);
            });
        }

        // Lưu bước hiện tại cho lần cập nhật tiếp theo
        this.heapView.lastFrame = frame;
    }


    // ==================== ĐẾM CON TRỎ TRÙNG VỊ TRÍ ====================

    getMaxPointerLanes(steps) {

        let maxLanes = 1;

        const n = this.original.length;

        for (const step of steps) {

            const counts = new Map();

            const pointers = step.pointers ?? {};

            for (const index of Object.values(pointers)) {

                if (!Number.isInteger(index) ||
                    index < 0 ||
                    index >= n) {

                    continue;
                }

                const count =
                    (counts.get(index) ?? 0) + 1;

                counts.set(index, count);

                maxLanes = Math.max(
                    maxLanes,
                    count
                );
            }
        }

        return maxLanes;
    }

    // ==================== TẠO CON TRỎ ====================

    createPointer(name) {

        // Tái sử dụng con trỏ đã tồn tại
        if (this.pointerNodes.has(name)) {

            return this.pointerNodes.get(name);
        }

        // Tên hiển thị rút gọn
        const labels = {

            selectedIndex: "sel",

            pivotIndex: "pivot",

            holeIndex: "hole",

            left: "L",

            right: "R"
        };

        // Tạo con trỏ
        const pointer = document.createElement("div");

        pointer.className = "array-pointer";

        pointer.dataset.pointer = name;

        // Tạo nhãn
        const label = document.createElement("span");

        label.className = "pointer-label";

        label.textContent = labels[name] ?? name;

        pointer.append(label);

        // Thêm vào vùng mô phỏng
        this.pointerLayer.append(pointer);

        // Lưu để tái sử dụng
        this.pointerNodes.set(name, pointer);

        return pointer;
    }

    // ==================== HIỂN THỊ CON TRỎ ====================

    renderPointers(step, animate = true) {

        const n = this.original.length;

        if (n === 0 || this.pointerLayer.hidden) {

            return;
        }

        // Sao chép dữ liệu con trỏ để không làm thay đổi
        // trạng thái gốc do Backend trả về
        const pointers = { ...(step.pointers ?? {}) };

        // Selection Sort: khi hoán đổi,
        // con trỏ sel đi theo phần tử được chọn
        if (this.algorithm === "selection" &&
            step.type === "swap" &&
            Number.isInteger(pointers.i) &&
            Number.isInteger(pointers.selectedIndex)) {

            pointers.selectedIndex = pointers.i;
        }

        // Quick Sort: ẩn con trỏ i khi chưa có
        // phần tử nào thỏa mãn điều kiện phân hoạch
        if (this.algorithm === "quick" &&
            step.partitionRange?.length === 2) {

            const [left, right] = step.partitionRange;

            if (Number.isInteger(pointers.i) &&
                (pointers.i < left ||
                    pointers.i > right)) {

                delete pointers.i;
            }
        }

        // Heap Sort: tạm ẩn sel khi thực hiện hoán đổi
        if (this.algorithm === "heap") {

            // Luôn ẩn con trỏ i
            delete pointers.i;

            if (step.type === "swap") {

                // Ẩn sel khi hoán đổi
                delete pointers.selectedIndex;

                // Ẩn root khi hoán đổi nút gốc
                // với phần tử cuối Heap
                if (Number.isInteger(step.pointers?.i)) {

                    delete pointers.root;
                }
            }
        }

        // Danh sách con trỏ đang hoạt động
        const activeNames = new Set();

        // Đếm số con trỏ tại từng vị trí
        const countsByIndex = new Map();


        // Ưu tiên các con trỏ chính nằm phía dưới
        const priority = [
            "i", "j", "k",
            "root", "left", "right"
        ];

        function getPriority(name) {

            const index = priority.indexOf(name);

            return index === -1
                ? priority.length
                : index;
        }

        const entries = Object.entries(pointers)
            .sort((a, b) =>
                getPriority(a[0]) - getPriority(b[0])
            );


        // Duyệt từng con trỏ
        for (const [name, index] of entries) {

            // Kiểm tra vị trí hợp lệ
            if (!Number.isInteger(index) ||
                index < 0 ||
                index >= n) {

                continue;
            }

            activeNames.add(name);

            // Lấy hoặc tạo con trỏ
            const pointer = this.createPointer(name);

            const wasVisible =
                pointer.classList.contains("visible");


            // Bật hoặc tắt chuyển động
            pointer.style.transition =
                animate && wasVisible
                    ? ""
                    : "none";


            // ---------- VỊ TRÍ NGANG ----------

            const slotWidth = 100 / n;

            const position =
                (index + 0.5) * slotWidth;

            pointer.style.left = `${position}%`;


            // ---------- KIỂM TRA TRÙNG VỊ TRÍ ----------

            const count =
                countsByIndex.get(index) ?? 0;

            countsByIndex.set(
                index,
                count + 1
            );


            // ---------- CON TRỎ PHÍA DƯỚI ----------

            if (count === 0) {

                pointer.dataset.side = "bottom";

                pointer.dataset.stacked = "false";

                pointer.style.top =
                    "calc(100% - 24px)";
            }


            // ---------- CON TRỎ PHÍA TRÊN ----------

            else {

                pointer.dataset.side = "top";

                // Hàng đầu tiên phía trên có mũi tên
                pointer.dataset.stacked =
                    String(count > 1);

                // Tính vị trí của hàng phía trên
                const offset =
                    14 + (count - 1) * 31;

                pointer.style.top =
                    `calc(var(--pointer-top-extra) - ${offset}px)`;
            }


            // Thông tin đầy đủ của con trỏ
            pointer.title = `${name} = ${index}`;

            // Hiển thị
            pointer.classList.add("visible");
        }


        // ---------- ẨN CON TRỎ KHÔNG CÒN SỬ DỤNG ----------

        for (const [name, pointer] of
            this.pointerNodes) {

            if (!activeNames.has(name)) {

                pointer.style.transition =
                    animate ? "" : "none";

                pointer.classList.remove("visible");
            }
        }
    }

    // ==================== XÁC ĐỊNH PHẠM VI XỬ LÝ ====================

    getActiveRange(step) {

        const n = this.original.length;

        // Không hiển thị khi chưa bắt đầu
        // hoặc đã hoàn thành thuật toán
        if (n === 0 ||
            step.type === "initial" ||
            step.type === "done") {

            return null;
        }


        // ---------- Insertion Sort ----------

        if (this.algorithm === "insertion") {

            // Lấy vị trí ban đầu của key
            const i = step.pointers?.i;

            // Kiểm tra vị trí hợp lệ
            if (!Number.isInteger(i) ||
                i < 0 ||
                i >= n) {

                return null;
            }

            // Phạm vi đang được xử lý
            return {
                left: 0,
                right: i,
                mid: null
            };
        }

        // ---------- Bubble Sort ----------

        if (this.algorithm === "bubble") {

            // Các vị trí đã sắp xếp hoàn tất
            const sorted = new Set(
                step.sortedIndices ?? []
            );

            // Bắt đầu từ cuối mảng
            let right = n - 1;

            // Bỏ qua những vị trí đã hoàn thành
            while (right >= 0 && sorted.has(right)) {

                right--;
            }

            // Không còn phần tử chưa sắp xếp
            if (right < 0) {

                return null;
            }

            // Phạm vi chưa sắp xếp
            return {

                left: 0,

                right: right,

                mid: null
            };
        }

        // ---------- Selection Sort ----------

        if (this.algorithm === "selection") {

            // Tập hợp các vị trí đã hoàn thành
            const sorted = new Set(
                step.sortedIndices ?? []
            );

            // Tìm vị trí đầu tiên chưa được sắp xếp
            let left = 0;

            while (left < n && sorted.has(left)) {

                left++;
            }

            // Không còn phần tử cần xử lý
            if (left >= n) {

                return null;
            }

            // Phạm vi chưa được sắp xếp
            return {

                left: left,

                right: n - 1,

                mid: null
            };
        }

        // ---------- Merge Sort ----------

        if (this.algorithm === "merge" &&
            step.mergeRange?.length === 3) {

            const [left, mid, right] =
                step.mergeRange;

            return {
                left: left,
                right: right,
                mid: mid
            };
        }


        // ---------- Quick Sort ----------

        if (this.algorithm === "quick" &&
            step.partitionRange?.length === 2) {

            const [left, right] =
                step.partitionRange;

            return {
                left: left,
                right: right,
                mid: null
            };
        }


        // ---------- Heap Sort ----------

        if (this.algorithm === "heap" &&
            Number.isInteger(step.heapSize) &&
            step.heapSize > 0) {

            return {
                left: 0,
                right: step.heapSize - 1,
                mid: null
            };
        }


        // Các thuật toán chưa sử dụng khung
        return null;
    }


    // ==================== HIỂN THỊ KHUNG PHẠM VI ====================

    renderRange(step, animate = true) {

        const n = this.original.length;

        // Lấy phạm vi đang xử lý
        const range = this.getActiveRange(step);


        // Ẩn khung nếu không có phạm vi hợp lệ
        if (!range ||
            !Number.isInteger(range.left) ||
            !Number.isInteger(range.right) ||
            range.left < 0 ||
            range.right >= n ||
            range.left > range.right) {

            this.rangeBox.style.transition = animate
                ? ""
                : "none";

            this.rangeBox.classList.remove("visible");

            this.rangeDivider.hidden = true;

            return;
        }


        const { left, right, mid } = range;


        // Kiểm tra khung đã xuất hiện chưa
        const wasVisible =
            this.rangeBox.classList.contains("visible");


        // Chỉ tạo chuyển động nếu khung
        // đã xuất hiện ở bước trước
        this.rangeBox.style.transition =
            animate && wasVisible
                ? ""
                : "none";


        // Chiều rộng của mỗi vị trí trong mảng
        const slotWidth = 100 / n;


        // Số phần tử trong phạm vi xử lý
        const count = right - left + 1;


        // Tính vị trí bắt đầu của khung
        this.rangeBox.style.left =
            `${left * slotWidth}%`;


        // Tính chiều rộng của khung
        this.rangeBox.style.width =
            `${count * slotWidth}%`;


        // Hiển thị khung
        this.rangeBox.classList.add("visible");


        // ---------- Đường phân chia Merge Sort ----------

        const showDivider =
            this.algorithm === "merge" &&
            Number.isInteger(mid) &&
            mid >= left &&
            mid < right;


        this.rangeDivider.hidden = !showDivider;


        if (showDivider) {

            // Vị trí phân chia tính theo chiều rộng khung
            const position =
                (mid - left + 1) / count * 100;


            this.rangeDivider.style.transition =
                animate && wasVisible
                    ? ""
                    : "none";


            this.rangeDivider.style.left =
                `${position}%`;
        }
    }


    // ==================== ĐIỀU PHỐI HIỂN THỊ FRAME ====================

    render(frameIndex, animate = true) {

        // Kiểm tra frame hợp lệ
        if (!Number.isInteger(frameIndex) ||
            frameIndex < 0 ||
            frameIndex >= this.frames.length) {

            return null;
        }

        const step = this.frames[frameIndex].step;


        // Không khởi động lại animation khi
        // người dùng tạm dừng hoặc tiếp tục
        // tại cùng một frame
        if (this.copyFlight &&
            this.copyFlight.index === frameIndex &&
            animate) {

            return step;
        }


        // Hoàn thành animation cũ nếu người dùng
        // chuyển bước trước khi animation kết thúc
        this.stopCopyFlight(true);


        // Kiểm tra có đang tiến đúng một bước không
        const forward =
            this.lastFrameIndex !== null &&
            frameIndex === this.lastFrameIndex + 1;

        this.lastFrameIndex = frameIndex;


        // Tạo animation hai chiều cho Merge Sort
        if (this.algorithm === "merge" &&
            animate &&
            forward) {

            // Từ mảng chính xuống buffer
            if (step.type === "move") {

                const started =
                    this.animateMove(frameIndex);

                if (started) {

                    return step;
                }
            }

            // Từ buffer về mảng chính
            if (step.type === "copy") {

                const started =
                    this.animateCopy(frameIndex);

                if (started) {

                    return step;
                }
            }
        }

        // Animation lấy và chèn key của Insertion Sort
        if (this.algorithm === "insertion" &&
            animate &&
            forward &&
            (step.type === "select" ||
                step.type === "insert")) {

            const started =
                this.animateKeyTransfer(frameIndex);

            if (started) {

                return step;
            }
        }

        // Các bước thông thường hiển thị ngay
        return this.renderFrame(
            frameIndex,
            animate
        );
    }


    // ==================== HỦY ANIMATION SAO CHÉP ====================

    stopCopyFlight(settle = false) {

        if (!this.copyFlight) {

            return;
        }

        const flight = this.copyFlight;

        // Xóa trạng thái trước khi hủy animation
        this.copyFlight = null;

        // Dừng chuyển động
        flight.animation.cancel();

        // Xóa phần tử tạm
        flight.ghost.remove();

        // Xóa trạng thái ô giữ key tạm thời
        this.keyValue.classList.remove(
            "key-flight-placeholder"
        );

        // Hiển thị kết quả cuối của bước đang chạy
        if (settle) {

            this.renderFrame(
                flight.index,
                false
            );
        }
    }


    // ==================== ANIMATION SAO CHÉP ====================

    animateCopy(frameIndex) {

        const step = this.frames[frameIndex].step;

        // Vị trí đích trong mảng chính
        const targetIndex = step.indices?.[0];

        // Vị trí nguồn trong buffer
        const left = step.mergeRange?.[0];

        const sourceIndex = targetIndex - left;

        // Giá trị cần sao chép
        const value = step.mergeBuffer?.[sourceIndex];

        const n = this.original.length;


        // Kiểm tra dữ liệu hợp lệ
        if (!Number.isInteger(targetIndex) ||
            targetIndex < 0 ||
            targetIndex >= n ||
            !Number.isInteger(value)) {

            return false;
        }


        // Lấy vùng mô phỏng chính
        const panel = this.area.closest(
            ".visualization-panel"
        );

        if (!panel) {

            return false;
        }


        // ---------- GIAI ĐOẠN 1: TÔ VÀNG BUFFER ----------

        // Xóa màu thao tác của bước trước
        // nhưng vẫn giữ nguyên giá trị mảng chính
        for (const bar of this.nodes) {

            bar.classList.remove(
                "move",
                "copy",
                "compare"
            );
        }


        // Tô vàng phần tử nguồn trong buffer
        this.renderAuxiliary(step);

        // Cập nhật con trỏ k
        this.renderPointers(step, true);

        // Giữ đúng khung phạm vi
        this.renderRange(step, true);


        // Lấy phần tử nguồn đang được tô vàng
        const source = this.bufferValues.querySelector(
            ".buffer-item.copy-source"
        );

        if (!source ||
            typeof source.animate !== "function") {

            return false;
        }


        // ---------- TÍNH TỌA ĐỘ DI CHUYỂN ----------

        const sourceRect =
            source.getBoundingClientRect();

        const barsRect =
            this.bars.getBoundingClientRect();

        const panelRect =
            panel.getBoundingClientRect();


        if (sourceRect.width === 0 ||
            barsRect.width === 0 ||
            barsRect.height === 0) {

            return false;
        }


        // Tọa độ chính giữa cột đích
        const targetX =
            barsRect.left +
            (targetIndex + 0.5) *
            barsRect.width / n;


        // Tính chiều cao của giá trị mới
        const heightPercent = Math.max(
            2,
            Math.abs(value) / this.span * 84
        );


        // Tính vị trí phía trên của cột đích
        const topPercent = value >= 0
            ? this.zeroPosition - heightPercent
            : this.zeroPosition;


        // Tọa độ giữa cột sau khi sao chép
        const targetY =
            barsRect.top +
            (topPercent + heightPercent / 2) /
            100 * barsRect.height;


        // Tọa độ chính giữa phần tử nguồn
        const sourceX =
            sourceRect.left +
            sourceRect.width / 2;

        const sourceY =
            sourceRect.top +
            sourceRect.height / 2;


        // Khoảng cách di chuyển
        const deltaX = targetX - sourceX;

        const deltaY = targetY - sourceY;


        // ---------- GIAI ĐOẠN 2: TẠO BẢN SAO ----------

        const ghost = document.createElement("div");

        ghost.className = "copy-ghost";

        ghost.textContent = String(value);

        ghost.setAttribute("aria-hidden", "true");


        // Đặt bản sao đúng vị trí phần tử nguồn
        ghost.style.left =
            `${sourceRect.left - panelRect.left
            - panel.clientLeft + panel.scrollLeft}px`;

        ghost.style.top =
            `${sourceRect.top - panelRect.top
            - panel.clientTop + panel.scrollTop}px`;

        ghost.style.width =
            `${sourceRect.width}px`;

        ghost.style.height =
            `${sourceRect.height}px`;

        panel.append(ghost);


        // ---------- GIAI ĐOẠN 3: DI CHUYỂN ----------

        const animation = ghost.animate(

            [
                {
                    transform: "translate(0px, 0px)",
                    opacity: 1
                },

                {
                    transform:
                        `translate(${deltaX}px, ${deltaY}px)`,

                    opacity: 1
                }
            ],

            {
                // Chờ để người xem thấy ô nguồn màu vàng
                delay: 180,

                // Thời gian bản sao di chuyển
                duration: 520,

                easing:
                    "cubic-bezier(.22, 1, .36, 1)",

                fill: "forwards"
            }
        );


        // Đồng bộ tốc độ với bộ điều khiển
        animation.playbackRate = this.speed;


        // Lưu animation hiện tại
        const flight = {

            index: frameIndex,

            ghost: ghost,

            animation: animation
        };

        this.copyFlight = flight;


        // ---------- GIAI ĐOẠN 4: CẬP NHẬT MẢNG CHÍNH ----------

        animation.finished.then(() => {

            // Bỏ qua nếu animation đã bị hủy
            if (this.copyFlight !== flight) {

                return;
            }

            this.copyFlight = null;

            // Xóa bản sao sau khi đến đích
            ghost.remove();

            animation.cancel();


            // Cập nhật giá trị và tô vàng cột đích
            // Không tạo thêm animation hoán đổi
            this.renderFrame(
                frameIndex,
                false
            );

        }, () => {

            // Animation bị hủy khi người dùng
            // chuyển bước hoặc thay đổi dữ liệu
        });

        return true;
    }


    // ==================== ANIMATION ĐƯA VÀO BUFFER ====================

    animateMove(frameIndex) {

        // Lấy trạng thái mô phỏng hiện tại
        const frame = this.frames[frameIndex];

        const step = frame.step;


        // Vị trí nguồn trong mảng chính
        const sourceIndex = step.indices?.[0];

        // Mảng phụ sau khi thêm phần tử
        const buffer = step.mergeBuffer ?? [];

        // Vị trí đích trong buffer
        const targetIndex = buffer.length - 1;

        // Giá trị cần đưa vào buffer
        const value = buffer[targetIndex];

        const n = this.original.length;


        // Kiểm tra dữ liệu hợp lệ
        if (!Number.isInteger(sourceIndex) ||
            sourceIndex < 0 ||
            sourceIndex >= n ||
            targetIndex < 0 ||
            !Number.isInteger(value)) {

            return false;
        }


        // Lấy vùng mô phỏng chính
        const panel = this.area.closest(
            ".visualization-panel"
        );

        if (!panel) {

            return false;
        }


        // ---------- GIAI ĐOẠN 1: ĐÁNH DẤU PHẦN TỬ ----------

        // Hiển thị màu sắc, con trỏ và khung phạm vi
        // của bước hiện tại
        this.renderFrame(frameIndex, true);


        // Lấy ID của phần tử nguồn
        const sourceId = frame.slots[sourceIndex];

        // Lấy cột tương ứng trong mảng chính
        const source = this.nodes[sourceId];


        // Lấy danh sách các phần tử trong buffer
        const bufferItems =
            this.bufferValues.querySelectorAll(
                ".buffer-item"
            );

        // Lấy ô đích trong buffer
        const target = bufferItems[targetIndex];


        // Kiểm tra các phần tử HTML
        if (!source ||
            !target ||
            typeof source.animate !== "function") {

            return false;
        }


        // ---------- GIAI ĐOẠN 2: TẠO Ô TRỐNG ----------

        // Tạm thời chưa hiển thị giá trị mới trong buffer
        target.classList.add("move-placeholder");

        target.setAttribute("aria-hidden", "true");

        target.removeAttribute("title");


        // ---------- TÍNH TỌA ĐỘ DI CHUYỂN ----------

        const sourceRect =
            source.getBoundingClientRect();

        const targetRect =
            target.getBoundingClientRect();

        const panelRect =
            panel.getBoundingClientRect();


        // Kiểm tra kích thước vùng hiển thị
        if (sourceRect.width === 0 ||
            sourceRect.height === 0 ||
            targetRect.width === 0 ||
            targetRect.height === 0) {

            // Hiển thị trực tiếp nếu không thể tạo animation
            this.renderFrame(frameIndex, false);

            return false;
        }


        // Tọa độ giữa phần tử nguồn
        const sourceX =
            sourceRect.left +
            sourceRect.width / 2;

        const sourceY =
            sourceRect.top +
            sourceRect.height / 2;


        // Tọa độ giữa ô đích trong buffer
        const targetX =
            targetRect.left +
            targetRect.width / 2;

        const targetY =
            targetRect.top +
            targetRect.height / 2;


        // Khoảng cách di chuyển
        const deltaX = targetX - sourceX;

        const deltaY = targetY - sourceY;


        // ---------- GIAI ĐOẠN 3: TẠO BẢN SAO ----------

        const ghost = document.createElement("div");

        ghost.className = "copy-ghost move-ghost";

        ghost.textContent = String(value);

        ghost.setAttribute("aria-hidden", "true");


        // Đặt bản sao ở chính giữa cột nguồn
        ghost.style.left =
            `${sourceX - targetRect.width / 2
            - panelRect.left
            - panel.clientLeft
            + panel.scrollLeft}px`;

        ghost.style.top =
            `${sourceY - targetRect.height / 2
            - panelRect.top
            - panel.clientTop
            + panel.scrollTop}px`;


        // Kích thước bản sao bằng kích thước ô buffer
        ghost.style.width =
            `${targetRect.width}px`;

        ghost.style.height =
            `${targetRect.height}px`;


        // Thêm bản sao vào vùng mô phỏng
        panel.append(ghost);


        // ---------- GIAI ĐOẠN 4: DI CHUYỂN ----------

        const animation = ghost.animate(

            [
                {
                    transform: "translate(0px, 0px)",

                    opacity: 1
                },

                {
                    transform:
                        `translate(${deltaX}px, ${deltaY}px)`,

                    opacity: 1
                }
            ],

            {
                // Chờ để quan sát phần tử được chọn
                delay: 180,

                // Thời gian di chuyển
                duration: 520,

                // Hiệu ứng chuyển động mượt
                easing:
                    "cubic-bezier(.22, 1, .36, 1)",

                fill: "forwards"
            }
        );


        // Đồng bộ với tốc độ mô phỏng
        animation.playbackRate = this.speed;


        // Dùng chung cơ chế quản lý animation copy
        const flight = {

            index: frameIndex,

            ghost: ghost,

            animation: animation
        };

        this.copyFlight = flight;


        // ---------- GIAI ĐOẠN 5: HOÀN THÀNH ----------

        animation.finished.then(() => {

            // Bỏ qua nếu animation đã bị hủy
            if (this.copyFlight !== flight) {

                return;
            }


            // Xóa trạng thái animation
            this.copyFlight = null;


            // Xóa bản sao khi đã đến buffer
            ghost.remove();

            animation.cancel();


            // Hiển thị giá trị chính thức trong buffer
            this.renderFrame(
                frameIndex,
                false
            );

        }, () => {

            // Animation bị hủy khi người dùng
            // chuyển bước hoặc thay đổi dữ liệu
        });

        return true;
    }


    // ==================== ANIMATION LẤY VÀ CHÈN KEY ====================

    animateKeyTransfer(frameIndex) {

        // Lấy trạng thái hiện tại và trước đó
        const step = this.frames[frameIndex].step;

        const previousStep =
            this.frames[frameIndex - 1]?.step;

        // Xác định đang lấy hay chèn key
        const extracting = step.type === "select";


        // ---------- LẤY DỮ LIỆU KEY ----------

        // Khi chèn key, KeyValue của bước hiện tại
        // đã là null nên phải lấy từ bước trước
        const value = extracting
            ? step.keyValue
            : previousStep?.keyValue;


        // Vị trí lấy hoặc chèn key
        const index = extracting
            ? step.holeIndex
            : step.indices?.[0];

        const n = this.original.length;


        // Kiểm tra dữ liệu hợp lệ
        if (!Number.isInteger(value) ||
            !Number.isInteger(index) ||
            index < 0 ||
            index >= n ||
            !previousStep) {

            return false;
        }


        // Lấy vùng mô phỏng
        const panel = this.area.closest(
            ".visualization-panel"
        );

        if (!panel ||
            typeof this.keyValue.animate !== "function") {

            return false;
        }


        // ---------- CHUẨN BỊ TRẠNG THÁI ----------

        if (extracting) {

            // Hiển thị trạng thái đã lấy key ra
            // Mảng chính xuất hiện ô trống
            this.renderFrame(frameIndex, false);

        } else {

            // Giữ nguyên trạng thái trước khi chèn
            // để ô trống chưa bị lấp đầy
            this.renderFrame(frameIndex - 1, false);

            // Cập nhật con trỏ của bước insert
            this.renderPointers(step, true);

            // Cập nhật khung phạm vi
            this.renderRange(step, true);

            // Xóa màu thao tác trước đó
            for (const bar of this.nodes) {

                bar.classList.remove(
                    "compare",
                    "move",
                    "insert"
                );
            }
        }


        // ---------- TÍNH TỌA ĐỘ ----------

        const barsRect =
            this.bars.getBoundingClientRect();

        const keyRect =
            this.keyValue.getBoundingClientRect();

        const panelRect =
            panel.getBoundingClientRect();


        // Kiểm tra vùng hiển thị
        if (barsRect.width === 0 ||
            barsRect.height === 0 ||
            keyRect.width === 0 ||
            keyRect.height === 0) {

            return false;
        }


        // Tính chiều cao cột tương ứng với key
        const heightPercent = Math.max(
            2,
            Math.abs(value) / this.span * 84
        );


        // Tính vị trí phía trên của cột
        const topPercent = value >= 0
            ? this.zeroPosition - heightPercent
            : this.zeroPosition;


        // Tọa độ của key trong mảng chính
        const barPosition = {

            x: barsRect.left +
                (index + 0.5) * barsRect.width / n,

            y: barsRect.top +
                (topPercent + heightPercent / 2) /
                100 * barsRect.height,

            width: barsRect.width / n * 0.8,

            height: Math.max(
                3,
                heightPercent / 100 * barsRect.height
            )
        };


        // Tọa độ của ô giữ key
        const keyPosition = {

            x: keyRect.left + keyRect.width / 2,

            y: keyRect.top + keyRect.height / 2,

            width: keyRect.width,

            height: keyRect.height
        };


        // Xác định nguồn và đích
        const source = extracting
            ? barPosition
            : keyPosition;

        const target = extracting
            ? keyPosition
            : barPosition;


        // Khoảng cách cần di chuyển
        const deltaX = target.x - source.x;

        const deltaY = target.y - source.y;


        // ---------- TẠO PHẦN TỬ DI CHUYỂN ----------

        const ghost = document.createElement("div");

        ghost.className = "copy-ghost key-ghost";

        ghost.textContent = String(value);

        ghost.setAttribute("aria-hidden", "true");


        // Đặt phần tử tại vị trí nguồn
        ghost.style.left =
            `${source.x - panelRect.left
            - panel.clientLeft
            + panel.scrollLeft}px`;

        ghost.style.top =
            `${source.y - panelRect.top
            - panel.clientTop
            + panel.scrollTop}px`;


        // Kích thước ban đầu của phần tử
        ghost.style.width =
            `${source.width}px`;

        ghost.style.height =
            `${source.height}px`;

        ghost.style.transform =
            "translate(-50%, -50%)";


        // Tạm thời ẩn giá trị tại ô giữ key
        // nhưng vẫn giữ nguyên kích thước
        this.keyValue.classList.add(
            "key-flight-placeholder"
        );


        // Thêm phần tử di chuyển
        panel.append(ghost);


        // ---------- THỰC HIỆN ANIMATION ----------

        const animation = ghost.animate(

            [
                {
                    transform:
                        "translate(0px, 0px) translate(-50%, -50%)",

                    width: `${source.width}px`,

                    height: `${source.height}px`,

                    opacity: 1
                },

                {
                    transform:
                        `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%)`,

                    width: `${target.width}px`,

                    height: `${target.height}px`,

                    opacity: 1
                }
            ],

            {
                // Đánh dấu key trước khi di chuyển
                delay: 180,

                // Thời gian di chuyển
                duration: 520,

                easing:
                    "cubic-bezier(.22, 1, .36, 1)",

                // Giữ phần tử hiển thị trong lúc chờ
                fill: "both"
            }
        );


        // Đồng bộ tốc độ mô phỏng
        animation.playbackRate = this.speed;


        // Dùng chung bộ quản lý animation
        const flight = {

            index: frameIndex,

            ghost: ghost,

            animation: animation
        };

        this.copyFlight = flight;


        // ---------- HOÀN THÀNH ANIMATION ----------

        animation.finished.then(() => {

            // Bỏ qua nếu animation đã bị hủy
            if (this.copyFlight !== flight) {

                return;
            }

            this.copyFlight = null;


            // Xóa phần tử di chuyển
            ghost.remove();

            animation.cancel();


            // Hiển thị trạng thái chính thức
            this.renderFrame(
                frameIndex,
                false
            );

        }, () => {

            // Animation bị hủy khi tua,
            // đặt lại hoặc thay đổi thuật toán
        });

        return true;
    }

    // ==================== HỦY COMPLETION WAVE ====================

    stopCompletionWave() {

        // Hủy toàn bộ animation đang tồn tại
        for (const animation of this.completionAnimations) {

            animation.cancel();
        }

        // Xóa danh sách animation
        this.completionAnimations = [];

        // Xóa trạng thái hoàn thành
        this.completionFrame = null;
    }

    // ==================== COMPLETION WAVE ====================

    renderCompletionWave(frame, animate = true) {

        const step = frame.step;


        // ---------- KIỂM TRA TRẠNG THÁI ----------

        // Nếu chưa hoàn thành thì hủy hiệu ứng cũ
        if (step.type !== "done") {

            if (this.completionFrame !== null) {

                this.stopCompletionWave();
            }

            return;
        }


        // Không chạy lại animation ở cùng một bước
        if (this.completionFrame === frame) {

            return;
        }


        // Xóa hiệu ứng cũ
        this.stopCompletionWave();


        // Ghi nhận bước hoàn thành
        this.completionFrame = frame;


        // Không chạy animation khi tua trực tiếp
        if (!animate) {

            return;
        }


        // Tôn trọng thiết lập giảm chuyển động
        if (window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches) {

            return;
        }

        // ---------- THIẾT LẬP ANIMATION ----------

        // Thời gian giữa hai phần tử liên tiếp
        const stagger = 85;

        // Thời gian animation của mỗi phần tử
        const duration = 520;


        // Hàm tạo animation cho một phần tử
        const playWave = (element, index) => {

            if (!element ||
                typeof element.animate !== "function") {

                return;
            }


            const animation = element.animate(

                [
                    {
                        translate: "0px 0px",

                        scale: "1",

                        filter: "none"
                    },

                    {
                        translate: "0px -8px",

                        scale: "1.05",

                        filter:
                            "brightness(1.3) " +
                            "drop-shadow(0 0 10px var(--sorted))",

                        offset: 0.45
                    },

                    {
                        translate: "0px 0px",

                        scale: "1",

                        filter: "none"
                    }
                ],

                {
                    duration: duration,

                    delay: index * stagger,

                    easing:
                        "cubic-bezier(.22, 1, .36, 1)",

                    fill: "none"
                }
            );


            // Đồng bộ tốc độ mô phỏng
            animation.playbackRate = this.speed;


            // Lưu animation để có thể hủy
            this.completionAnimations.push(
                animation
            );


            // Xóa animation khỏi danh sách
            // khi đã hoàn thành
            const cleanup = () => {

                this.completionAnimations =
                    this.completionAnimations.filter(
                        item => item !== animation
                    );
            };

            animation.finished.then(
                cleanup,
                cleanup
            );
        };


        // ---------- CHẠY ANIMATION MẢNG CHÍNH ----------

        frame.slots.forEach((id, index) => {

            if (id == null) {

                return;
            }

            const bar = this.nodes[id];

            playWave(bar, index);
        });


        // ---------- CHẠY ANIMATION CÂY HEAP ----------

        if (this.algorithm === "heap" &&
            this.heapView) {

            frame.slots.forEach((id, index) => {

                if (id == null) {

                    return;
                }

                const node = this.heapView.nodes[id];

                const body = node?.querySelector(
                    ".heap-node-body"
                );

                playWave(body, index);
            });
        }
    }

    // ==================== ĐIỀU CHỈNH TỐC ĐỘ ====================

    setSpeed(speed) {

        if (!Number.isFinite(speed) || speed <= 0) {

            return;
        }

        // Lưu tốc độ hiện tại
        this.speed = speed;


        // Tốc độ chuyển động của các cột,
        // con trỏ và khung phạm vi
        this.area.style.setProperty(
            "--duration",
            `${520 / speed}ms`
        );


        // Điều chỉnh tốc độ phần tử đang sao chép
        if (this.copyFlight) {

            this.copyFlight.animation
                .updatePlaybackRate(speed);
        }

        // Đồng bộ tốc độ của cây Heap với mảng chính
        this.heapTree.style.setProperty(
            "--heap-duration",
            `${520 / speed}ms`
        );

        // Điều chỉnh tốc độ Completion Wave
        for (const animation of this.completionAnimations) {

            animation.updatePlaybackRate(speed);
        }
    }
}
