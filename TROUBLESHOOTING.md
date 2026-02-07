# Troubleshooting Login Issues

## Issue: "Failed to login" Error

### Step 1: Check if Backend Server is Running

1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd C:\Users\ASUS\Desktop\gas\backend
   ```
3. Start the server:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

You should see:
```
MongoDB connected
Default configurations initialized
Server listening on port 5000
API available at http://localhost:5000
```

### Step 2: Check MongoDB Connection

Make sure MongoDB is running:
- If using local MongoDB: Ensure MongoDB service is running
- If using MongoDB Atlas: Check your connection string in `.env` file

### Step 3: Verify API Endpoint

Test the API directly:
1. Open browser or use Postman
2. Go to: `http://localhost:5000/api/auth/login`
3. Method: POST
4. Body (JSON):
   ```json
   {
     "mobile": "1234567890",
     "name": "Test User",
     "role": "applicant"
   }
   ```

### Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any CORS or network errors
4. Check Network tab for the failed request details

### Step 5: Common Fixes

1. **Server not running**: Start the backend server
2. **Port conflict**: Change PORT in backend `.env` if 5000 is in use
3. **MongoDB not connected**: Check MongoDB connection string
4. **CORS error**: Backend should have CORS enabled (already configured)
5. **Mobile number format**: Enter at least 10 digits (e.g., `1234567890`)

### Step 6: Restart Everything

1. Stop backend server (Ctrl+C)
2. Restart backend: `npm start` or `npm run dev`
3. Restart frontend: `npm start` or `npm run dev`
4. Clear browser cache and try again

## Quick Test

Try logging in with:
- Mobile: `9876543210`
- Name: `Test User`
- Role: `applicant`

If it still fails, check the backend terminal for error messages.



