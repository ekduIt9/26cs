# Quy tắc sản phẩm xe dịch vụ 16 chỗ

## Vai trò và quyền

| Vai trò | Quyền chính |
|---|---|
| Khách hàng | Tạo/xem yêu cầu của mình, chấp nhận báo giá, hủy theo chính sách, theo dõi xe trong chuyến |
| Chủ xe | Xem lịch, báo giá, duyệt/từ chối/hủy, phân công tài xế, xem vị trí và doanh thu |
| Tài xế | Xem chuyến được giao, cập nhật trạng thái, gửi GPS, xem thông tin khách cần thiết |

Luôn kiểm tra quyền tại máy chủ. Ẩn nút trên giao diện không phải là kiểm soát truy cập.

## Vòng đời yêu cầu và chuyến

```text
REQUESTED -> QUOTED -> CUSTOMER_ACCEPTED -> CONFIRMED
CONFIRMED -> DRIVER_EN_ROUTE -> ARRIVED -> IN_PROGRESS -> COMPLETED
REQUESTED|QUOTED|CUSTOMER_ACCEPTED|CONFIRMED -> REJECTED|CANCELLED
```

- Chủ xe tạo báo giá và xác nhận cuối cùng.
- Khách chấp nhận báo giá không đồng nghĩa xe đã được giữ nếu chủ xe chưa xác nhận.
- Mọi chuyển trạng thái phải lưu người thực hiện và thời điểm.
- Từ chối hoặc hủy phải lưu lý do.
- Sau `IN_PROGRESS`, chỉ chủ xe được hủy và phải lưu ghi chú vận hành.

## Dữ liệu đặt chuyến tối thiểu

- Khách hàng và số điện thoại liên hệ.
- Thời gian đón, điểm đón và điểm trả.
- Số hành khách từ 1 đến 16.
- Loại chuyến một chiều, khứ hồi hoặc nhiều ngày.
- Ghi chú hành lý, điểm dừng hoặc yêu cầu đặc biệt.
- Giá báo, tiền tệ, thời hạn báo giá và trạng thái thanh toán.

Không thu thập giấy tờ tùy thân nếu chưa có nhu cầu pháp lý hoặc vận hành rõ ràng.

## Xung đột lịch

- So sánh khoảng sử dụng xe từ lúc chuẩn bị/đến điểm đón tới lúc xe sẵn sàng cho chuyến sau.
- Thêm thời gian đệm cấu hình được trước và sau chuyến.
- Tối thiểu `CONFIRMED`, `DRIVER_EN_ROUTE`, `ARRIVED`, `IN_PROGRESS` phải chặn lịch.
- Kiểm tra lại trong giao dịch lúc xác nhận để tránh hai thao tác đồng thời cùng giữ xe.

## Vị trí và quyền riêng tư

- Tài xế chỉ gửi GPS khi đăng nhập và được giao chuyến đang hoạt động, trừ khi chủ xe bật rõ chế độ quản lý đội xe.
- Mẫu vị trí gồm chuyến, tài xế, tọa độ, độ chính xác, tốc độ tùy chọn, thời gian thiết bị và thời gian máy chủ nhận.
- Loại tọa độ ngoài phạm vi, độ chính xác quá kém hoặc cũ hơn mẫu gần nhất.
- Khách chỉ xem vị trí từ gần giờ đón đến khi hoàn thành hoặc hủy chuyến.
- Phải định nghĩa chính sách lưu giữ lịch sử vị trí trước khi phát hành thật.

## Giá và thanh toán

- MVP dùng báo giá thủ công của chủ xe.
- Lưu cước chuyến, thời gian chờ, phí cầu đường, phụ phí và giảm giá khi có.
- Không coi ảnh chuyển khoản là xác nhận thanh toán tự động.
- Chủ xe cập nhật `UNPAID`, `DEPOSITED`, `PAID`, `REFUNDED` và lưu lịch sử thay đổi.

## Điều kiện nghiệm thu MVP

- Khách tạo được yêu cầu hợp lệ và xem trạng thái.
- Chủ xe nhận biết trùng lịch trước khi xác nhận.
- Chủ xe báo giá và xác nhận/từ chối được.
- Tài xế xem chuyến và đi qua đúng vòng đời trạng thái.
- Người có quyền xem được vị trí mới nhất; người khác bị từ chối.
- Hành động quan trọng có thể đối chiếu.
- Build, kiểm tra kiểu, lint và test cốt lõi đều đạt.
