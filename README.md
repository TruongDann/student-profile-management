# Run and deploy

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

### Backend (API Server)

1. Navigate to backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup environment:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your `GEMINI_API_KEY`

4. Run backend:
   ```bash
   npm run dev
   ```
   Backend runs on: http://localhost:3001

### Frontend

1. Back to root folder:

   ```bash
   cd ..
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup environment:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` should have:

   ```
   VITE_API_URL=http://localhost:3001
   ```

4. Run frontend:
   ```bash
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

## Deploy to Production

### 1. Deploy Backend (Render - FREE)

See [backend/README.md](backend/README.md) for detailed instructions.

**Quick steps:**

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set Root Directory: `backend`
4. Add environment variables:
   - `GEMINI_API_KEY`: your_key
   - `FRONTEND_URL`: your_frontend_url
5. Deploy → Get backend URL

### 2. Deploy Frontend (Hosting Inet)

1. Update `.env.production`:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. Build:

   ```bash
   npm run build
   ```

3. Upload `dist/` folder to hosting

## Security

✅ Gemini API key chỉ tồn tại trên backend server  
✅ Frontend KHÔNG chứa API key  
✅ An toàn khi deploy lên bất kỳ hosting nào
