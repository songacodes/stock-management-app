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
**Standard Login:**
- **Email:** `admin@example.com`
- **Password:** `password123`
