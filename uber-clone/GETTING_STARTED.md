# 🚀 Getting Started with Uber Clone

This guide will help you set up and run the Uber Clone application on your local machine.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git (optional)

## 🛠 Installation Steps

### 1. Navigate to Project Directory
```bash
cd uber-clone
```

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on **http://localhost:5000**

### Step 2: Seed the Database (Optional but Recommended)
In a new terminal:
```bash
cd backend
npm run seed
```
This creates demo accounts and sample data for testing.

### Step 3: Start the Frontend
In another new terminal:
```bash
cd frontend
npm run dev
```
The frontend will start on **http://localhost:5173**

## 🔐 Demo Accounts

After running the seed script, you can use these accounts:

### Regular User
- **Email**: user@demo.com
- **Password**: demo123

### Driver Accounts
- **Email**: driver@demo.com
- **Password**: demo123

- **Email**: driver2@demo.com
- **Password**: demo123

### Admin Account
- **Email**: admin@uberclone.com
- **Password**: admin123

## 🎯 Testing the Application

### 1. Visit the Landing Page
Open **http://localhost:5173** in your browser to see the landing page.

### 2. Login with Different Roles
- Use the **Demo Login** buttons on the login page for quick access
- Or manually enter the credentials above

### 3. Explore Features

#### As a User:
- View dashboard with ride statistics
- Book new rides using the booking dialog
- View ride history
- See total spending and ratings

#### As a Driver:
- Toggle online/offline status
- View earnings and completed rides
- Manage active rides (accept, arrive, start, complete)
- Track performance metrics

#### As an Admin:
- View platform statistics and analytics
- Manage users and drivers
- Verify driver documents
- Monitor all rides and system activity
- Toggle user active status

## 🔧 API Testing

The backend API is available at **http://localhost:5000**

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Authentication Example
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@demo.com", "password": "demo123"}'
```

## 📁 Project Structure

```
uber-clone/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── database/          # SQLite database files
│   ├── .env               # Environment variables
│   ├── seed.js            # Database seeding script
│   └── server.js          # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   └── ...
│   └── package.json
└── README.md
```

## 🌟 Key Features

### ✅ Completed Features
- **User Authentication** - JWT-based with role management
- **User Dashboard** - Ride booking and history
- **Driver Dashboard** - Ride management and earnings
- **Admin Dashboard** - Platform management and analytics
- **Real-time Updates** - Socket.io integration
- **Responsive Design** - Material-UI components
- **Database Management** - SQLite with proper relationships
- **Security** - Rate limiting, input validation, password hashing

### 🔄 Real-time Features
- Live ride status updates
- Driver availability changes
- Instant notifications for ride requests
- Real-time ride tracking (UI ready, maps integration pending)

## 🚧 Future Enhancements

- Google Maps integration for route planning
- Payment gateway integration
- Push notifications
- Mobile app development
- Advanced analytics dashboard
- Multi-language support

## 🐛 Troubleshooting

### Port Already in Use
If you get port errors:
- Backend: Change PORT in `.env` file
- Frontend: Vite will automatically suggest alternative ports

### Database Issues
If you encounter database errors:
```bash
cd backend
rm -rf database/
npm run dev  # This will recreate the database
npm run seed # Re-populate with demo data
```

### Module Not Found
If you get module errors:
```bash
# In backend directory
npm install

# In frontend directory
npm install
```

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Ensure both backend and frontend are running
3. Verify demo accounts are created with the seed script
4. Check that ports 5000 and 5173 are available

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Backend running on http://localhost:5000
- ✅ Frontend running on http://localhost:5173
- ✅ Demo accounts working
- ✅ All dashboards accessible
- ✅ Real-time features operational

Happy coding! 🚗💨