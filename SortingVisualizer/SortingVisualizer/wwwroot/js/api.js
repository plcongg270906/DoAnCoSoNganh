// ==================== ĐỊA CHỈ API ====================

// Frontend và Backend chạy chung một máy chủ
const API_URL = "/api/sort";


// ==================== GỬI YÊU CẦU SẮP XẾP ====================

export async function sortArray(algorithm, values, order) {

    // Tạo đối tượng dữ liệu gửi đến Backend
    const request = {
        algorithm: algorithm,
        values: values,
        order: order
    };

    let response;

    // Gửi yêu cầu HTTP POST
    try {

        response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(request)
        });

    } catch {

        throw new Error(
            "Không thể kết nối với máy chủ. Vui lòng kiểm tra Backend."
        );
    }


    // Chuyển phản hồi thành đối tượng JavaScript
    let data = null;

    try {

        data = await response.json();

    } catch {

        throw new Error(
            `Máy chủ trả về dữ liệu không hợp lệ (HTTP ${response.status}).`
        );
    }


    // Kiểm tra lỗi HTTP
    if (!response.ok) {

        // Lỗi do Controller trả về
        if (data?.message) {
            throw new Error(data.message);
        }

        // Lỗi kiểm tra dữ liệu của ASP.NET Core
        if (data?.errors) {

            const messages = Object.values(
                data.errors
            ).flat();

            throw new Error(messages.join(" "));
        }

        throw new Error(
            `Yêu cầu thất bại (HTTP ${response.status}).`
        );
    }


    // Kiểm tra cấu trúc dữ liệu phản hồi
    if (!data ||
        !Array.isArray(data.original) ||
        !Array.isArray(data.sorted) ||
        !Array.isArray(data.steps) ||
        data.steps.length === 0 ||
        !data.statistics) {

        throw new Error(
            "Dữ liệu phản hồi từ API không đúng cấu trúc."
        );
    }


    // Trả kết quả về main.js
    return data;
}
