const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to get stock price
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {

    console.log(`Fetching ${symbol}`);
    // const response = await axios.get(
    //   `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    // );
    const response = await axios.get(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );
      
    const data = response.data;
    console.log(data['c']);
    if (data) {
      // const latestTime = Object.keys(data)[0];
      const latestPrice = data['c'];


      res.json({ symbol, price: latestPrice });
    } else {
      res.status(404).json({ msg: 'Stock data not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;