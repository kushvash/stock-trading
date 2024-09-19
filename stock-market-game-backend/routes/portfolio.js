const express = require('express');
const router = express.Router();
const auth = require('../middleware/authmiddleware');
const User = require('../models/User');
const axios = require('axios');

// Buy stock
router.post('/buy', auth, async (req, res) => {
  const { symbol, quantity, price } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const totalCost = price * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({ msg: 'Insufficient funds' });
    }

    const stockIndex = user.portfolio.findIndex((stock) => stock.symbol === symbol);

    if (stockIndex !== -1) {
      user.portfolio[stockIndex].quantity += quantity;
      user.portfolio[stockIndex].purchasePrice = price;
    } else {
      user.portfolio.push({ symbol, quantity, purchasePrice: price });
    }

    user.balance -= totalCost;

    await user.save();

    // Update portfolio value after buying
    const updatePortfolioValue = async () => {
      const config = {
        headers: {
          'x-auth-token': req.header('x-auth-token'),
        },
      };
      const response = await axios.get('http://localhost:4000/api/portfolio/portfolio-value', config);
      user.portfolioValue = response.data.totalValue;
      await user.save();
    };

    await updatePortfolioValue();

    res.json({ msg: 'Stock purchased', portfolio: user.portfolio, balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Sell stock
router.post('/sell', auth, async (req, res) => {
  const { symbol, quantity, price } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const stockIndex = user.portfolio.findIndex((stock) => stock.symbol === symbol);

    if (stockIndex === -1 || user.portfolio[stockIndex].quantity < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock to sell' });
    }

    const totalValue = price * quantity;

    user.portfolio[stockIndex].quantity -= quantity;
    if (user.portfolio[stockIndex].quantity === 0) {
      user.portfolio.splice(stockIndex, 1);
    }

    user.balance += totalValue;

    await user.save();

    // Update portfolio value after selling
    const updatePortfolioValue = async () => {
      const config = {
        headers: {
          'x-auth-token': req.header('x-auth-token'),
        },
      };
      const response = await axios.get('http://localhost:4000/api/portfolio/portfolio-value', config);
      user.portfolioValue = response.data.totalValue;
      await user.save();
    };

    await updatePortfolioValue();

    res.json({ msg: 'Stock sold', portfolio: user.portfolio, balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/portfolio-value', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      let totalValue = user.balance;  // Start with the cash balance
      
      const promises = user.portfolio.map(async (stock) => {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${process.env.FINNHUB_API_KEY}`
        );
        const currentPrice = response.data.c;
        const stockValue = currentPrice * stock.quantity;
        return stockValue;
      });
  
      const stockValues = await Promise.all(promises);
      totalValue += stockValues.reduce((acc, value) => acc + value, 0);
  
      res.json({ totalValue });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;