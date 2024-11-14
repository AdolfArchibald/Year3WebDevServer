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

// PUT route to update a specific attribute of a lesson
app.put('/updateLesson/:id/:attribute/:newValue', async (req, res) => {
    try {
        // Get the lesson ID, attribute name, and new value from the request parameters
        const { id, attribute, newValue } = req.params;

        // Ensure the ID is a number
        let parsedID = parseInt(id, 10);
        if (isNaN(parsedID)) {
            return res.status(400).json({ error: 'ID is not a valid number' });
        }
    
        // Parse newValue as it might be a string
        let parsedValue = newValue;

        // Attempt to convert numeric attributes like "spaces" to a number
        if (attribute === "spaces" || attribute == "price") {
            parsedValue = parseInt(newValue, 10);

            // Ensure that availableSpaces is a valid number and give feedback
            if (isNaN(parsedValue) || parsedValue < 0) {
                return res.status(400).json({ error: 'Invalid value (HINT: It might be negative or NaN; please check).' });
            }
        }

        // Ensure that the attribute exists in the lesson document schema
        const allowedAttributes = ['spaces', 'subject', 'location', 'price'];

        if (!allowedAttributes.includes(attribute)) {
            return res.status(400).json({ error: 'Invalid attribute' });
        }

        // Get the 'lessons' collection
        const collection = await getCollection('lessons');

        // Update the lesson (with the matching ID) attribute with the new value
        const result = await collection.updateOne(
            { id: parseInt(id, 10) },
            { $set: { [attribute]: parsedValue } } // Set the given attribute to the new value
        );

        // Check if the update was successful
        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Lesson updated successfully' });
        }
        else {
            res.status(404).json({ error: 'Lesson not found or no changes made. NOTE: You might have already updated the Lesson.' });
        }
    }
    catch (error) {
        // If there is an error, send a 500 error
        console.error('Error updating lesson:', error);
        res.status(500).json({ error: 'Failed to update lesson' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
