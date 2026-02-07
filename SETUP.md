# Quick Setup Guide

## Step 1: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Create `.env` file** in `backend/` directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/gas_subsidy
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production-12345
   ```

4. **Start MongoDB** (if running locally):
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas cloud connection string in `.env`

5. **Start backend server:**
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
   ```

## Step 2: Frontend Setup

1. **Navigate to frontend folder** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Create `.env` file** in `frontend/` directory (optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start frontend:**
   ```bash
   npm start
   # or
   npm run dev
   ```

   Frontend will open at `http://localhost:5173`

## Step 3: Testing the System

### As Applicant:
1. Go to `http://localhost:5173/login`
2. Enter a 10-digit mobile number (e.g., `9876543210`)
3. Click "Send OTP"
4. **Check the backend console** for the OTP (it will be logged)
5. Enter the OTP and login
6. Create an application with your details
7. Upload documents (images or PDFs)
8. Submit the application
9. View your application status

### As Verification Officer:
1. You need to create a user with role `verification_officer` in MongoDB
2. Or modify an existing user's role in the database
3. Login with that user
4. Access `/verification` route
5. Review and approve/reject applications

### As Admin:
1. You need to create a user with role `admin` in MongoDB
2. Or modify an existing user's role in the database
3. Login with that user
4. Access `/admin` route
5. View dashboard, configure settings, trigger audits

## Creating Admin/Verification Officer Users

You can create users directly in MongoDB:

```javascript
// Connect to MongoDB and run:
use gas_subsidy

db.users.insertOne({
  mobile: "9999999999",
  name: "Admin User",
  role: "admin",
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

db.users.insertOne({
  mobile: "8888888888",
  name: "Verification Officer",
  role: "verification_officer",
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use MongoDB Compass/GUI to insert these documents.

## Default OTP (Development Only)

For development, OTP is displayed in the backend console. Check the terminal where you ran `npm start` or `npm run dev` in the backend folder.

Example output:
```
OTP for 9876543210: 123456
In production, send this via SMS gateway
```

## File Uploads

Uploaded documents are stored in `backend/uploads/` directory. Make sure this directory exists and has write permissions.

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running
- Verify MONGO_URI in `.env` file
- For MongoDB Atlas, ensure IP whitelist includes your IP

### Port Already in Use
- Change PORT in backend `.env` file
- Update VITE_API_URL in frontend `.env` accordingly

### CORS Errors
- Ensure backend is running
- Check VITE_API_URL matches backend URL

### File Upload Fails
- Check `backend/uploads/` directory exists
- Verify file size is under 5MB
- Ensure file type is JPEG, PNG, or PDF

## Next Steps

1. **For Production:**
   - Integrate real SMS gateway for OTP
   - Use cloud storage for file uploads
   - Enable HTTPS
   - Add rate limiting
   - Implement proper error logging
   - Set up monitoring

2. **Optional Integrations:**
   - Aadhaar eKYC API
   - Ration Card database lookup
   - Electricity Board API
   - PAN validation API
   - DBT (Direct Benefit Transfer) integration

3. **Security Enhancements:**
   - Use Redis for OTP storage
   - Implement file encryption
   - Add input validation
   - Enable MongoDB authentication
   - Set up proper CORS policies



