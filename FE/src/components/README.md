# Dealer Staff Dashboard - Component Structure

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx          # Layout chính với Navbar và Sidebar
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── Sidebar.jsx         # Left sidebar navigation
│   └── Dashboard/
│       ├── DashboardHeader.jsx     # Header với tiêu đề và nút refresh
│       ├── SummaryCard.jsx         # Component card KPI đơn lẻ
│       ├── SummaryCards.jsx        # Grid 4 KPI cards
│       ├── ChartsSection.jsx       # Biểu đồ doanh số
│       ├── DataTable.jsx           # Component bảng dữ liệu
│       ├── DataTablesSection.jsx   # Bảng đơn hàng và lịch lái thử
│       ├── FeedbackCustomersSnapshot.jsx # Khách hàng và feedback
│       └── QuickActions.jsx        # Các thao tác nhanh
├── pages/
│   ├── Inventory.jsx           # Trang quản lý kho xe
│   ├── Customers.jsx           # Trang quản lý khách hàng
│   ├── Orders.jsx              # Trang quản lý đơn hàng
│   ├── Reports.jsx             # Trang báo cáo thống kê
│   └── Settings.jsx            # Trang cài đặt
└── DashBoard/
    └── DashBoard.jsx           # Trang Dashboard chính
```

## 🎨 Design System

### Màu sắc chính

- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray**: #6B7280

### Kích thước

- **Border Radius**: 8px (rounded-lg)
- **Shadow**: shadow-sm, shadow-md
- **Spacing**: 6px, 8px, 16px, 24px

## 🧩 Component Features

### Layout Components

- **Layout**: Responsive layout với sidebar và main content
- **Navbar**: Search bar, notifications, user dropdown
- **Sidebar**: Navigation menu với active state

### Dashboard Components

- **DashboardHeader**: Tiêu đề, ngày giờ, nút refresh
- **SummaryCards**: 4 KPI cards với trend indicators
- **ChartsSection**: Bar chart và Pie chart với Recharts
- **DataTablesSection**: Bảng đơn hàng và lịch lái thử
- **FeedbackCustomersSnapshot**: Khách hàng mới và feedback
- **QuickActions**: 3 nút thao tác chính

## 📱 Responsive Design

- **Mobile**: 1 column layout
- **Tablet**: 2 column layout
- **Desktop**: 3-4 column layout
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🚀 Tính năng chính

### Dashboard

- ✅ KPI cards với trend indicators
- ✅ Biểu đồ doanh số theo tháng
- ✅ Biểu đồ doanh số theo dòng xe
- ✅ Bảng đơn hàng gần đây
- ✅ Lịch lái thử sắp tới
- ✅ Khách hàng mới nhất
- ✅ Feedback mới nhất
- ✅ Quick actions

### Navigation

- ✅ Multi-page routing với React Router
- ✅ Active state cho sidebar
- ✅ User dropdown với logout
- ✅ Search functionality (UI ready)

### Data Management

- ✅ Sample data cho demo
- ✅ Format currency (VNĐ)
- ✅ Format date (vi-VN)
- ✅ Status badges với màu sắc

## 🔧 Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router": "^7.9.3",
  "tailwindcss": "^4.1.13",
  "lucide-react": "^5.5.0",
  "recharts": "^2.x.x"
}
```

## 📋 TODO - Tính năng cần bổ sung

- [ ] Kết nối API thực tế
- [ ] Real-time data updates
- [ ] Export reports (PDF/Excel)
- [ ] Advanced filtering
- [ ] Data pagination
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Dark mode
- [ ] Multi-language support

## 🎯 Hướng dẫn sử dụng

1. **Chạy ứng dụng**: `npm run dev`
2. **Đăng nhập**: Sử dụng mock authentication
3. **Navigation**: Click vào menu items trong sidebar
4. **Refresh data**: Click nút "Refresh Data" trong header
5. **View details**: Click icon mắt trong các bảng
6. **Quick actions**: Click các nút lớn ở cuối dashboard

## 🔄 State Management

Hiện tại sử dụng local state với React hooks. Có thể nâng cấp lên:

- Redux Toolkit
- Zustand
- Context API
- React Query (cho server state)

## 🎨 Customization

### Thay đổi màu sắc

Chỉnh sửa trong `tailwind.config.js` hoặc sử dụng CSS variables.

### Thêm component mới

1. Tạo file trong thư mục `components/`
2. Import và sử dụng trong `DashBoard.jsx`
3. Thêm route trong `App.jsx` nếu cần

### Thêm trang mới

1. Tạo file trong thư mục `pages/`
2. Thêm route trong `App.jsx`
3. Thêm menu item trong `Sidebar.jsx`
