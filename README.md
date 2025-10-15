# ⚡ Game Pikachu - Pikachu Kawaii ⚡

Game ghép cặp Pikachu (Pikachu Connect) đầy đủ tính năng với giao diện đẹp mắt và hiệu ứng sống động!

## 🎮 Giới thiệu

Game Pikachu là trò chơi ghép cặp hình ảnh cổ điển với các biểu tượng cảm xúc động vật dễ thương. Nhiệm vụ của bạn là tìm và ghép các cặp biểu tượng giống nhau để xóa hết tất cả các ô trên bảng trước khi hết thời gian.

## ✨ Tính năng

### 🎯 Chế độ chơi
- **Dễ (8x8)**: Bảng 8x8 ô, thời gian 5 phút - Phù hợp cho người mới chơi
- **Trung Bình (10x10)**: Bảng 10x10 ô, thời gian 7 phút - Thử thách vừa phải
- **Khó (12x12)**: Bảng 12x12 ô, thời gian 10 phút - Dành cho cao thủ

### 🎨 Giao diện & Hiệu ứng
- ✅ Giao diện gradient đẹp mắt với hiệu ứng động
- ✅ Hoạt ảnh mượt mà khi ghép cặp thành công
- ✅ Hiệu ứng hạt (particles) khi xóa ô
- ✅ Đường nối sáng giữa các cặp
- ✅ Thiết kế responsive, hoạt động tốt trên mọi thiết bị

### 🎲 Tính năng game
- ✅ **Hệ thống điểm**: Mỗi cặp ghép đúng được 100 điểm
- ✅ **Hệ thống level**: Tăng độ khó dần qua các level
- ✅ **Đồng hồ đếm ngược**: Theo dõi thời gian còn lại
- ✅ **Gợi ý (Hint)**: Hiển thị một cặp có thể ghép (3 lần)
- ✅ **Xáo trộn**: Đổi vị trí các ô còn lại
- ✅ **Tạm dừng**: Dừng game bất cứ lúc nào
- ✅ **Phần thưởng thời gian**: Thời gian còn lại được chuyển thành điểm

### ⚙️ Cài đặt
- 🔊 Bật/tắt âm thanh
- 🎵 Bật/tắt nhạc nền
- ✨ Bật/tắt hiệu ứng

### 📖 Hướng dẫn tích hợp
- ❓ Hướng dẫn cách chơi chi tiết
- 📋 Giải thích luật chơi và tính năng

## 🎯 Cách chơi

1. **Mục tiêu**: Ghép các cặp biểu tượng giống nhau để xóa hết các ô trên bảng
2. **Quy tắc**:
   - Nhấp vào hai ô có biểu tượng giống nhau để ghép cặp
   - Đường nối giữa hai ô không được vượt quá 3 đoạn thẳng
   - Đường nối không được đi qua ô khác
   - Hoàn thành trong thời gian quy định
3. **Chiến thắng**: Xóa hết tất cả các ô trên bảng
4. **Thua cuộc**: Hết thời gian trước khi xóa hết bảng

## 🚀 Cách chạy game

### Phương pháp 1: Mở trực tiếp
1. Tải repository về máy
2. Mở file `index.html` bằng trình duyệt web (Chrome, Firefox, Edge, Safari...)
3. Bắt đầu chơi!

### Phương pháp 2: Sử dụng web server
```bash
# Sử dụng Python
python -m http.server 8000

# Hoặc sử dụng Node.js
npx http-server

# Sau đó mở trình duyệt và truy cập:
# http://localhost:8000
```

## 📁 Cấu trúc dự án

```
pikachu/
├── index.html      # File HTML chính
├── style.css       # File CSS cho giao diện
├── game.js         # File JavaScript chứa logic game
├── .gitignore      # File gitignore
└── README.md       # File hướng dẫn này
```

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling với animations, gradients, backdrop-filter
- **JavaScript (Vanilla)**: Logic game, pathfinding algorithm
- **Canvas API**: Vẽ đường nối giữa các ô
- **Google Fonts**: Font chữ Quicksand đẹp mắt

## 🎨 Đặc điểm kỹ thuật

### Thuật toán tìm đường
- Sử dụng BFS (Breadth-First Search) để tìm đường nối hợp lệ
- Cho phép tối đa 3 đoạn thẳng (3 turns)
- Có thể đi ra ngoài biên bảng 1 ô

### Responsive Design
- Tự động điều chỉnh kích thước theo màn hình
- Hỗ trợ mobile, tablet và desktop
- Breakpoints: 768px, 480px

### Hiệu ứng
- CSS animations cho title, buttons, tiles
- Particle effects khi ghép cặp thành công
- Smooth transitions cho mọi tương tác

## 📱 Tương thích

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Tính năng nâng cao

- **Progressive difficulty**: Level tăng dần độ khó
- **Visual feedback**: Hiệu ứng rõ ràng cho mọi hành động
- **Modal system**: Quản lý màn hình một cách chuyên nghiệp
- **State management**: Quản lý trạng thái game hiệu quả

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo pull request hoặc báo cáo lỗi thông qua Issues.

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa cho mục đích cá nhân và thương mại.

## 👨‍💻 Tác giả

Game PIKACHU của Đạt

---

**Chúc bạn chơi game vui vẻ! 🎮⚡**