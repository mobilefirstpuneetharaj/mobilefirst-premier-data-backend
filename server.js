const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// REMOVED: express-mongo-sanitize
// const xss = require('xss-clean');
// const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const sanitize = require('./middleware/sanitize'); // ✅ NEW

require('dotenv').config();

// Connect to database
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const userRoutes = require('./routes/userRoutes');
const leagueRoutes = require('./routes/leagueRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// // CORS (adjust origin as needed)
app.use(cors({
  origin:[
    'http://localhost:5173',
    'https://mobilefirst-premier-data-frontend.vercel.app',
    'https://premier-data-frontend-fullstack-training-phase.vercel.app',
    'https://mobilefirst-premier-data-front-mobilefirstpuneetharajs-projects.vercel.app',
    'https://mobilefirst-premier-git-10f8c8-mobilefirstpuneetharajs-projects.vercel.app',
    'https://mobilefirst-premier-data-frontend-julqhe4y3.vercel.app',
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ include OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"]     // ✅ allow needed headers
}));


// const allowedOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(",")
//   : ["http://localhost:5173"]; // fallback for development

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true
// }));

// app.options('*', cors()); 

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));



// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
// app.use('/api', limiter);

app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // skip rate limiting for preflight
  }
  limiter(req, res, next);
});


// Replace express-mongo-sanitize with safe in-place sanitizer
app.use(sanitize());

// Prevent XSS attacks
// app.use(xss());

// Prevent HTTP parameter pollution
// app.use(hpp());

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/password', passwordRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/leagues', leagueRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
