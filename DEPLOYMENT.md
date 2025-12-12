# Hướng dẫn Deploy Production

## 🚀 Deploy Backend lên Render

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Add backend API"
git push origin main
```

### Bước 2: Tạo Web Service trên Render

1. Vào [render.com](https://render.com) → **Sign up/Login**
2. Click **New** → **Web Service**
3. Connect GitHub repository của bạn
4. Chọn repository: `quản-lý-hồ-sơ-học-viên`

### Bước 3: Cấu hình

**Build Settings:**

- **Name**: `student-profile-api` (tên bạn muốn)
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### Bước 4: Environment Variables (QUAN TRỌNG!)

Thêm các biến môi trường sau:

**Required:**

```
GEMINI_API_KEY=AIzaSyDFD3QGa5zPXtkw2FUCRCqzNPTfPbz7ySw
FRONTEND_URL=https://your-frontend-domain.com
```

**Giải thích FRONTEND_URL:**

- Nếu frontend deploy trên **Hosting Inet**: `https://hocvien.inet.vn`
- Nếu frontend deploy trên **Netlify**: `https://yourapp.netlify.app`
- Nếu frontend deploy trên **Vercel**: `https://yourapp.vercel.app`
- Nếu có **custom domain**: `https://yourdomain.com`

**Optional (Zalo integration):**

```
ZALO_OA_ID=your_zalo_oa_id
ZALO_ACCESS_TOKEN=your_zalo_access_token
ZALO_ADMIN_ID=your_zalo_admin_id
```

### Bước 5: Deploy

Click **Create Web Service** → Render sẽ tự động build và deploy

### Bước 6: Copy Backend URL

Sau khi deploy xong, Render sẽ cho bạn URL:

```
https://student-profile-api-xxxx.onrender.com
```

**Copy URL này!** Bạn cần nó cho frontend.

---

## 🌐 Deploy Frontend lên Hosting Inet

### Bước 1: Cập nhật Backend URL

Tạo file `.env.production` trong root project:

```env
VITE_API_URL=https://student-profile-api-xxxx.onrender.com
```

### Bước 2: Build Frontend

```bash
npm run build
```

Folder `dist/` sẽ được tạo ra.

### Bước 3: Upload lên Hosting Inet

1. Đăng nhập vào hosting inet panel
2. Vào **File Manager**
3. Upload toàn bộ nội dung trong folder `dist/` lên thư mục `public_html/`
4. Đảm bảo file `index.html` ở đúng vị trí

### Bước 4: Cập nhật FRONTEND_URL trên Render

1. Quay lại Render dashboard
2. Vào service backend đã tạo
3. Vào **Environment** tab
4. Sửa `FRONTEND_URL` thành domain thật của bạn:
   ```
   FRONTEND_URL=https://your-actual-domain.com
   ```
5. Save → Service sẽ tự động restart

---

## ✅ Kiểm tra

1. Truy cập frontend: `https://your-domain.com`
2. Test upload ảnh → xem có extract data không
3. Check backend logs trên Render dashboard
4. Test tạo hồ sơ → xem có lưu vào database không

---

## 🔧 Troubleshooting

### CORS Error

❌ Lỗi: `Access-Control-Allow-Origin`

**Nguyên nhân:** `FRONTEND_URL` không khớp với domain frontend

**Cách sửa:**

1. Check domain frontend chính xác (có/không có `www`, `https`)
2. Sửa `FRONTEND_URL` trên Render dashboard
3. Restart service

### Backend Sleep (Render Free Tier)

⚠️ **Render free tier ngủ sau 15 phút không hoạt động**

**Triệu chứng:** Request đầu tiên sau lâu bị chậm (~30s)

**Giải pháp:**

- Chấp nhận (miễn phí mà)
- Hoặc upgrade paid plan ($7/tháng)
- Hoặc dùng cron job để ping server 10-15 phút/lần

### Database Persistence

✅ **SQLite database trên Render:**

- Miễn phí: Ephemeral disk (mất data khi restart)
- Nên dùng: Render PostgreSQL (free tier available)

**Nếu cần persistent storage:**

1. Render Dashboard → **New PostgreSQL**
2. Connect database URL
3. Migrate từ SQLite sang PostgreSQL

---

## 📱 Zalo Integration (Optional)

Để bật thông báo Zalo thật:

1. Đăng ký Zalo OA tại [oa.zalo.me](https://oa.zalo.me)
2. Lấy credentials:
   - OA ID
   - Access Token
3. Thêm vào Environment Variables trên Render
4. Restart service

Nếu không config Zalo, backend vẫn chạy bình thường (chỉ log thôi).

---

## 💡 Tips

- **Test local trước khi deploy:** Chạy backend + frontend local, đảm bảo mọi thứ hoạt động
- **Backup database:** Download file `database.db` từ Render thường xuyên
- **Monitor logs:** Check Render logs để debug issues
- **HTTPS only:** Frontend và backend đều phải dùng HTTPS ở production
