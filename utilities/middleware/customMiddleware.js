const express = require('express');
const path = require('path');


// Logger Middleware to log incoming requests and outgoing responses
function logger(req, res, next) {
    // Log the request method and URL
    console.log(`Request: ${req.method} ${req.url}`);

    // Capture the original send method
    const originalSend = res.send;

    // Override the send method to capture the response data
    res.send = function (body) {
        // Log the response body
        console.log('Response Sent');

        // Call the original send method with the response body
        return originalSend.call(this, body);
    };

    next();
}


// Images Middleware (with error handling for if images don't exist)
const imagesMiddleware = express.static(path.join(__dirname, 'public/images'));

const errorHandler = (req, res, next) => {
    if (req.path.startsWith('/images/') && !req.path.endsWith('.svg')) {
        return res.status(404).send('Image not found');
    }
    next();
};

module.exports = { logger, imagesMiddleware, errorHandler };
