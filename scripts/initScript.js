/**
 * Script is used for setup db first time this script will work only in docker
 */
let ObjectId = require('mongoose').Types.ObjectId;
//create client of mongo
const MongoClient = require('mongodb').MongoClient;
// for support env
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

//create database connection uri for central db
let database = 'mongodb://' + process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB;

//connect database
MongoClient.connect(database, {
    useUnifiedTopology: true
}, async function (err, client) {
    if (!err) {
        console.log('==============>Db connected');

        const md5 = require('md5');
        //  select Database
        var dbo = client.db("shopping");
        let adminData = {
            "username": "admin",
            "password": md5("admin"),
            "role": "admin",
            "firstName": "admin",
            "lastName": "admin",
            "email": "admin@gmail.com",
            "createdAt": new Date(),
            "updatedAt": new Date()
        };
        try {
            //create Admin
            await dbo.collection("users").insertOne(adminData);
            console.log('==============>Admin created');
        } catch (err) {
            console.error(err);
            console.error('==============>Admin/ code create failed');
        };
        client.close();
        process.exit();
    } else {
        console.error('==============>Error while connect admin db');
        console.error(err);
    }
});