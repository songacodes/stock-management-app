# 🛠️ Login Troubleshooting for Collaborators

If you are seeing "Invalid Credentials" when trying to log in, follow these steps:

## 1. Verify your connection
You must be connected to the shared database. Check your `backend/.env` file:
- Ensure `MONGODB_URI` starts with `mongodb://uwishemasonga...`
- It should NOT be `mongodb://localhost...`

## 2. Sync your local users
Run this command in the `backend` folder:
```bash
npm run seed
```

### Watch the output:
- **"User admin@example.com already exists. Updating..."** 
  - ✅ SUCCESS: This means you are connected to the right database. The password has been reset to `password123`. Try logging in again.
- **"User admin@example.com created"**
  - ❌ ERROR: This means you are connected to a **LOCAL** database on your own computer, not the shared one. Check your `.env` file!

## 3. Clear Cache
If the server says "Updating..." but you still can't log in:
1. Restart the backend terminal.
2. Restart the frontend terminal.
3. Use an Incognito/Private window to rule out browser cache.

## 4. Check the Terminal Logs
If it still fails, check the backend terminal output. I've added debug logs that will show exactly why it failed:
- `[Login Debug] User not found`
- `[Login Debug] Password mismatch`
- `[Login Debug] Account inactive`

---

## 5. Image Upload Issues
If uploading tile images is failing:
1. **Check `.env`:** Ensure your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly set. You can find these in the shared Cloudinary account or your own.
2. **Check Terminal Logs:** The backend will show a `[WARNING] Cloudinary configuration is incomplete` message at startup if keys are missing.
3. **Server Proxy:** Ensure the frontend is correctly proxying requests to the backend (check `frontend/package.json` has `"proxy": "http://localhost:5000"`).

## 6. ⚡ Slow Startup (Windows Only)
If `npm run dev` (backend) or `npm start` (frontend) takes too long to start:
1. **Antivirus Exclusion:** Open **Windows Security** > **Virus & threat protection** > **Manage settings** > **Exclusions**.
2. Add the project folder `stock management system` to the exclusions list. This prevents the antivirus from scanning thousands of files in `node_modules` every time you start the server.
3. We've optimized the project:
   - **Backend**: Switched to `tsx` (much faster than `ts-node`).
   - **Frontend**: Migrated to **Vite** (replaces slow Create React App). `npm start` now starts in milliseconds!

---
**Standard Login:**
- **Email:** `admin@example.com`
- **Password:** `password123`
