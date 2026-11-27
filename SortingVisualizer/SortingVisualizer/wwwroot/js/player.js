// ==================== BỘ ĐIỀU KHIỂN MÔ PHỎNG ====================

export class Player {

    constructor(onChange) {

        // Hàm được gọi khi trạng thái mô phỏng thay đổi
        this.onChange = onChange;

        // Tốc độ mặc định
        this.speed = 1;

        // Thời gian giữa hai bước ở tốc độ 1x
        this.baseDelay = 900;

        // Bộ hẹn giờ
        this.timer = null;

        // Tổng số bước mô phỏng
        this.total = 0;

        // Vị trí bước hiện tại
        this.index = 0;

        // Trạng thái mô phỏng
        this.state = "ready";
    }


    // ==================== XÓA DỮ LIỆU CŨ ====================

    clear() {

        this.stopTimer();

        this.total = 0;

        this.index = 0;

        this.state = "ready";
    }


    // ==================== NẠP DỮ LIỆU ====================

    load(total) {

        // Dừng mô phỏng cũ nếu đang chạy
        this.clear();

        // Lưu tổng số bước
        this.total =
            Number.isInteger(total) && total > 0
                ? total
                : 0;

        // Hiển thị trạng thái ban đầu
        this.emit(false);
    }


    // ==================== THÔNG BÁO THAY ĐỔI ====================

    emit(animate = true) {

        this.onChange(
            this.index,
            animate,
            this.state
        );
    }


    // ==================== DỪNG BỘ HẸN GIỜ ====================

    stopTimer() {

        if (this.timer !== null) {

            clearTimeout(this.timer);

            this.timer = null;
        }
    }


    // ==================== LẬP LỊCH BƯỚC TIẾP THEO ====================

    schedule() {

        // Đảm bảo chỉ có một bộ hẹn giờ hoạt động
        this.stopTimer();

        if (this.state !== "playing") {

            return;
        }


        // Tự động chuyển sang bước tiếp theo
        this.timer = setTimeout(() => {

            this.timer = null;

            // Kiểm tra trạng thái trước khi chạy
            if (this.state !== "playing") {

                return;
            }

            this.index++;


            // Kiểm tra đã đến bước cuối chưa
            if (this.index >= this.total) {

                this.index = this.total;

                this.state = "done";
            }


            // Cập nhật giao diện
            this.emit(true);


            // Tiếp tục nếu chưa hoàn thành
            if (this.state === "playing") {

                this.schedule();
            }

        }, this.baseDelay / this.speed);
    }


    // ==================== BẮT ĐẦU / TIẾP TỤC ====================

    play() {

        // Không chạy nếu chưa có dữ liệu
        // hoặc đang chạy
        if (this.total === 0 ||
            this.state === "playing") {

            return;
        }


        // Nếu đã hoàn thành thì chạy lại từ đầu
        const restart = this.index === this.total;

        if (restart) {

            this.index = 0;
        }


        // Chuyển sang trạng thái đang chạy
        this.state = "playing";

        // Không tạo animation khi chạy lại từ đầu
        this.emit(!restart);

        // Bắt đầu bộ hẹn giờ
        this.schedule();
    }


    // ==================== TẠM DỪNG ====================

    pause() {

        // Chỉ tạm dừng khi đang chạy
        if (this.state !== "playing") {

            return;
        }

        // Hủy bước tiếp theo
        this.stopTimer();

        // Giữ nguyên vị trí hiện tại
        this.state = "paused";

        // Cập nhật giao diện
        this.emit(true);
    }


    // ==================== DI CHUYỂN ĐẾN BƯỚC BẤT KỲ ====================

    seek(index, animate = false) {

        if (this.total === 0 ||
            !Number.isFinite(index)) {

            return;
        }

        // Dừng tự động khi người dùng tua
        this.stopTimer();


        // Giới hạn bước trong khoảng hợp lệ
        this.index = Math.max(
            0,
            Math.min(
                Math.trunc(index),
                this.total
            )
        );


        // Cập nhật trạng thái
        if (this.index === this.total) {

            this.state = "done";

        } else if (this.index === 0) {

            this.state = "ready";

        } else {

            this.state = "paused";
        }


        // Hiển thị bước được chọn
        this.emit(animate);
    }


    // ==================== BƯỚC TIẾP ====================

    next() {

        this.seek(
            this.index + 1,
            true
        );
    }


    // ==================== BƯỚC TRƯỚC ====================

    previous() {

        this.seek(
            this.index - 1,
            true
        );
    }


    // ==================== ĐẶT LẠI ====================

    reset() {

        // Trở về mảng ban đầu
        this.seek(0, false);
    }


    // ==================== THAY ĐỔI TỐC ĐỘ ====================

    setSpeed(speed) {

        // Kiểm tra tốc độ hợp lệ
        if (!Number.isFinite(speed) ||
            speed <= 0) {

            return;
        }

        this.speed = speed;


        // Nếu đang chạy thì lập lịch lại
        // theo tốc độ mới
        if (this.state === "playing") {

            this.schedule();
        }
    }
}
