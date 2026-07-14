# Lộ Trình

Ứng dụng MVP dành cho một xe dịch vụ 16 chỗ, gồm:

- Web khách hàng để gửi yêu cầu đặt chuyến.
- Web chủ xe để xem yêu cầu, báo giá và xác nhận lịch.
- Ứng dụng tài xế để xem chuyến và cập nhật trạng thái hành trình.
- Schema Supabase cho tài khoản, chuyến đi, lịch sử trạng thái và vị trí xe.

> Trạng thái hiện tại: web và ứng dụng tài xế vẫn dùng dữ liệu đặt chuyến demo. Web đã có bản đồ và tuyến đường thật bằng dịch vụ OpenStreetMap miễn phí, không cần API key; GPS xe, đăng nhập và đồng bộ Supabase chưa được kết nối.

## 1. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Web khách hàng/chủ xe | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Leaflet và OpenStreetMap |
| Ứng dụng tài xế | Expo SDK 54, React Native 0.81, TypeScript |
| Backend dự kiến | Supabase Auth, PostgreSQL, Realtime và RLS |
| Kiểm thử web | Vitest, ESLint, TypeScript |
| Runtime | Node.js 24 LTS |

## 2. Cấu trúc thư mục

```text
CLoneUber/
├── apps/
│   ├── web/                 # Next.js cho khách hàng và chủ xe
│   └── driver/              # Expo/React Native cho tài xế
├── docs/                    # SOP phát triển và vận hành
├── supabase/
│   └── migrations/         # Schema PostgreSQL và chính sách RLS
├── .codex/skills/           # Skill phát triển riêng của dự án
├── .env.example             # Danh sách biến môi trường
├── package.json             # Script chạy nhanh từ thư mục gốc
└── README.md
```

## 3. Yêu cầu hệ thống

Tối thiểu cần:

- Windows 10/11 và PowerShell.
- Node.js 24 LTS hoặc bản mới hơn tương thích.
- npm đi kèm Node.js.
- Điện thoại Android/iOS có Expo Go nếu muốn thử ứng dụng tài xế trên thiết bị thật.

Tùy chọn:

- Android Studio nếu muốn chạy Android Emulator.
- Tài khoản Supabase nếu muốn áp dụng schema database.
- Máy có kết nối internet để tải bản đồ OpenStreetMap và tính lộ trình.

## 4. Chuẩn bị Node.js

### Cách A — Máy đã cài Node.js

Kiểm tra trong PowerShell:

```powershell
node --version
npm --version
```

Node phải từ phiên bản 24 trở lên.

### Cách B — Dùng Node.js portable trong workspace hiện tại

Workspace phát triển hiện tại có Node.js portable tại:

```text
.tools/node-v24.18.0-win-x64
```

Thêm Node vào `PATH` của cửa sổ PowerShell hiện tại:

```powershell
$env:PATH = "$PWD\.tools\node-v24.18.0-win-x64;$env:PATH"
node --version
npm --version
```

Lệnh này chỉ có hiệu lực trong cửa sổ PowerShell đang mở. Khi mở terminal mới, cần chạy lại.

Nếu thư mục `.tools/node-v24.18.0-win-x64` không tồn tại, hãy cài Node.js 24 LTS từ trang chính thức hoặc giải nén bản portable vào đúng đường dẫn trên.

## 5. Cài dependency

Chạy tại thư mục gốc `D:\CLoneUber`:

```powershell
npm ci --prefix apps/web
npm ci --prefix apps/driver
```

Mỗi ứng dụng có `package-lock.json` riêng. `npm ci` sẽ cài đúng phiên bản đã được khóa.

Nếu đang phát triển và vừa sửa dependency trong `package.json`, có thể dùng:

```powershell
npm install --prefix apps/web
npm install --prefix apps/driver
```

Không chạy `npm audit fix --force` tùy tiện vì lệnh này có thể nâng phiên bản lớn và làm Expo hoặc Next.js mất tương thích.

## 6. Chạy web khách hàng/chủ xe

Từ thư mục gốc:

```powershell
npm run dev:web
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

Luồng demo có thể kiểm tra:

1. Giữ vai trò **Khách hàng**.
2. Nhập điểm đón, điểm đến, ngày giờ và số khách.
3. Nhấn **Gửi yêu cầu đặt xe**.
4. Chuyển sang vai trò **Chủ xe** trên thanh điều hướng.
5. Kiểm tra yêu cầu vừa tạo và nhấn **Xác nhận**.

Dữ liệu đặt chuyến demo chỉ được giữ trong bộ nhớ trình duyệt. Tải lại trang sẽ khôi phục dữ liệu mẫu ban đầu. Bản đồ và thông số lộ trình được lấy từ OpenStreetMap/Nominatim/OSRM mà không cần API key.

### Chạy web bằng cổng khác

Nếu cổng `3000` đang được sử dụng:

```powershell
npm --prefix apps/web run dev -- -p 3001
```

Sau đó mở `http://localhost:3001`.

## 7. Chạy ứng dụng tài xế

### Chạy Expo development server

Từ thư mục gốc:

```powershell
npm run start:driver
```

Expo sẽ hiển thị mã QR và các phím tắt trong terminal.

### Thử trên điện thoại thật

1. Cài **Expo Go** trên điện thoại.
2. Đảm bảo máy tính và điện thoại dùng cùng mạng Wi-Fi.
3. Chạy `npm run start:driver`.
4. Quét mã QR bằng Expo Go hoặc camera của điện thoại.
5. Chờ Metro tải JavaScript bundle.

Ứng dụng hiện cho phép nhấn nút để đi qua các trạng thái:

```text
Đã xác nhận
→ Đang đến điểm đón
→ Đã đến
→ Đang thực hiện
→ Hoàn thành
```

Trạng thái đang được lưu cục bộ và sẽ trở về ban đầu khi tải lại ứng dụng.

### Chạy Android Emulator

Sau khi Android Studio và emulator đã hoạt động:

```powershell
npm --prefix apps/driver run android
```

### Chạy Expo qua tunnel

Nếu điện thoại không kết nối được qua mạng LAN:

```powershell
npm --prefix apps/driver run start -- --tunnel
```

Chế độ tunnel cần kết nối internet và thường chậm hơn LAN.

### iOS trên Windows

Có thể thử giao diện bằng Expo Go trên iPhone. Để tạo native iOS build cục bộ cần macOS; phương án khác là dùng EAS Build sau khi cấu hình tài khoản Expo.

## 8. Biến môi trường

Sao chép file mẫu:

```powershell
Copy-Item .env.example apps/web/.env.local
Copy-Item .env.example apps/driver/.env
```

Các biến hiện có:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_OSM_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org
NEXT_PUBLIC_OSRM_URL=https://router.project-osrm.org
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Ý nghĩa:

| Biến | Nơi sử dụng |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase cho web |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase cho web |
| `NEXT_PUBLIC_OSM_TILE_URL` | Máy chủ ảnh bản đồ OpenStreetMap; có giá trị mặc định miễn phí |
| `NEXT_PUBLIC_NOMINATIM_URL` | Dịch vụ chuyển địa chỉ thành tọa độ; có giá trị mặc định miễn phí |
| `NEXT_PUBLIC_OSRM_URL` | Dịch vụ tính tuyến đường ô tô; có giá trị mặc định miễn phí |
| `EXPO_PUBLIC_SUPABASE_URL` | URL Supabase cho ứng dụng tài xế |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key Supabase cho ứng dụng tài xế |

Không đưa `service_role` key, khóa bí mật hoặc thông tin khách hàng thật vào biến có tiền tố `NEXT_PUBLIC_` hay `EXPO_PUBLIC_`, vì các biến này có thể xuất hiện trong client bundle.

Có thể để trống các biến Supabase trong giai đoạn demo. Ba biến bản đồ cũng không bắt buộc vì ứng dụng có sẵn endpoint công cộng mặc định.

### Bản đồ và lộ trình miễn phí

Ứng dụng sử dụng:

- **Leaflet** để hiển thị bản đồ tương tác.
- **OpenStreetMap** để tải lớp bản đồ.
- **Nominatim** để tìm tọa độ từ địa chỉ.
- **OSRM** để tính tuyến đường ô tô, quãng đường và thời gian dự kiến.

Nhập điểm đón và điểm đến rồi nhấn **Tính lộ trình** trên bản đồ. Nên nhập đủ số nhà, đường, phường/xã và tỉnh/thành. Ứng dụng chỉ tìm địa chỉ khi người dùng bấm nút, lưu cache kết quả trong phiên và giới hạn các yêu cầu Nominatim cách nhau ít nhất 1,1 giây.

Các endpoint công cộng không yêu cầu tài khoản hoặc API key và phù hợp cho MVP một xe với lưu lượng thấp. Chúng hoạt động theo cơ chế best-effort, không có SLA và có thể giới hạn truy cập nếu sử dụng nhiều. Khi đưa vào vận hành lớn hơn, thay các biến `NEXT_PUBLIC_OSM_TILE_URL`, `NEXT_PUBLIC_NOMINATIM_URL` và `NEXT_PUBLIC_OSRM_URL` bằng dịch vụ tự host hoặc nhà cung cấp phù hợp rồi build lại web.

## 9. Khởi tạo Supabase

Migration nằm tại:

```text
supabase/migrations/202607140001_initial_booking_schema.sql
```

Migration tạo:

- Vai trò `CUSTOMER`, `OWNER`, `DRIVER`.
- Bảng hồ sơ người dùng và xe.
- Bảng đặt chuyến, lịch sử trạng thái và vị trí xe.
- Row Level Security cho khách, chủ xe và tài xế.
- Ràng buộc PostgreSQL ngăn một xe có hai chuyến đang hoạt động bị chồng thời gian.
- Hàm server cho phép tài xế chỉ chuyển qua các trạng thái hợp lệ.

### Áp dụng bằng Supabase Dashboard

1. Tạo project tại Supabase.
2. Mở **SQL Editor**.
3. Mở file migration trong repo và sao chép toàn bộ nội dung.
4. Dán vào SQL Editor và chọn **Run**.
5. Điền Project URL và publishable key vào file môi trường.

Migration mới chỉ được chuẩn bị trong repo; web và driver chưa gọi Supabase ở lát cắt hiện tại.

## 10. Kiểm tra chất lượng

Chạy toàn bộ quality gate từ thư mục gốc:

```powershell
npm run check
```

Quality gate sẽ chạy lần lượt ESLint, TypeScript web, unit test web, TypeScript driver và production build. Không báo hoàn thành thay đổi source/config nếu lệnh này chưa đạt.

### Web

Chạy lần lượt:

```powershell
npm --prefix apps/web run lint
npm --prefix apps/web run typecheck
npm --prefix apps/web run test
npm --prefix apps/web run build
```

Kết quả mong đợi:

- ESLint không có lỗi.
- TypeScript không có lỗi.
- Vitest báo toàn bộ test đã đạt.
- Next.js production build hoàn thành và route `/` được tạo thành công.

### Ứng dụng tài xế

```powershell
npm run typecheck:driver
```

Lệnh kết thúc với exit code `0` và không in lỗi TypeScript.

## 11. Chạy production build của web

Tạo build:

```powershell
npm run build:web
```

Khởi động production server:

```powershell
npm --prefix apps/web run start
```

Mở `http://localhost:3000`.

## 12. Lỗi thường gặp

### `node` hoặc `npm` không được nhận diện

Chạy lại:

```powershell
$env:PATH = "$PWD\.tools\node-v24.18.0-win-x64;$env:PATH"
```

Sau đó kiểm tra `node --version` và `npm --version`.

### PowerShell chặn `npm.ps1`

Dùng trực tiếp `npm.cmd`:

```powershell
npm.cmd run dev:web
```

### Cổng 3000 đã được sử dụng

Chạy web trên cổng khác:

```powershell
npm --prefix apps/web run dev -- -p 3001
```

### Build báo lỗi ghi `.next/trace` hoặc `EPERM`

1. Dừng mọi tiến trình `next dev` hoặc `next start` đang chạy.
2. Đóng terminal cũ nếu tiến trình không thoát.
3. Xóa riêng cache build đã sinh:

```powershell
Remove-Item -LiteralPath apps/web/.next -Recurse -Force
```

4. Chạy lại `npm run build:web`.

Không xóa mã nguồn trong `apps/web/src`.

### Expo Go không kết nối được

- Xác nhận điện thoại và máy tính cùng Wi-Fi.
- Cho phép Node.js qua Windows Firewall trên mạng riêng.
- Tắt VPN tạm thời nếu VPN chặn thiết bị trong LAN.
- Thử chế độ tunnel.

### Cảnh báo `npm audit`

Cảnh báo dependency không đồng nghĩa ứng dụng không chạy. Kiểm tra gói bị ảnh hưởng trước khi nâng cấp; tránh `npm audit fix --force` nếu chưa chạy lại toàn bộ build/test.

## 13. Các phần chưa kết nối thật

- Supabase Auth và phân quyền đăng nhập.
- Ghi/đọc yêu cầu đặt chuyến từ PostgreSQL.
- Supabase Realtime cho vị trí mới nhất.
- Expo background location.
- Dịch vụ geocoding/routing tự host hoặc có SLA khi số lượng xe và khách tăng.
- Thông báo đẩy, SMS hoặc Zalo.
- Thanh toán và xác nhận chuyển khoản.

Các phần mô phỏng đều được ghi rõ trong giao diện để tránh nhầm với dữ liệu vận hành thật.
# 26cs
