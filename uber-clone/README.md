# Uber Clone - Full Stack Ride Sharing Application

A comprehensive ride-sharing platform built with React frontend and Node.js backend, featuring real-time tracking, user management, and admin dashboard.

## 🚀 Features

### For Users
- **Account Management**: Register, login, and manage profile
- **Ride Booking**: Request rides with pickup and destination
- **Real-time Tracking**: Track driver location and ride status
- **Ride History**: View past rides and ratings
- **Driver Rating**: Rate and review completed rides

### For Drivers
- **Driver Registration**: Register as a driver with vehicle details
- **Ride Management**: Accept, start, and complete rides
- **Availability Control**: Toggle online/offline status
- **Earnings Tracking**: View ride history and earnings
- **Real-time Updates**: Receive ride requests instantly

### For Admins
- **Dashboard Analytics**: View platform statistics and metrics
- **User Management**: Manage users and drivers
- **Driver Verification**: Verify driver documents and vehicles
- **Ride Monitoring**: Monitor all rides and transactions
- **System Logs**: Track admin actions and system events

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data storage
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation

### Frontend
- **React** with Vite build tool
- **Material-UI** for component library
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for HTTP requests
- **Context API** for state management

## 📁 Project Structure

```
uber-clone/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── ridesController.js   # Ride management
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── rides.js             # Ride routes
│   │   └── admin.js             # Admin routes
│   ├── database/                # SQLite database files
│   ├── uploads/                 # File uploads
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API services
│   │   └── utils/               # Utility functions
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd uber-clone
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   DB_PATH=./database/uber_clone.db
   ADMIN_EMAIL=admin@uberclone.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```

5. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 Default Credentials

### Admin Account
- **Email**: admin@uberclone.com
- **Password**: admin123

### Demo Accounts
The login page includes demo login buttons for testing different user types.

## 📊 Database Schema

### Users Table
- User authentication and profile information
- Supports multiple user types: user, driver, admin

### Drivers Table
- Driver-specific information (vehicle details, verification status)
- Links to Users table

### Rides Table
- Complete ride information from request to completion
- Tracks status, pricing, and ratings

### Admin Logs Table
- Tracks all admin actions for audit purposes

## 🔄 Real-time Features

- **Live Ride Tracking**: Users can track their driver's location
- **Instant Notifications**: Real-time updates for ride status changes
- **Driver Availability**: Live updates when drivers go online/offline
- **Ride Requests**: Drivers receive immediate notifications for new rides

## 🛡 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- Role-based access control
- CORS protection

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Rides
- `POST /api/rides/request` - Request a ride
- `POST /api/rides/:id/accept` - Accept ride (drivers)
- `PUT /api/rides/:id/status` - Update ride status
- `GET /api/rides/user` - Get user's rides
- `GET /api/rides/driver` - Get driver's rides
- `POST /api/rides/:id/rate` - Rate a ride

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle-status` - Toggle user status
- `PUT /api/admin/drivers/:id/verify` - Verify driver
- `GET /api/admin/rides` - Get all rides
- `GET /api/admin/analytics` - Get analytics data

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar for process management
3. Configure reverse proxy (nginx)
4. Set up SSL certificates

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure API proxy for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- Google Maps integration for route planning
- Payment gateway integration
- Push notifications
- Mobile app development
- Advanced analytics and reporting
- Multi-language support
- Driver earnings dashboard
- Surge pricing algorithm

---

**Note**: This is a demo application for educational purposes. For production use, additional security measures, testing, and optimizations should be implemented.