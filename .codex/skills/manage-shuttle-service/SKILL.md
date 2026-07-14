---
name: manage-shuttle-service
description: Phân tích, thiết kế, triển khai và kiểm thử ứng dụng quản lý một xe dịch vụ 16 chỗ, gồm khách hàng đặt chuyến, chủ xe báo giá và duyệt lịch, tài xế thực hiện chuyến, theo dõi GPS trực tiếp, lịch sử hành trình và doanh thu. Sử dụng khi Codex lập kế hoạch MVP, viết hoặc sửa mã nguồn, thiết kế API/cơ sở dữ liệu/giao diện, kiểm tra xung đột lịch, xử lý vòng đời chuyến, quyền truy cập, vị trí nền hoặc kiểm thử các tính năng của hệ thống xe dịch vụ này.
---

# Manage Shuttle Service

## Mục tiêu

Xây từng lát cắt hoàn chỉnh của sản phẩm đặt chuyến và theo dõi một xe 16 chỗ. Ưu tiên vận hành đơn giản, dữ liệu nhất quán và quyền riêng tư vị trí.

## Bắt đầu công việc

1. Đọc `references/product-rules.md` trước khi thay đổi nghiệp vụ, dữ liệu, API hoặc giao diện.

2. Đọc `docs/SOP-phat-trien-ung-dung-xe.md` ở gốc dự án khi lập kế hoạch hoặc bàn giao một giai đoạn.

3. Kiểm tra cấu trúc repo, tài liệu, thay đổi chưa commit và cách chạy kiểm thử hiện có.

4. Chuyển yêu cầu thành một lát cắt có tiêu chí chấp nhận quan sát được.

5. Nêu rõ giả định nếu repo chưa quyết định framework, nhà cung cấp bản đồ, SMS hoặc thanh toán.

Không tự động xác nhận đặt xe trong MVP. Yêu cầu chỉ thành chuyến đã xác nhận sau khi chủ xe duyệt.

## Quy trình triển khai một tính năng

### 1. Định nghĩa

- Xác định vai trò, đầu vào, luồng thành công và trường hợp lỗi.
- Viết tiêu chí chấp nhận dạng Given/When/Then hoặc danh sách kiểm chứng được.
- Xác định thay đổi dữ liệu, API, giao diện, quyền và thông báo.
- Không mở rộng ngoài lát cắt nếu chưa cần cho tiêu chí.

### 2. Thiết kế

- Dùng thời gian có múi giờ; lưu chuẩn hóa và hiển thị theo múi giờ người dùng.
- Kiểm tra xung đột bằng khoảng thời gian có thời gian đệm cấu hình được.
- Tách yêu cầu đặt xe, chuyến đã duyệt, báo giá, thanh toán và mẫu vị trí.
- Đổi trạng thái phải kiểm tra trạng thái hiện tại và chống gửi lặp.
- Chỉ cho khách xem GPS của chuyến liên quan trong cửa sổ được phép.

### 3. Thực hiện

- Làm theo quy ước và stack sẵn có của repo.
- Thực hiện dữ liệu/API/UI cho cùng một lát cắt khi phạm vi là end-to-end.
- Xác thực ở biên hệ thống và kiểm tra quyền ở máy chủ.
- Dùng adapter hoặc dữ liệu giả cho bản đồ, SMS và thanh toán khi chưa có khóa dịch vụ.
- Không ghi khóa API, token, số điện thoại hoặc vị trí thật vào mã nguồn, log hay fixture.

### 4. Kiểm thử

- Thêm kiểm thử cho trạng thái, quyền và xung đột lịch.
- Kiểm tra luồng đúng, dữ liệu sai, gửi lặp, sai vai trò và hai yêu cầu trùng giờ.
- Với GPS, kiểm tra vị trí cũ, sai tọa độ, mất mạng, ngoài chuyến và người xem không có quyền.
- Chạy build, lint, typecheck và test phù hợp trước khi kết luận hoàn thành.

### 5. Bàn giao

- Tóm tắt theo hành vi người dùng, không chỉ liệt kê file.
- Nêu lệnh đã chạy và kết quả kiểm chứng.
- Nêu cấu hình/khóa dịch vụ còn thiếu, migration cần chạy và rủi ro chưa xử lý.
- Cập nhật SOP hoặc quy tắc tham chiếu nếu nghiệp vụ thay đổi.

## Nguyên tắc bắt buộc

- Máy chủ là nguồn sự thật cho giá, quyền, lịch và trạng thái chuyến.
- Không để hai chuyến đã xác nhận của cùng xe chồng lấn.
- Không xóa cứng dữ liệu chuyến hoặc thanh toán cần đối soát.
- Không công khai lịch sử vị trí qua đường dẫn đoán được.
- Không tuyên bố theo dõi thời gian thực nếu chỉ có dữ liệu giả; ghi rõ chế độ mô phỏng.
- Không đánh dấu hoàn thành khi chưa kiểm chứng phù hợp với mức rủi ro.

## Kết quả mong đợi

Mỗi lần dùng skill phải tạo ít nhất một kết quả: đặc tả có tiêu chí chấp nhận, thiết kế dữ liệu/API, mã nguồn đã kiểm thử, báo cáo chẩn đoán có bằng chứng, hoặc kế hoạch phát hành có điều kiện rõ ràng.
