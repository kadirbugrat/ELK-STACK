require("dotenv").config()
const express = require('express');
const axios = require('axios');
const mongoose = require("mongoose");
const app = express();
const moment = require('moment');

const port = 3000;

app.use(express.json());

// MongoDB Config.
const connect = require("./mongo");
app.listen(3000, () => {
  console.log("server listening on port 3000");

  // connect to the database
  connect();
});

// Kullanıcı modeli
const userSchema = new mongoose.Schema({
    name: String,
    email: String
});

const User = mongoose.model('User', userSchema);


// Elasticsearch configurations
const ELASTICSEARCH_URL = "http://localhost:9200";
const HEADERS = { "Content-Type": "application/json" };
console.log(process.env.LOGSTASH_PORT);

// // Function to log data to Elasticsearch
// const logToElasticsearch = async (logData) => {
//     try {
//         await axios.post(`${ELASTICSEARCH_URL}/api-logs/_doc`, logData, { headers: HEADERS });
//     } catch (error) {
//         console.error("Error logging to Elasticsearch:", error);
//     }
// };

const logToElasticsearch = async (logData) => {
    const indexName = `api-logs-${moment().format('YYYY.MM')}`;
    try {
        await axios.post(`${ELASTICSEARCH_URL}/${indexName}/_doc`, logData, { headers: HEADERS });
    } catch (error) {
        console.error("Error logging to Elasticsearch:", error);
    }
};

// Middleware to log requests
app.use(async (req, res, next) => {
    const logData = {
        timestamp: new Date().toISOString(),
        endpoint: req.originalUrl,
        method: req.method,
        status: "received"
    };
    console.log(JSON.stringify(logData));
    await logToElasticsearch(logData);
    next();
});

// Root endpoint
app.get('/', async (req, res) => {
    const logData = {
        timestamp: new Date().toISOString(),
        endpoint: "/",
        message: "Root endpoint called test test run",
        status: "success"
    };
    console.log(JSON.stringify(logData));
    await logToElasticsearch(logData);
    res.send({ message: "Hello, World!" });
});

// Item endpoint
app.get('/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const logData = {
        timestamp: new Date().toISOString(),
        endpoint: `/items/${itemId}`,
        message: `Item endpoint called with id ${itemId}`,
        status: "success"
    };
    console.log(JSON.stringify(logData));
    await logToElasticsearch(logData);
    res.send({ itemId, message: "Item fetched successfully" });
});

// Kullanıcıları Getir
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        const logData = {
            timestamp: new Date().toISOString(),
            endpoint: "/api/users",
            method: "GET",
            message: "Users FETCHED!"
        };
        console.log(JSON.stringify(logData));
        await logToElasticsearch(logData);
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send({ message: "Kullanıcılar getirilemedi", error: err });
    }
});

// Yeni Kullanıcı Kaydet
app.post('/api/users', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email
    });

    try {
        const savedUser = await user.save();
        const logData = {
            timestamp: new Date().toISOString(),
            endpoint: "/api/users",
            method: "POST",
            message: `User with ID ${savedUser._id} is REGISTERED!`
        };
        console.log(JSON.stringify(logData));
        await logToElasticsearch(logData);
        res.status(201).send(savedUser);
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(400).send({ message: "Kullanıcı kaydedilemedi", error: err });
    }
});

// Kullanıcı Sil
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const result = await User.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Kullanıcı bulunamadı" });
        }
        const logData = {
            timestamp: new Date().toISOString(),
            endpoint: `/api/users/${userId}`,
            method: "DELETE",
            message: `User with ID ${userId} is DELETED`
        };
        console.log(JSON.stringify(logData));
        await logToElasticsearch(logData);
        res.send({ message: "User DELETED" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).send({ message: "Kullanıcı silinemedi", error: err });
    }
});

