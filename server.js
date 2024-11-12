var express = require("express");
var path = require("path");
const cors = require("cors");

// App Setup and Configuration
var app = express();
app.use(cors());
app.use(express.json());

app.set('json spaces, 3');

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

