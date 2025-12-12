# Gemini Backend API

Backend server để bảo vệ Gemini API key.

## Deploy lên Render (FREE)

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Add backend API"
git push
```

### 2. Deploy trên Render

1. Vào [render.com](https://render.com) → Sign up/Login
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Cấu hình:

   - **Name**: `gemini-backend-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Environment Variables** (quan trọng!):

   ```
   GEMINI_API_KEY=your_actual_gemini_key_here
   FRONTEND_URL=https://your-frontend-domain.com
   ```

6. Click **Create Web Service**

### 3. Lấy Backend URL

Sau khi deploy xong, Render sẽ cho bạn URL dạng:

```
https://gemini-backend-api-xxxx.onrender.com
```

### 4. Cập nhật Frontend

Cập nhật file `.env.local` trong frontend:

```env
VITE_API_URL=https://gemini-backend-api-xxxx.onrender.com
```

## Deploy lên Railway (FREE - Alternative)

1. Vào [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Select repository
4. Add environment variables:
   ```
   GEMINI_API_KEY=your_key
   FRONTEND_URL=your_frontend_url
   ```
5. Railway tự động deploy

## Run Locally (Development)

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your GEMINI_API_KEY

# Run dev server
npm run dev
```

Backend sẽ chạy trên: http://localhost:3001

## Test API

```bash
# Health check
curl http://localhost:3001/health

# Test analyze endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"base64Image":"your_base64_image_here"}'
```

## Bảo mật

✅ API key chỉ tồn tại trên server  
✅ Frontend không bao giờ thấy key  
✅ CORS protection  
✅ `.env` được gitignore
