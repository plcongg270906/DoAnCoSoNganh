// ==================== CÁC HẰNG SỐ ====================

// Giới hạn số lượng phần tử, phải khớp với Backend
export const MAX_ARRAY_SIZE = 10;

// Giới hạn của kiểu int trong C#
export const MIN_INT = -2147483648;
export const MAX_INT = 2147483647;


// ==================== KIỂM TRA SỐ NGUYÊN ====================

export function parseInteger(value, label = "Giá trị") {

    const text = String(value).trim();

    // Chỉ chấp nhận chuỗi biểu diễn số nguyên
    if (!/^[+-]?\d+$/.test(text)) {
        throw new Error(`${label} phải là số nguyên.`);
    }

    const number = Number(text);

    // Kiểm tra giới hạn kiểu int của C#
    if (!Number.isInteger(number) ||
        number < MIN_INT ||
        number > MAX_INT) {

        throw new Error(
            `${label} vượt quá giới hạn số nguyên Int32.`
        );
    }

    return number;
}


// ==================== KIỂM TRA SỐ LƯỢNG ====================

export function validateArraySize(value) {

    const size = parseInteger(
        value,
        "Số lượng phần tử"
    );

    if (size < 1 || size > MAX_ARRAY_SIZE) {

        throw new Error(
            `Số lượng phần tử phải từ 1 đến ${MAX_ARRAY_SIZE}.`
        );
    }

    return size;
}


// ==================== CHUYỂN CHUỖI THÀNH MẢNG ====================

export function parseArray(text) {

    // Loại bỏ khoảng trắng ở đầu và cuối
    text = text.trim();

    // Kiểm tra dữ liệu rỗng
    if (text === "") {
        throw new Error("Vui lòng nhập mảng số nguyên.");
    }

    // Tách chuỗi theo dấu phẩy
    const parts = text.split(",");

    // Kiểm tra số lượng phần tử
    validateArraySize(parts.length);

    // Chuyển từng phần tử thành số nguyên
    const values = parts.map((part, index) => {

        return parseInteger(
            part,
            `Phần tử thứ ${index + 1}`
        );
    });

    return values;
}


// ==================== TẠO MẢNG NGẪU NHIÊN ====================

export function generateRandomArray(size, min, max) {

    // Kiểm tra các tham số
    size = validateArraySize(size);

    min = parseInteger(
        min,
        "Giá trị nhỏ nhất"
    );

    max = parseInteger(
        max,
        "Giá trị lớn nhất"
    );

    // Kiểm tra khoảng giá trị
    if (min > max) {

        throw new Error(
            "Giá trị nhỏ nhất không được lớn hơn giá trị lớn nhất."
        );
    }

    const values = [];

    for (let i = 0; i < size; i++) {

        // Tạo số nguyên ngẫu nhiên từ min đến max
        const randomValue =
            Math.floor(Math.random() * (max - min + 1)) + min;

        values.push(randomValue);
    }

    return values;
}


// ==================== ĐỊNH DẠNG MẢNG ====================

export function formatArray(values) {

    return values.join(", ");
}
