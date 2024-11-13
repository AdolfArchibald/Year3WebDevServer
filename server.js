var express = require("express");
var path = require("path");
const cors = require("cors");
const logger = require("./utilities/logger")

// App Setup and Configuration
var app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

app.set('json spaces, 3');

const port = 3000;

// Properties Reader Setup and Configuration
let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);


// Properties Variable Setup (DATABASE)
let dbPrefix = properties.get("db.prefix");
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

// Properties Variable Setup (CREDENTIALS)
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));

// Building Connection String
const uri = `${dbPrefix}${dbUsername}:${dbPwd}${dbUrl}${dbParams}`


// Define the route for /webstore/home
app.get('/webstore/home', (req, res) => {
  res.send('Welcome to the Webstore Home Page!');
});

// Start the server
app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});
