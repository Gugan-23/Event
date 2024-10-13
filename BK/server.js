const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const router = express.Router(); // Initialize the router

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Make email unique
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);


const productSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  price: { type: Number, required: true }, // Changed to 'price' for consistency
  image_url: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
// Signup Route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('Signup Request:', req.body); // Log signup request data

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });
  
  try {
    await user.save();
    console.log('User created:', user); // Log the created user
    res.status(201).send('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error.message); // Log error
    res.status(400).send('Error creating user: ' + error.message);
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  
  console.log('Login Request:', req.body); // Log login request data

  try {
    // Check if user exists by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      console.warn('Login failed: User not found'); // Log warning
      return res.status(401).send('Invalid credentials: User not found');
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn('Login failed: Incorrect password'); // Log warning
      return res.status(401).send('Invalid credentials: Incorrect password');
    }

    // Successful login
    console.log('Login successful for user:', user.username);
    return res.status(200).send({ message: 'Login successful', token: 'your_generated_token_here' }); // Send a token or user info if needed

  } catch (error) {
    
    console.error('Server error during login:', error.message); // Log server error
    res.status(500).send('Server error: ' + error.message);
  }
});
// Get All Users Route
// Get All Users Route

// Get All Products Route
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    if (products.length === 0) {
      return res.status(404).send({ message: 'No products found' }); // Return a message if no products are found
    }
    // Return structured response with all product data
    res.status(200).send({
      message: 'Products fetched successfully',
      products: products.map(product => ({
        id: product._id,
        product_name: product.product_name,
        price: product.price,
        image_url: product.image_url,
      })),
    });
  } catch (err) {
    console.error('Error fetching products:', err); // Log the error for debugging
    res.status(500).send({ message: 'Error fetching products', error: err.message }); // Return structured error response
  }
});

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  description: { type: String }
});

const Event = mongoose.model('Event', eventSchema);

// Route to add a new event
app.post('/api/events', async (req, res) => {
  try {
    const { eventName, eventDate, eventLocation, description } = req.body;
    const newEvent = new Event({ eventName, eventDate, eventLocation, description });
    await newEvent.save();
    res.status(201).json({ message: 'Event added successfully!' });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ message: 'Failed to add event', error: error.message });
  }
});

module.exports = router;
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).send({ message: 'No users found' });
    }
    res.status(200).send({
      message: 'Users fetched successfully',
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
      })),
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send({ message: 'Error fetching users', error: err.message });
  }
});
// Route to Fetch All Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    if (events.length === 0) {
      return res.status(404).send({ message: 'No events found' });
    }
    res.status(200).send({ message: 'Events fetched successfully', events });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).send({ message: 'Error fetching events', error: err.message });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
