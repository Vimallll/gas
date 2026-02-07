# How to Fix 404 Error - Restart Backend Server

## The Problem
You're getting a 404 error because the backend server was started **before** we added the new `/api/auth/login` route. The server needs to be restarted to load the new route.

## Solution: Restart Backend Server

### Option 1: Manual Restart (Recommended)

1. **Find the terminal where backend is running**
   - Look for a terminal window showing "Server listening on port 5000"
   - Or check all open terminal/command prompt windows

2. **Stop the server**
   - Click on that terminal window
   - Press `Ctrl+C` (or `Ctrl+Break`)
   - Wait for it to stop

3. **Restart the server**
   ```bash
   cd C:\Users\ASUS\Desktop\gas\backend
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Verify it's working**
   - You should see:
     ```
     MongoDB connected
     Default configurations initialized
     Server listening on port 5000
     API available at http://localhost:5000
     ```

5. **Try login again**
   - Go back to your browser
   - Try logging in with mobile number

### Option 2: Kill Process and Restart

If you can't find the terminal:

1. **Kill Node process on port 5000:**
   ```powershell
   # Find process using port 5000
   netstat -ano | findstr :5000
   
   # Note the PID (last number), then kill it:
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Restart server:**
   ```bash
   cd C:\Users\ASUS\Desktop\gas\backend
   npm start
   ```

### Option 3: Use the Batch File

Double-click `restart-server.bat` in the backend folder (if it exists).

## After Restart

Once the server is restarted, try logging in again:
- Mobile: `1234567890` (or any 10+ digit number)
- Name: Your name (optional)
- Role: Select your role

The login should work now!

## Still Getting 404?

If you still get 404 after restarting:

1. Check browser console (F12) - what's the exact URL it's trying?
2. Verify backend is running: Open `http://localhost:5000` in browser - should show `{"message":"API is running"}`
3. Check the route exists: The file `backend/routes/auth.js` should have `router.post('/login', ...)`
4. Make sure you're using the correct URL: `http://localhost:5000/api/auth/login`

