var express = require("express");
var path = require("path");
const cors = require("cors");
const { logger, imagesMiddleware, errorHandler } = require("./utilities/middleware/customMiddleware");
const { getCollection } = require('./utilities/dbManagement/getData');

// App Setup and Configuration
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Custom Middleware
app.use(logger);
app.use('/images', imagesMiddleware);
app.use(errorHandler);

app.set('json spaces, 3');

// Port
const port = 3000;

// Define the route for /webstore/home
app.get('/webstore/home', (req, res) => {
  res.send('Welcome to the Webstore Home Page!');
});

// Test route to fetch an image
app.get('/test-image', (req, res) => {
    const imageUrl = '/images/calculator.svg';
    res.redirect(imageUrl);
});

// Test route to return a collection from the DB
app.get('/lessons', async (req, res) => {
    try {
        // Get the 'lessons' collection
        const collection = await getCollection('lessons');
        
        // Query the collection
        const lessons = await collection.find().toArray();
        
        // Send the lessons as JSON response
        res.status(200).json(lessons);

    }
    catch (error) {
        // If there is an error, send a 500 error
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
});


// POST route to insert a new order
app.post('/newOrder', async (req, res) => {
    try {
        // Get the 'orders' collection
        const collection = await getCollection('orders');
        
        // Get the order data from the request body
        const newOrder = req.body;

        // Insert the new order into the collection
        const result = await collection.insertOne(newOrder);
        
        // Check if the insertion was successful
        if (result.acknowledged) {
            res.status(201).json({ message: 'Order successfully created', orderId: result.insertedId });
        }
        else {
            res.status(500).json({ error: 'Failed to create order' });
        }

    } 
    catch (error) {
        // If there is an error, send a 500 error
        console.error('Error inserting new order:', error);
        res.status(500).json({ error: 'Failed to insert order' });
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
