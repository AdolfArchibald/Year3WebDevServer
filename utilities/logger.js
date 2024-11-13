function logger(req, res, next) {
    // Log the request method and URL
    console.log(`Request: ${req.method} ${req.url}`);

    // Capture the original send method
    const originalSend = res.send;

    // Override the send method to capture the response data
    res.send = function (body) {
        // Log the response body
        console.log('Response:', body);

        // Call the original send method with the response body
        return originalSend.call(this, body);
    };

    next();
}

module.exports = logger;
