// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// const PORT = process.env.PORT || 4000;

// const cors = require('cors');

// // app.get('/api/protected', auth, (req, res) => {
// //   res.json({ msg: 'Access granted to protected route' });
// // });

// app.use(express.json()); 

// app.use(cors({
//   origin: 'http://localhost:3000'
// }));




// const auth = require('./middleware/authmiddleware');

// const stockRoutes = require('./routes/stocks');
// app.use('/api/stocks', stockRoutes);

// const portfolioRoutes = require('./routes/portfolio');
// app.use('/api/portfolio', portfolioRoutes);

// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

// require('dotenv').config();

// const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected to Atlas'))
//   .catch(err => console.log(err));

// io.on('connection', (socket) => {
//   console.log('New client connected');
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// app.get('/', (req, res) => {
//     console.log("Req rec");
//     res.send('Server is running');
// });

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();
// const mongoose = require('mongoose');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: 'http://localhost:3000',  // Allow requests from your frontend
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

// const PORT = process.env.PORT || 4000;

// // CORS setup for allowing frontend connection
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST'],
//   credentials: true
// }));

// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected to Atlas'))
//   .catch(err => console.log(err));

// // Import routes
// const auth = require('./middleware/authmiddleware');
// const stockRoutes = require('./routes/stocks');
// const portfolioRoutes = require('./routes/portfolio');
// const authRoutes = require('./routes/auth');

// // Use routes
// app.use('/api/stocks', stockRoutes);
// app.use('/api/portfolio', portfolioRoutes);
// app.use('/api/auth', authRoutes);

// // Serve a basic route
// app.get('/', (req, res) => {
//     console.log("Req rec");
//     res.send('Server is running');
// });

// // Socket.io: Real-time stock price update
// io.on('connection', (socket) => {
//   console.log('New client connected');

//   // Emit stock prices every 10 seconds
//   const interval = setInterval(async () => {
//     const stockSymbol = 'AAPL';  // You can modify this to get different stock symbols

//     try {
//       // Fetch stock prices using Alpha Vantage (or any other stock API)
//       const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=1min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
//       const data = response.data['Time Series (1min)'];
//       if (data) {
//         const latestTime = Object.keys(data)[0];
//         const latestPrice = data[latestTime]['4. close'];

//         // Emit stock price to the client
//         socket.emit('stockPriceUpdate', { symbol: stockSymbol, price: latestPrice });
//       }
//     } catch (error) {
//       console.error('Error fetching stock price:', error);
//     }
//   }, 10000);  // Emit every 10 seconds

//   // Handle client disconnect
//   socket.on('disconnect', () => {
//     clearInterval(interval);  // Clear the interval when client disconnects
//     console.log('Client disconnected');
//   });
// });

// // Start the server
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Socket.io CORS configuration
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',  // Allow frontend requests
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

app.use(express.json());

// Express CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch(err => console.log(err));

// Routes
const auth = require('./middleware/authmiddleware');
const stockRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const authRoutes = require('./routes/auth');

app.use('/api/stocks', stockRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Socket.io: Real-time stock price update
io.on('connection', (socket) => {
  console.log('New client connected');

  const interval = setInterval(async () => {
    const stockSymbol = 'AAPL';  // Example stock

    try {
      // const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=1min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
      // const data = response.data['Time Series (1min)'];

      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`
      );

      const data = response.data;
      if (data) {
        // const latestTime = Object.keys(data)[0];
        const latestPrice = data['c'];

        socket.emit('stockPriceUpdate', { symbol: stockSymbol, price: latestPrice });
      }

      console.log("Updating Price");

    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  }, 50000);  // Emit every 50 seconds

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));