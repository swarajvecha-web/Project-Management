const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// ── Prometheus metrics (prom-client) ─────────────────────────
// Install: npm install prom-client
const promClient = require('prom-client');
const register = promClient.register;
// Collect default Node.js metrics (event loop lag, GC, memory, etc.)
promClient.collectDefaultMetrics({ register });
// Custom: HTTP request duration histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});


// Routes Imports
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');
const settingsRoute = require('./routes/settings');
const employeeRoute = require('./routes/employee');
const projectRoute = require('./routes/project');
const taskRoute = require('./routes/task');
const timesheetRoute = require('./routes/timesheet');
const attendanceRoute = require('./routes/attendance');

const sprintRoute = require('./routes/sprint');
const notificationRoute = require('./routes/notification');
const aiRoute = require('./routes/ai');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to the app so routes can access it via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected via socket.io:', socket.id);
  
  // Clients can join a specific project room to get real-time board updates
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000;
connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// ── Observability Endpoints ───────────────────────────────────
// Prometheus scrape endpoint — returns all collected metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Health check endpoint — used by K8s liveness/readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ── HTTP Duration Middleware ───────────────────────────────────
// Must be registered AFTER /metrics and /health so those don't skew app stats
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status: res.statusCode,
    });
  });
  next();
});


// API's
app.use('/api', authRoute);
app.use('/api', dashboardRoute);
app.use('/api', settingsRoute);
app.use('/api', employeeRoute);
app.use('/api', projectRoute);
app.use('/api', taskRoute);
app.use('/api', timesheetRoute);
app.use('/api', attendanceRoute);
app.use('/api', sprintRoute);
app.use('/api', notificationRoute);
app.use('/api', aiRoute);

// Server Listen
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
