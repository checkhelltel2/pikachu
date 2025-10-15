# 🎮 Game Pikachu - Trò Chơi Ghép Hình

Game Pikachu (Pikachu Puzzle Game) - trò chơi ghép các cặp hình giống nhau theo phong cách cổ điển với nhiều tính năng hiện đại.

## 🎯 Tính Năng

- ✨ **Giao diện đẹp mắt**: Thiết kế hiện đại với hiệu ứng gradient và animation mượt mà
- 🎮 **Gameplay kinh điển**: Ghép các cặp emoji giống nhau theo quy tắc đường nối Pikachu
- ⏱️ **Đếm ngược thời gian**: 180 giây cho mỗi màn chơi, tạo cảm giác kịch tính
- 📈 **Cấp độ khó tăng dần**: Lưới game tăng kích thước theo từng cấp độ
- 💎 **Hệ thống điểm số**: Tính điểm dựa trên cấp độ hiện tại
- 🎁 **Powerups hữu ích**:
  - 💡 **Gợi ý** (3 lần): Tìm và highlight một cặp có thể ghép
  - 🔄 **Xáo trộn** (2 lần): Xáo trộn lại các ô chưa ghép
  - ⏱️ **Thêm thời gian** (2 lần): Cộng thêm 30 giây
- 💾 **Lưu điểm cao**: Lưu điểm cao nhất vào localStorage
- ⏸️ **Tạm dừng**: Có thể tạm dừng game bất cứ lúc nào
- 📱 **Responsive**: Chơi được trên mọi thiết bị

## 🎲 Cách Chơi

1. Mở file `index.html` trong trình duyệt web
2. Click vào hai ô có hình giống nhau để ghép
3. Hai ô chỉ được ghép khi có thể nối bằng đường thẳng với tối đa 3 lần gấp khúc
4. Ghép hết tất cả các cặp để qua màn mới
5. Sử dụng powerups khi cần thiết
6. Cố gắng đạt điểm cao nhất!

## 🎨 Các Bộ Emoji

- **Cấp 1**: Động vật dễ thương 🐭🐹🐰🦊🐻
- **Cấp 2**: Trái cây tươi ngon 🍎🍊🍋🍌🍉
- **Cấp 3**: Thể thao ⚽🏀🏈⚾🎾
- **Cấp 4**: Phương tiện 🚗🚕🚙🚌🚎
- **Cấp 5+**: Hoa và cây cỏ 🌸🌺🌻🌷🌹

## 🚀 Chạy Game

### Cách 1: Mở trực tiếp file HTML
```bash
# Mở file index.html bằng trình duyệt
open index.html  # trên macOS
start index.html # trên Windows
xdg-open index.html # trên Linux
```

### Cách 2: Sử dụng web server đơn giản
```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (cần cài http-server)
npx http-server -p 8080
```

Sau đó truy cập: `http://localhost:8080`

## 📝 Cấu Trúc Dự Án

```
pikachu/
├── index.html      # Cấu trúc HTML của game
├── style.css       # Styling và animations
├── game.js         # Logic game chính
└── README.md       # Tài liệu này
```

## 🎯 Quy Tắc Ghép Nối

Hai ô có thể ghép với nhau khi:
1. Có cùng hình emoji
2. Có thể nối bằng đường thẳng không đi qua ô khác
3. Đường nối có thể gấp khúc tối đa 2 lần (tạo thành 3 đoạn thẳng)

## 🏆 Hệ Thống Điểm

- Mỗi cặp ghép thành công: **10 × Cấp độ** điểm
- Hoàn thành cấp độ: Thưởng +30 giây và tăng độ khó
- Điểm cao được lưu tự động

## 🎨 Screenshots

![Game Pikachu](https://github.com/user-attachments/assets/b6e17438-b143-4677-a3ff-090baa2cd2ba)
*Giao diện game với các emoji động vật*

![Chế độ tạm dừng](https://github.com/user-attachments/assets/c1d8ca7d-5d0e-462c-a3e1-85b38c14c157)
*Chế độ tạm dừng game*

## 🛠️ Công Nghệ

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- LocalStorage API

## 📱 Tương Thích

- ✅ Chrome/Edge (khuyến nghị)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers

## 👨‍💻 Tác Giả

**Đạt** - Game PIKACHU

## 📄 License

Dự án này được phát hành dưới giấy phép MIT - xem chi tiết tại file LICENSE

---

**Chúc bạn chơi game vui vẻ! 🎮✨**
