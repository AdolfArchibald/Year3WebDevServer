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

// Route to return the lessons collection from the DB
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

app.put('/updateLessons', async (req, res) => {
    try {
        // Extract the object from the request body
        const { spaceNeeded, id, attribute, newValue } = req.body;

        // Case 1: Handle spaceNeeded when no id, attribute, or newValue is provided
        if (spaceNeeded && (!id || !attribute || !newValue)) {
            // Validate that spaceNeeded is an array and not empty
            if (!Array.isArray(spaceNeeded) || spaceNeeded.length === 0) {
                return res.status(400).json({ error: 'If provided, "spaceNeeded" must be a non-empty array' });
            }

            // Get the 'lessons' collection
            const collection = await getCollection('lessons');

            // Loop through each item in spaceNeeded array
            for (const lessonUpdate of spaceNeeded) {
                const { id, spaces } = lessonUpdate;

                // Validate that the id is a number
                const parsedId = parseInt(id, 10);
                if (isNaN(parsedId)) {
                    return res.status(400).json({ error: `"id" must be a valid number for lesson ${JSON.stringify(lessonUpdate)}` });
                }

                // Retrieve the current lesson based on id
                const currentLesson = await collection.findOne({ id: parsedId });
                
                if (!currentLesson) {
                    return res.status(404).json({ error: `Lesson with id ${parsedId} not found` });
                }

                // Ensure that current lesson has a valid spaces value
                const currentSpaces = currentLesson.spaces || 0;

                // Calculate the new spaces value by subtracting the requested spaces
                const updatedSpaces = currentSpaces - spaces;

                // Update the lesson with the new spaces value
                const updateResult = await collection.updateOne(
                    { id: parsedId },
                    { $set: { spaces: updatedSpaces } }
                );

                if (updateResult.modifiedCount === 0) {
                    return res.status(404).json({ error: `Failed to update lesson with id ${parsedId}` });
                }
            }
            return res.status(200).json({ message: 'Lessons updated successfully with spaceNeeded', spaceNeeded });
        }

        // Case 2: Handle id, attribute, and newValue (normal update scenario; not an order from the website)
        if (id && attribute && newValue) {
            // Validate that the id isa  number
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: '"id" must be a valid number' });
            }

            // Validate the "attribute"
            const allowedAttributes = ['subject', 'location', 'price', 'spaces', 'image'];
            if (!allowedAttributes.includes(attribute)) {
                return res.status(400).json({ error: 'Invalid attribute, must be one of: subject, location, price, spaces, image' });
            }

            // If the attribute is "price" or "spaces", validate that the newValue is numeric
            let parsedValue = newValue;
            if (['price', 'spaces'].includes(attribute)) {
                parsedValue = parseFloat(newValue);  // Use parseFloat to handle decimal numbers as well (numbers converted back to INT if possible before adding to DB)
                
                if (isNaN(parsedValue)) {
                    return res.status(400).json({ error: `"newValue" must be a valid number for attribute "${attribute}"` });
                }
            }

            // Get the 'lessons' collection (implement logic for actual database update)
            const collection = await getCollection('lessons');

            // Update the lesson with the given information (done dynamically with the given info)
            const result = await collection.updateOne(
                { id: parsedId },
                { $set: { [attribute]: parsedValue } }
            );

            // Check if the update was successful
            if (result.modifiedCount === 1) {
                res.status(200).json({ message: 'Lesson updated successfully' });
            }
            else {
                res.status(404).json({ error: 'Lesson not found or no changes made' });
            }

            return;
        }

        // If neither case is met, return an error
        return res.status(400).json({ error: 'Invalid request, either "spaceNeeded" or "id", "attribute", and "newValue" must be provided' });

    } catch (error) {
        console.error('Error with the PUT', error);
        res.status(500).json({ error: 'Failed to run the PUT route' });
    }
});


// Start the server
app.listen(port, () => {
  console.log(`Express app listening.`);
});
