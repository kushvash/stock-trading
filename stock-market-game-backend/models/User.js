const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  portfolio: [
    {
      symbol: String,
      quantity: Number,
      purchasePrice: Number,
    },
  ],
  balance: { type: Number, default: 10000 }, // Virtual currency
  portfolioValue: { type: Number, default: 0 },  // Add this field
});

module.exports = mongoose.model('User', UserSchema);