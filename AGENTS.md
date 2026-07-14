# Quy chuẩn chất lượng bắt buộc

Áp dụng cho toàn bộ repository. Các `AGENTS.md` trong thư mục con bổ sung quy tắc theo framework và phải được tuân thủ đồng thời.

## Chất lượng mã nguồn

- Viết mã rõ ràng, đơn giản, có kiểu dữ liệu chặt chẽ và tên thể hiện đúng nghiệp vụ.
- Tách UI, quy tắc nghiệp vụ, truy cập dữ liệu và tích hợp bên ngoài thành các lớp/module có trách nhiệm rõ ràng.
- Tránh lặp mã, hàm quá dài, component ôm nhiều trách nhiệm, trạng thái ẩn và magic value.
- Không thêm abstraction, dependency hoặc tối ưu vi mô nếu chưa có nhu cầu thực tế; ưu tiên thiết kế ít phụ thuộc và dễ thay đổi.
- Giữ API nhỏ, validate tại biên hệ thống, xử lý đầy đủ loading/empty/error và kiểm tra quyền ở server.
- Không để secret, dữ liệu cá nhân thật, tọa độ thật hoặc token trong source, log, fixture và ảnh chụp.

## Tối ưu

- Tối ưu theo đường chạy quan trọng: kích thước bundle, số lần render, truy vấn dữ liệu, lượng payload, tần suất GPS và mức dùng pin.
- Tránh fetch/lưu dữ liệu thừa; phân trang lịch sử và chỉ subscribe dữ liệu người dùng có quyền xem.
- Với GPS, tách vị trí mới nhất khỏi lịch sử, giới hạn tần suất ghi và xử lý mất mạng theo batch.
- Trước thay đổi ảnh hưởng hiệu năng, xác định chỉ số; sau thay đổi, đo hoặc cung cấp bằng chứng phù hợp.

## Kiểm thử và hoàn thành

- Mọi sửa đổi phải được kiểm chứng tương xứng với rủi ro.
- Luôn chạy `npm run check` trước khi báo hoàn thành đối với thay đổi source/config của web hoặc driver.
- Thêm/sửa test cho quy tắc nghiệp vụ, lỗi đã sửa và trường hợp biên liên quan.
- Thay đổi UI phải smoke-test luồng bị ảnh hưởng trong trình duyệt thật; kiểm tra desktop và mobile khi có responsive layout.
- Thay đổi driver phải typecheck và chạy thử bằng Expo/device hoặc emulator khi thay đổi phụ thuộc native, GPS, quyền hoặc background task.
- Thay đổi SQL phải được lint/thử trên database local hoặc staging khi môi trường có sẵn; nếu không thể chạy, phải nói rõ chưa được xác minh trên DB thật.
- Không báo “hoàn thành” nếu lint, typecheck, test, build hoặc smoke test liên quan đang lỗi.
- Khi công cụ không thể chạy, báo chính xác lý do và coi hạng mục chưa được xác minh đầy đủ.

## Bàn giao

- Báo kết quả theo hành vi người dùng và rủi ro, không chỉ liệt kê file.
- Liệt kê chính xác lệnh kiểm tra đã chạy và kết quả.
- Tách rõ lỗi, cảnh báo, dữ liệu mô phỏng và tích hợp chưa kết nối thật.
