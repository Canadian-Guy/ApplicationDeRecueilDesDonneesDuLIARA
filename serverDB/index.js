// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWT_VERY_SECRET_KEY = "liaraverysecretkey";

const app = express();
const port = process.env.PORT || 4041;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(
    cors({
        origins: 'http://localhost',
        credentials: true,
    })
);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    userName: String,
    password: String,
    admin: Boolean
});

const dataSchema = new mongoose.Schema({
    data: String
});

const Data = mongoose.model('Data', dataSchema);

const Users = mongoose.model('Users', userSchema);

//Add some default users if there are none.
Users.countDocuments(function(error, count){
    //Default users.
    if(!error && count === 0){
        const dummy = new Users({userName: 'Dum', password: 'dumdum', admin: false});
        dummy.save(function(error, dummy){
            if(error) return console.error(error);
            console.log("saved " + dummy);
        });

        const admin = new Users({userName: 'Admin', password: 'MightyAdmin', admin: true});
        admin.save(function(error, admin){
            if(error) return console.error(error);
            console.log("Saved " + admin);
        });
    }
})
/*
//log all users.
console.log("Finding all users before deletion.")
Users.find(function(error, users){
    if(error) return console.error(error);
    console.log(users);
});

Users.deleteMany({}, function(){
    console.log("Finding all users after deletion.")
    Users.find(function(error, users){
        if(error) return console.error(error);
        console.log(users);
    });
})
*/

app.get('/', (req, res) => {
    res.send('Hello There');
});

//TMP, FOR DEBUG ONLY, REMOVE/COMMENT THIS *****NOT SECURE AT ALL*****
app.post('/deleteData', (req, res) => {
    console.log("Delete Data");
    Data.deleteMany({}, function(error){
        if(error) return console.error(error);
        res.status(200).json({message: "Deleted all data."});
    })
})

//Save received data into the database.
app.post('/save', (req, res) => {
    console.log("Save Data");
    const receivedData = JSON.parse(req.body['data']);
    let auth = req.headers['authorization'];

    if(!auth){
        res.status(401).json({message: "Must be logged in. Please send authorization header with token."});
    }
    else{
        let authType = auth.split(" ")[0];
        let authToken = auth.split(" ")[1];
        if(authType !== "Bearer"){
            res.status(400).json({message: "Authorization header must be sent with token in it."});
        }
        else{
            try{
                // Decode the token. This will give us the user's information.
                let decoded = jwt.decode(authToken, JWT_VERY_SECRET_KEY);
                // Look up the user in the data base to see if he exists.
                Users.findOne({userName: decoded.userName, password: decoded.password}, function(error, user){
                    if(error){
                        res.status(500);    //Generic internal error with no more info.
                    }
                    //If we didn't find the user, send an error.
                    else if(user === null){
                        res.status(401).json({message:"Bad token, must log in"});
                    }
                    //If we found the user, the token is good, save data in database.
                    else{
                        receivedData.forEach(function(taggedObject){
                            let taggedData = new Data({data: JSON.stringify(taggedObject)});
                            taggedData.save(function(error, dummy){
                                if(error) return console.error(error);
                            })
                        });
                        res.status(200).json("");
                    }
                });
            }
            catch(error){
                res.status(500);    //Send generic error code, problem happened in decoding or in database.
            }
        }
    }

})

//Sends back all the saved data.
app.get('/getData', (req, res) => {
    console.log("Get Data");
    Data.find(function(error, data){
        res.status(200).json(data)
    });
})

// Get profile (Used to "authorise" user to load pages).
app.post('/getProfile', (req, res) => {
    console.log("Get Profile.")
    //get the authorisation header( should be "Bearer longStringOfCharacter" ).
    let auth = req.headers['authorization'];
    //If the header was not there, send an error.
    if(!auth){
        res.status(401).json({message: "Must be logged in to access this part."});
    }
    else{
        let authType = auth.split(" ")[0];
        let authToken = auth.split(" ")[1];
        if(authType !== "Bearer"){
            res.status(400).json({message: "Authorization header must be sent with token in it."});
        }
        else{
            try{
                // Decode the token. This will give us the user's information.
                let decoded = jwt.decode(authToken, JWT_VERY_SECRET_KEY);
                // Look up the user in the data base to see if he exists.
                Users.findOne({userName: decoded.userName, password: decoded.password}, function(error, user){
                    if(error){
                        res.status(500);    //Generic internal error with no more info.
                    }
                    //If we didn't find the user, send an error.
                    else if(user === null){
                        res.status(401).json({message:"Bad token, must log in"});
                    }
                    //If we found the user, the token is good, send a success and a bool to confirm if the user is an admin.
                    else{
                        res.status(200).json(user.admin);    //Just send a success code, user was found with received token.
                    }
                });
            }
            catch(error){
                res.status(500);    //Send generic error code, problem happened in decoding or in database.
            }
        }
    }
});

// Login
//TODO: Hash the password because plain text passwords is a big no no.
app.post('/login', (req, res) => {
    console.log("Login");
    const userName = req.body['userName'];
    const password = req.body['password'];
    console.log(req.body);
    if(userName === "" || password === ""){
        res.status(400).json({message: "Empty fields"});
        return;
    }
    Users.findOne({userName: userName, password: password}, function(error, user){
        if(error){
            res.status(500);    //Generic internal error with no more info.
        }
        else if(user === null){
            res.status(401).json({message:"Bad username or password."});
        }
        else{
            //Return a token
            let payload = {
                userName: userName,
                password: password,
                admin: user.admin
            }
            try{
                let token = jwt.sign(payload, JWT_VERY_SECRET_KEY);
                res.status(200).json({admin: user.admin, token: token});
            }
            catch(error){
                res.status(500);
                console.log(error);
            }
        }
    })
});

app.listen(port, () => {
    console.log("The server is running on port: " + port);
});
