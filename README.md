# Gas Subsidy Eligibility & Verification System

A complete MERN stack digital eligibility screening and subsidy verification website for a government gas supply program. This system eliminates house-to-house manual verification and uses secure digital verification with document uploads, scoring algorithms, and automated workflows.

## Features

### 🔐 Authentication
- **OTP-based login** via mobile number
- Role-based access control (Applicant, Verification Officer, Admin)
- Secure JWT token authentication

### 👤 Applicant Portal
- Register/Login with mobile + OTP
- Submit personal and household details
- Upload verification documents:
  - Aadhaar Card
  - Ration Card
  - Income Certificate
  - Electricity Bill
  - PAN Card (optional)
  - Address Proof
- Accept digital consent for eligibility verification
- Track application status in real-time
- Download approval certificate (PDF)
- View rejection reasons if applicable

### 📊 Eligibility Scoring System
Automated rule-based scoring:
- **Ration Card Category**: AAY (+70), BPL (+50), APL (0)
- **Income Certificate**: +50 points
- **No ITR Filed**: +20 points
- **Electricity Bill Upload**: +20 points
- **Family Size > 4**: +10 points per additional member (max 2)

**Status Determination:**
- Score ≥ Threshold → Auto-approved
- Score ≥ Borderline → Manual verification required
- Score < Borderline → Rejected

### ✅ Verification Officer Portal
- Review pending applications
- View complete application details and documents
- Approve/Reject applications with remarks
- Manual override for borderline cases
- Flag suspicious/fraud applications
- Generate and download certificates (PDF)

### 👨‍💼 Admin Dashboard
- **Analytics Dashboard**:
  - Total applications count
  - Approval/rejection rates
  - Pending verifications
  - Fraud cases tracking
  - Audit queue status
- **Configuration Management**:
  - Income limits
  - Eligibility thresholds
  - Borderline thresholds
  - Audit sampling rates
  - Subsidy amounts
- **Audit System**:
  - Trigger random monthly audits (5-10% sampling)
  - Track audit status
- **Reports**:
  - Export applications to Excel
  - Filter by date range and status
- **User Management**:
  - View all users
  - Update user roles
  - Deactivate users

### 🔍 Audit & Compliance
- Complete audit trail for all actions
- Random sampling for monthly audits
- Digital consent logging with IP addresses
- Full modification history
- Role-based access control
- Data encryption ready

## Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **PDFKit** - Certificate generation
- **XLSX** - Excel report generation
- **bcryptjs** - Password hashing (if needed)

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
# or
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port)

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Applications (Applicant)
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update draft application
- `POST /api/applications/:id/submit` - Submit application
- `GET /api/applications/my-application` - Get my application

### Applications (Officer/Admin)
- `GET /api/applications` - Get all applications (with filters)
- `GET /api/applications/:id` - Get application by ID

### Verification
- `GET /api/verification/pending` - Get pending verifications
- `POST /api/verification/:id/review` - Review application (approve/reject/flag)
- `GET /api/verification/:id/certificate` - Download certificate

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/config` - Get all configurations
- `PUT /api/admin/config` - Update configuration
- `POST /api/admin/audit/trigger` - Trigger monthly audit
- `GET /api/admin/reports/export` - Export reports (Excel)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Manage users (update role, deactivate)

## User Roles

### Applicant
- Can create and submit applications
- Can track application status
- Can download certificates if approved

### Verification Officer
- Can view all applications
- Can review and approve/reject applications
- Can flag fraud cases
- Can generate certificates

### Admin
- All Verification Officer permissions
- Can configure system settings
- Can trigger audits
- Can export reports
- Can manage users

## Default Configuration

The system initializes with these default values:
- **Income Limit**: ₹50,000 per annum
- **Eligibility Threshold**: 100 points (auto-approval)
- **Borderline Threshold**: 80 points (manual review)
- **Audit Sampling Rate**: 10% (0.1)
- **Subsidy Amount**: ₹200 per cylinder

These can be modified via the Admin Dashboard.

## Development Notes

### OTP System
Currently, OTP is logged to console for development. In production, integrate with SMS gateway:
- Twilio
- MSG91
- AWS SNS
- Other SMS providers

Update `backend/utils/otp.js` to integrate with your SMS provider.

### File Storage
Uploaded documents are stored in `backend/uploads/` directory. In production:
- Use cloud storage (AWS S3, Google Cloud Storage, etc.)
- Implement file encryption
- Add virus scanning

### Security Enhancements
For production deployment:
1. Use environment variables for all secrets
2. Enable HTTPS
3. Implement rate limiting
4. Add input validation and sanitization
5. Use Redis for OTP storage (instead of in-memory)
6. Implement file encryption
7. Add CORS restrictions
8. Enable MongoDB authentication

## Project Structure

```
gas/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, roles, upload
│   ├── utils/           # Utilities (OTP, scoring, audit)
│   ├── uploads/         # Uploaded documents
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   ├── context/     # React context (Auth)
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## License

This project is created for government gas subsidy program management.

## Support

For issues or questions, please check the code comments or contact the development team.



