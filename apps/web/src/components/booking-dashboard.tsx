"use client";

import { FormEvent, useMemo, useState } from "react";

type Role = "customer" | "owner";
type RequestStatus = "Chờ báo giá" | "Đã xác nhận";

type BookingRequest = {
  id: string;
  customer: string;
  route: string;
  schedule: string;
  passengers: number;
  status: RequestStatus;
};

const initialRequests: BookingRequest[] = [
  {
    id: "BK-2407",
    customer: "Minh Anh",
    route: "Quận 1 → Vũng Tàu",
    schedule: "18/07 · 06:30",
    passengers: 12,
    status: "Chờ báo giá",
  },
  {
    id: "BK-2406",
    customer: "Tuấn Phạm",
    route: "Thủ Đức → Sân bay Tân Sơn Nhất",
    schedule: "19/07 · 04:45",
    passengers: 6,
    status: "Chờ báo giá",
  },
];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    pin: <><path d="M12 21s6-5.2 6-12a6 6 0 1 0-12 0c0 6.8 6 12 6 12Z"/><circle cx="12" cy="9" r="2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    bus: <><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 10h16M8 18v3M16 18v3M8 14h.01M16 14h.01"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    route: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h5a3 3 0 0 1 0 6h-2a3 3 0 0 0 0 6h5"/></>,
    money: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 9v6M18 9v6"/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export function BookingDashboard() {
  const [role, setRole] = useState<Role>("customer");
  const [requests, setRequests] = useState(initialRequests);
  const [notice, setNotice] = useState("");
  const [from, setFrom] = useState("Quận 3, TP. Hồ Chí Minh");
  const [to, setTo] = useState("Hồ Tràm, Bà Rịa - Vũng Tàu");
  const [passengers, setPassengers] = useState(8);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "Chờ báo giá").length,
    [requests],
  );

  function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newRequest: BookingRequest = {
      id: `BK-${2410 + requests.length}`,
      customer: "Nguyễn An",
      route: `${from.split(",")[0]} → ${to.split(",")[0]}`,
      schedule: "20/07 · 07:00",
      passengers,
      status: "Chờ báo giá",
    };
    setRequests((current) => [newRequest, ...current]);
    setNotice("Đã gửi yêu cầu. Chủ xe sẽ báo giá và xác nhận lịch sớm nhất.");
  }

  function confirmRequest(id: string) {
    setRequests((current) => current.map((item) => item.id === id ? { ...item, status: "Đã xác nhận" } : item));
    setNotice(`Đã xác nhận ${id}. Lịch xe đã được giữ cho chuyến này.`);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Lộ Trình - Trang chủ">
          <span className="brand-mark"><Icon name="route" size={23}/></span>
          <span>Lộ Trình</span>
        </a>
        <nav className="role-switch" aria-label="Chọn vai trò">
          <button className={role === "customer" ? "active" : ""} onClick={() => setRole("customer")}>Khách hàng</button>
          <button className={role === "owner" ? "active" : ""} onClick={() => setRole("owner")}>Chủ xe</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Thông báo"><Icon name="bell"/></button>
          <div className="avatar">NA</div>
          <div className="profile-copy"><strong>Nguyễn An</strong><span>{role === "customer" ? "Khách hàng" : "Chủ xe"}</span></div>
        </div>
      </header>

      <main id="top" className="page-wrap">
        {notice && (
          <div className="notice" role="status">
            <span><Icon name="check" size={18}/></span>{notice}
            <button onClick={() => setNotice("")} aria-label="Đóng thông báo">×</button>
          </div>
        )}

        {role === "customer" ? (
          <CustomerView from={from} to={to} passengers={passengers} setFrom={setFrom} setTo={setTo} setPassengers={setPassengers} onSubmit={submitBooking}/>
        ) : (
          <OwnerView requests={requests} pendingCount={pendingCount} onConfirm={confirmRequest}/>
        )}
      </main>
    </div>
  );
}

type CustomerProps = {
  from: string;
  to: string;
  passengers: number;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  setPassengers: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function CustomerView({ from, to, passengers, setFrom, setTo, setPassengers, onSubmit }: CustomerProps) {
  return (
    <>
      <section className="welcome-row">
        <div><p className="eyebrow">CHÀO BUỔI SÁNG, NGUYỄN AN</p><h1>Mình sẽ đi đâu hôm nay?</h1><p>Đặt xe 16 chỗ riêng, nhận báo giá trực tiếp từ chủ xe.</p></div>
        <div className="vehicle-chip"><span><Icon name="bus"/></span><div><strong>Ford Transit 16 chỗ</strong><small>Sẵn sàng nhận chuyến</small></div><i/></div>
      </section>

      <section className="booking-grid">
        <form className="booking-card" onSubmit={onSubmit}>
          <div className="card-heading"><div><span className="step-number">01</span><h2>Thông tin chuyến đi</h2></div><span className="soft-badge">Báo giá thủ công</span></div>
          <div className="route-inputs">
            <div className="route-track"><span/><i/><b/></div>
            <label><span>ĐIỂM ĐÓN</span><div className="input-wrap"><Icon name="pin" size={18}/><input value={from} onChange={(e) => setFrom(e.target.value)} required/></div></label>
            <label><span>ĐIỂM ĐẾN</span><div className="input-wrap destination"><Icon name="pin" size={18}/><input value={to} onChange={(e) => setTo(e.target.value)} required/></div></label>
          </div>
          <div className="details-grid">
            <label><span>NGÀY ĐÓN</span><div className="input-wrap"><Icon name="calendar" size={18}/><input type="date" defaultValue="2026-07-20" required/></div></label>
            <label><span>GIỜ ĐÓN</span><div className="input-wrap"><Icon name="clock" size={18}/><input type="time" defaultValue="07:00" required/></div></label>
            <label><span>SỐ KHÁCH</span><div className="input-wrap"><Icon name="users" size={18}/><select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>{Array.from({ length: 16 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} người</option>)}</select></div></label>
          </div>
          <label className="trip-type"><input type="checkbox"/><span>Đây là chuyến khứ hồi</span><small>Thêm ngày và giờ quay về sau</small></label>
          <button className="primary-button" type="submit"><span>Gửi yêu cầu đặt xe</span><Icon name="arrow"/></button>
          <p className="form-note">Chưa phát sinh thanh toán. Chủ xe sẽ kiểm tra lịch và gửi báo giá.</p>
        </form>

        <aside className="map-card" aria-label="Bản đồ tuyến đường mô phỏng">
          <div className="map-label">BẢN ĐỒ MÔ PHỎNG</div>
          <div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/>
          <div className="route-line"><span className="route-start"/><span className="route-end"><Icon name="pin" size={16}/></span></div>
          <div className="place-label start-label">Quận 3<small>Điểm đón</small></div>
          <div className="place-label end-label">Hồ Tràm<small>Điểm đến</small></div>
          <div className="distance-card"><div><span><Icon name="route"/></span><div><small>QUÃNG ĐƯỜNG DỰ KIẾN</small><strong>112 km</strong></div></div><div><small>THỜI GIAN</small><strong>2 giờ 25 phút</strong></div></div>
        </aside>
      </section>

      <section className="upcoming-section">
        <div className="section-title"><div><p className="eyebrow">LỊCH TRÌNH</p><h2>Chuyến sắp tới</h2></div><button>Xem tất cả <Icon name="arrow" size={16}/></button></div>
        <article className="upcoming-card">
          <div className="date-block"><strong>18</strong><span>THÁNG 7</span></div>
          <div className="upcoming-route"><span className="confirmed-badge"><Icon name="check" size={13}/> ĐÃ XÁC NHẬN</span><h3>TP. Hồ Chí Minh <Icon name="arrow" size={18}/> Vũng Tàu</h3><p>06:30 · 12 hành khách · Mã chuyến BK-2401</p></div>
          <div className="driver-block"><div className="driver-avatar">HL</div><div><small>TÀI XẾ</small><strong>Hoàng Long</strong><span>51B-123.45</span></div></div>
          <button className="outline-button">Chi tiết chuyến</button>
        </article>
      </section>
    </>
  );
}

function OwnerView({ requests, pendingCount, onConfirm }: { requests: BookingRequest[]; pendingCount: number; onConfirm: (id: string) => void }) {
  return (
    <>
      <section className="welcome-row owner-welcome"><div><p className="eyebrow">TRUNG TÂM ĐIỀU HÀNH</p><h1>Chào buổi sáng, anh Long</h1><p>Hôm nay xe đang rảnh. Có {pendingCount} yêu cầu đang chờ xử lý.</p></div><button className="primary-button compact"><Icon name="calendar"/><span>Mở lịch xe</span></button></section>
      <section className="stats-grid">
        <div className="stat-card"><span className="stat-icon green"><Icon name="route"/></span><div><small>CHUYẾN THÁNG NÀY</small><strong>18</strong><p>+4 so với tháng trước</p></div></div>
        <div className="stat-card"><span className="stat-icon amber"><Icon name="clock"/></span><div><small>CHỜ XỬ LÝ</small><strong>{pendingCount}</strong><p>Cần báo giá trong hôm nay</p></div></div>
        <div className="stat-card"><span className="stat-icon blue"><Icon name="money"/></span><div><small>DOANH THU DỰ KIẾN</small><strong>24,8 tr</strong><p>8 chuyến đã xác nhận</p></div></div>
      </section>
      <section className="owner-layout">
        <div className="requests-panel">
          <div className="section-title"><div><p className="eyebrow">YÊU CẦU MỚI</p><h2>Cần báo giá và xác nhận</h2></div><span className="count-badge">{pendingCount}</span></div>
          <div className="request-list">
            {requests.map((request) => (
              <article className="request-row" key={request.id}>
                <div className="request-avatar">{request.customer.split(" ").map((part) => part[0]).slice(-2).join("")}</div>
                <div className="request-main"><div><strong>{request.customer}</strong><span>{request.id}</span></div><h3>{request.route}</h3><p><Icon name="calendar" size={15}/>{request.schedule}<Icon name="users" size={15}/>{request.passengers} khách</p></div>
                <span className={request.status === "Đã xác nhận" ? "status confirmed" : "status pending"}>{request.status}</span>
                {request.status === "Chờ báo giá" ? <button className="small-action" onClick={() => onConfirm(request.id)}>Xác nhận</button> : <button className="small-action ghost">Chi tiết</button>}
              </article>
            ))}
          </div>
        </div>
        <aside className="today-card"><div className="today-head"><span><Icon name="bus"/></span><div><small>TRẠNG THÁI XE</small><strong>Sẵn sàng</strong></div><i/></div><div className="mini-map"><div className="mini-road"/><span className="vehicle-dot"><Icon name="bus" size={16}/></span><p>Quận Bình Thạnh<small>Cập nhật 2 phút trước · dữ liệu mô phỏng</small></p></div><div className="vehicle-meta"><div><span>BIỂN SỐ</span><strong>51B-123.45</strong></div><div><span>SỨC CHỨA</span><strong>16 chỗ</strong></div></div></aside>
      </section>
    </>
  );
}
