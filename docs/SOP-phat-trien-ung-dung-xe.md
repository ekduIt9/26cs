# SOP phát triển ứng dụng đặt chuyến và quản lý xe 16 chỗ

## 1. Mục đích

Chuẩn hóa cách tiếp nhận yêu cầu, thiết kế, phát triển, kiểm thử và phát hành ứng dụng cho khách đặt chuyến, chủ xe quản lý lịch và tài xế chia sẻ vị trí.

## 2. Phạm vi MVP

1. Khách tạo tài khoản và gửi yêu cầu đặt chuyến.
2. Chủ xe xem lịch, kiểm tra xung đột, báo giá và duyệt hoặc từ chối.
3. Tài xế xem chuyến, cập nhật trạng thái và gửi GPS.
4. Khách theo dõi xe trong cửa sổ thời gian được phép.
5. Chủ xe xem lịch sử chuyến và doanh thu cơ bản.

MVP chưa tự động xác nhận chuyến, tự động tính giá cuối cùng hoặc tự động xác nhận chuyển khoản.

## 3. Trách nhiệm

| Vai trò | Trách nhiệm |
|---|---|
| Chủ sản phẩm/chủ xe | Chốt quy tắc giá, thời gian đệm, chính sách hủy và nghiệm thu |
| Phát triển | Thiết kế, lập trình, migration, kiểm thử và tài liệu kỹ thuật |
| Kiểm thử | Kiểm tra tiêu chí, quyền truy cập, thiết bị và tình huống mất mạng |
| Tài xế thử nghiệm | Xác nhận thao tác thực tế, GPS nền, mức pin và độ rõ của lịch |

Một người có thể kiêm nhiều vai trò, nhưng mỗi bước vẫn phải có bằng chứng hoàn thành.

## 4. Quy trình tiêu chuẩn

### Bước 1 — Tiếp nhận yêu cầu

Ghi nhận người dùng, vấn đề, luồng thành công, ngoại lệ, dữ liệu, tác động và dịch vụ ngoài liên quan. Đầu ra là mô tả ngắn cùng phạm vi không làm.

### Bước 2 — Viết tiêu chí chấp nhận

Mỗi tính năng phải có tiêu chí kiểm chứng được. Ví dụ:

```text
Given xe đã có chuyến xác nhận từ 08:00 đến 12:00
When chủ xe xác nhận yêu cầu mới từ 11:30 đến 14:00
Then hệ thống từ chối xác nhận và hiển thị chuyến gây xung đột
```

Phải phủ luồng đúng, dữ liệu sai, sai quyền và gửi yêu cầu lặp.

### Bước 3 — Thiết kế thay đổi

Xác định bảng/collection và migration; API, mã lỗi và phân quyền; màn hình và trạng thái lỗi; thông báo, nhật ký; chỉ số, dữ liệu nhạy cảm và thời hạn lưu giữ. Đầu ra phải đủ để người khác triển khai mà không đoán quy tắc cốt lõi.

### Bước 4 — Thực hiện theo lát cắt hoàn chỉnh

1. Migration và mô hình dữ liệu.
2. Quy tắc nghiệp vụ và kiểm thử đơn vị.
3. API cùng kiểm tra quyền.
4. Giao diện và trạng thái lỗi.
5. Thông báo/tích hợp ngoài qua adapter.
6. Kiểm thử tích hợp hoặc end-to-end cho luồng chính.

Không đưa bí mật vào repo. Dùng biến môi trường và cung cấp tên biến cần cấu hình.

### Bước 5 — Kiểm thử

Chạy format/lint, kiểm tra kiểu, unit test cho trạng thái/quyền/xung đột lịch, integration test cho đặt chuyến, kiểm thử giao diện điện thoại và GPS nền/mất mạng/vị trí cũ.

Lỗi chặn phát hành: lộ vị trí, vượt quyền, xác nhận trùng lịch, sai giá đã chốt, mất lịch sử thanh toán hoặc không thể kết thúc chuyến.

### Bước 6 — Nghiệm thu

1. Tạo hai yêu cầu có thời gian giao nhau.
2. Báo giá, khách chấp nhận và chủ xe xác nhận một yêu cầu.
3. Xác minh yêu cầu còn lại bị cảnh báo xung đột.
4. Đăng nhập tài xế, đi qua các trạng thái và gửi vị trí.
5. Đúng khách xem được vị trí; khách khác bị từ chối.
6. Hoàn thành chuyến và kiểm tra lịch sử/doanh thu.

Đầu ra là biên bản đạt, không đạt hoặc đạt có điều kiện.

### Bước 7 — Phát hành

- Sao lưu dữ liệu và xác nhận cách hoàn tác migration.
- Kiểm tra biến môi trường, HTTPS, khóa bản đồ và giới hạn chi phí.
- Chạy migration một lần và health check.
- Tạo tài khoản chủ xe/tài xế bằng quy trình an toàn.
- Ghi phiên bản, thời điểm và người phê duyệt.

Phát hành thử cho nhóm nhỏ trước khi cung cấp rộng rãi.

### Bước 8 — Theo dõi sau phát hành

Trong 24 giờ đầu, theo dõi tỷ lệ đặt/xác nhận, lỗi API/quyền, xung đột lịch, tuổi vị trí mới nhất, GPS mất cập nhật, thông báo thất bại và phản hồi người dùng.

Nếu có lỗi nghiêm trọng, ngừng tính năng liên quan, bảo toàn dữ liệu, khôi phục phiên bản an toàn rồi phân tích nguyên nhân và bổ sung kiểm thử.

## 5. Definition of Done

- Tiêu chí chấp nhận đạt và có bằng chứng kiểm thử.
- Quyền được kiểm tra ở máy chủ.
- Build, lint, typecheck và test liên quan đều đạt.
- Không có bí mật hoặc dữ liệu cá nhân thật trong mã nguồn/log thử nghiệm.
- Migration có cách áp dụng và hoàn tác hoặc phương án khôi phục.
- Giao diện có trạng thái tải, rỗng và lỗi phù hợp.
- Tài liệu/quy tắc nghiệp vụ được cập nhật nếu hành vi thay đổi.
- Chủ xe nghiệm thu thay đổi ảnh hưởng vận hành hoặc giá.

## 6. Xử lý sự cố

- **P0:** lộ dữ liệu/vị trí, mất dữ liệu diện rộng, hệ thống không dùng được.
- **P1:** xác nhận trùng lịch, sai thanh toán/giá, tài xế không thực hiện được chuyến.
- **P2:** lỗi có cách xử lý tạm, thông báo trễ, GPS chập chờn.
- **P3:** lỗi hiển thị hoặc cải tiến nhỏ.

Với P0/P1: dừng phát hành, bảo toàn log không chứa bí mật, thông báo chủ xe, khôi phục dịch vụ, sau đó phân tích nguyên nhân và thêm kiểm thử phòng ngừa.

## 7. Hồ sơ cần lưu

Lưu yêu cầu và tiêu chí chấp nhận, quyết định nghiệp vụ, kết quả test/build, biên bản nghiệm thu, lịch sử migration/phát hành và bản ghi sự cố. Không lưu dữ liệu thanh toán nhạy cảm hoặc lịch sử vị trí lâu hơn nhu cầu được phê duyệt.
