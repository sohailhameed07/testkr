const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/customer-db', { useNewUrlParser: true, useUnifiedTopology: true });
const Customer = mongoose.model('Customer', {
  name: String,
  email: String,
  phone: Number,
  feedback: String,
});

let nextCustomerId = 1;

// Serve the index.html file with a feedback form
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname + '/public' });
});

// Handle form submissions and store in MongoDB
app.post('/submit-feedback', async (req, res) => {
  const { name, email, phone, feedback } = req.body;

  // Check if the customer already exists in the database
  const existingCustomer = await Customer.findOne({ email });
  let customerId;

  if (existingCustomer) {
    // Update the existing customer's feedback
    existingCustomer.feedback = feedback;
    await existingCustomer.save();

    customerId = existingCustomer._id;
    res.send(`Thank you, ${name}. Your customer id is #${customerId}.`);
  } else {
    // Create a new customer
    const newCustomer = new Customer({
      name,
      email,
      phone,
      feedback,
    });
    await newCustomer.save();

    customerId = nextCustomerId++;
    res.send(`Thank you, ${name}. Your customer id is #${customerId}.`);
  }
});

// Set up routes to serve other HTML files
app.get('/About', (req, res) => {
  res.sendFile('About.html', { root: __dirname + '/public' });
});

app.get('/surprise-boxes', (req, res) => {
  res.sendFile('surprise boxes.html', { root: __dirname + '/public' });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
