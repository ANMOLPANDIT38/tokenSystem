const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/token-rewards', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User schema and model
const userSchema = new mongoose.Schema({
  wallet: String,
  totalEarned: Number,
  totalRedeemed: Number,
  activities: [Number],
});

const User = mongoose.model('User', userSchema);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Token Rewards API!');
});

// API endpoints
app.post('/api/register', async (req, res) => {
  const { wallet } = req.body;
  const user = new User({ wallet, totalEarned: 0, totalRedeemed: 0, activities: [] });
  await user.save();
  res.send(user);
});

app.post('/api/earn', async (req, res) => {
  const { wallet, amount } = req.body;
  const user = await User.findOne({ wallet });
  if (user) {
    user.totalEarned += amount;
    user.activities.push(amount);
    await user.save();
    res.send(user);
  } else {
    res.status(404).send('User not found');
  }
});

app.post('/api/redeem', async (req, res) => {
  const { wallet, amount } = req.body;
  const user = await User.findOne({ wallet });
  if (user && user.totalEarned - user.totalRedeemed >= amount) {
    user.totalRedeemed += amount;
    user.activities.push(-amount);
    await user.save();
    res.send(user);
  } else {
    res.status(400).send('Insufficient balance or user not found');
  }
});

app.get('/api/users/:wallet', async (req, res) => {
  const { wallet } = req.params;
  const user = await User.findOne({ wallet });
  if (user) {
    res.send(user);
  } else {
    res.status(404).send('User not found');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
