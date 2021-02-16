
//Importing 
import express from "express";
import mongoose from "mongoose";
import messageSchema from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
// import routes from "./routes/index"

//app configs
const app = express()
const port = process.env.PORT || 9001

const pusher = new Pusher({
    appId: "1156634",
    key: "497958b47b93255bb3e7",
    secret: "c237ae93ef04b62cd5ae",
    cluster: "us3",
    useTLS: true
  });

// middleware
app.use(express.json())
app.use(cors())

//DB configs
const connection_url = 'mongodb+srv://admin:FZiR2ttEV6SzKG8@cluster0.a5rxq.mongodb.net/chatdb?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.once('open',()=>{
    console.log("DB is connected")
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();
    changeStream.on('change', (change) => {
        console.log("a change occured", change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted', 
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    timestamp: messageDetails.timestamp,
                    reveived: messageDetails.received,
                }
            );
        } else {
            console.log("Error triggering pusher")
        }





    })
})

//api routes
app.get('/api/messages/sync', (req, res) => {
    messageSchema.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post("/api/messages/new", (req, res) => {
    const dbMessages = req.body;
    messageSchema.create(dbMessages, (err, data) => {
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data)
        }
    })
})

//litsener

app.listen(port, () => console.log(`Listening on localhost: ${port}`))


















// //importing
// const express = require("express");
// const mongoose = require("mongoose");
// const routes = require("./backend/routes");
// const app = express();
// const PORT = process.env.PORT || 3001;

// // Define middleware here
// app.use(express.urlencoded({ extended: true}));
// app.use(express.json());
// // Serve up static assets (usually on heroku)
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// }
// // Add routes, both API and view
// app.use(routes);

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "./client/build/index.html"));
//   });

// // Connect to the Mongo DB
// mongoose.connect(
//     process.env.MONGODB_URI || 'mongodb://localhost/dbname',
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useCreateIndex: true,
//       useFindAndModify: false
//     }
//   );

// // Start the API server
// app.listen(PORT, function() {
//   console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
// });
