var path = require("path");
const { MongoClient } = require('mongodb');

// Properties Reader Setup and Configuration
let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "../../conf/db.properties");
let properties = propertiesReader(propertiesPath);

console.log(propertiesPath);
// Properties Variable Setup (DATABASE)
let dbPrefix = properties.get("db.prefix");
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

// Properties Variable Setup (DB CREDENTIALS)
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));

// Building Connection String
const uri = `${dbPrefix}${dbUsername}:${dbPwd}${dbUrl}${dbParams}`;

// MongoDB Client
let client;


// Function to connect to the MongoDB database and return the db instance
async function getDB() {
    if (!client) {
        client = new MongoClient(uri);
    }

    try {
        // Connect to MongoDB server
        await client.connect();

        // Access the database
        const db = client.db(dbName);

        return db;
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to the database');
    }
}

// Function to get a collection from the database
async function getCollection(collectionName) {
    try {
        const db = await getDB();
        const collection = db.collection(collectionName);
        return collection;
    }
    catch (error) {
        console.error('Error getting collection:', error);
        throw new Error('Failed to get collection');
    }
}

// Export the functions
module.exports = { getDB, getCollection };
