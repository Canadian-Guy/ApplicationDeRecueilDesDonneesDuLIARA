// index.js -- Server that allows data storage and authentification.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_VERY_SECRET_KEY = "liaraverysecretkey";

const saltRounds = 10;

const app = express();
const port = process.env.PORT || 4041;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(
    cors({
        origins: '*',
        credentials: true,
    })
);

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

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
        let psw = "dumdum";
        bcrypt.hash(psw, saltRounds, function(err, hash){
            if(err){
                console.log("Error hashing password");
                return;
            }
            const dummy = new Users({userName: 'Dum', password: hash, admin: false});
            dummy.save(function(error, dummy){
                if(error) return console.error(error);
                console.log("saved " + dummy);
            });
        });
        psw = "MightyAdmin";
        bcrypt.hash(psw, saltRounds, function(err, hash){
            if(err){
                console.log("Error hashing password");
                return;
            }
            const admin = new Users({userName: 'Admin', password: hash, admin: true});
            admin.save(function(error, admin){
                if(error) return console.error(error);
                console.log("Saved " + admin);
            });
        });
    }
})

//To reset users, uncomment this snippet, reset the server and comment the snippet again (To avoid resetting next server restart)
/*
//log all users.
console.log("Logging all users.")
Users.find(function(error, users){
    if(error) return console.error(error);
    console.log(users);
});
//Delete all users
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

//Send all users, without their password, need to be an admin.
app.get('/users', (req, res) => {
    console.log("Log all users.");
    let noPswUsers = [];

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
                    //Only admin can register a new user (TMP?).
                    else if(!user.admin){
                        res.status(403).json({message: "Need admin permission to register a new user."});
                    }
                    //If we found the user, the token is good, send the stuff.
                    else{
                        Users.find(function(error, users){
                            if(error) return console.error(error);
                            users.forEach(function(user){
                                noPswUsers.push({userName: user.userName, admin:user.admin});
                            })
                            res.status(200).json(noPswUsers);
                        });
                    }
                });
            }
            catch(error){
                res.status(500);    //Send generic error code, problem happened in decoding or in database.
            }
        }
    }
});

/* Uncomment this to allow deletion of all data.
//TMP, FOR DEBUG ONLY, REMOVE/COMMENT THIS *****NOT SECURE AT ALL, DELETES ALL SAVED DATA*****
app.post('/deleteData', (req, res) => {
    console.log("Delete Data");
    Data.deleteMany({}, function(error){
        if(error) return console.error(error);
        res.status(200).json({message: "Deleted all data."});
    })
})
*/

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
                // Look up the user in the data base to see if he exists. Note that we use decoded.password, because the token was made using the hashed password.
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

//Uncomment this to allow the API to send all the data.
/*
//Sends back all the saved data.
app.get('/getData', (req, res) => {
    console.log("Get Data");
    Data.find(function(error, data){
        res.status(200).json(data)
    });
});
*/

//Register a new user in the database. This part is subject to change because idk who will be able to register people.
app.post('/register', (req, res) => {
    console.log("Register");
    //Get received info.
    const userName = req.body['userName'];
    const password = req.body['password'];
    //If one of the fields is empty, return an error.
    if(!userName || !password || userName === "" || password === ""){
        res.status(400).json({message: "Empty fields"});
        return;
    }
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
                        console.log(user);
                        console.log(decoded);
                        console.log(authToken);
                        res.status(401).json({message:"Bad token, must log in"});
                    }
                    //Only admin can register a new user (TMP?).
                    else if(!user.admin){
                        res.status(403).json({message: "Need admin permission to register a new user."});
                    }
                    //If we found the user, the token is good, register the new user.
                    else{
                        //Check if the username is already in the database
                        Users.findOne({userName:userName}, function(error, user){
                            if(error){
                                console.log(error);
                                res.status(500).json("");    //Generic internal error with no more info.
                                return;
                            }
                            if(user !== null){
                                res.status(409).json({message:"Username already exists."});
                            }else{
                                //Hash the password
                                bcrypt.hash(password, saltRounds, function(err, hash){
                                    if(err){
                                        console.log(err);
                                        return;
                                    }
                                    //Create the new user with the hashed password
                                    const newUser = new Users({userName: userName, password: hash, admin: false});
                                    //Save the new user.
                                    newUser.save(function(error, newUser){
                                        if(error) return console.error(error);
                                        console.log("saved " + newUser);
                                    });
                                });
                                res.status(200).json("");   //Success.
                            }
                        });
                    }
                });
            }
            catch(error){
                res.status(500);    //Send generic error code, problem happened in decoding or in database.
            }
        }
    }
});

// Edit user status
app.post('/editUserStatus', (req, res) => {
    console.log("Edit User Status");
    //Get new status.
    const userName = req.body['userName'];
    const admin = req.body['admin'];

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
                    if(user.userName === userName){
                        res.status(403).json({message:"Cannot edit yourself."});
                    }
                    //Only admin can register a new user (TMP?).
                    else if(!user.admin){
                        res.status(403).json({message: "Need admin permission to register a new user."});
                    }
                    //If we found the user, the token is good, update him.
                    else{
                        Users.findOne({userName:userName}, function(error, user){
                            if(error){
                                res.status(500).json({message:"Error deleting user."})
                            }
                            user.admin = admin;
                            user.save(function(error, user){
                                if(error){
                                    res.status(500).json({message:error});
                                }
                                res.status(200).json({message:"Edited user "+ userName});
                            });
                        });
                    }
                });
            }
            catch(error){
                res.status(500);    //Send generic error code, problem happened in decoding or in database.
            }
        }
    }
});

// Delete a user.
app.post('/deleteUser', (req, res) => {
    console.log("Delete User");
    //Get the username to delete.
    const userName = req.body['userName'];

    if(userName === ""){
        res.status(400).json({message: "Empty fields"});
        return;
    }

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
                        console.log(user);
                        console.log(decoded);
                        console.log(authToken);
                        res.status(401).json({message:"Bad token, must log in"});
                    }
                    //Only admin can register a new user (TMP?).
                    else if(!user.admin){
                        res.status(403).json({message: "Need admin permission to register a new user."});
                    }
                    //If we found the user, the token is good, delete the user..
                    else{
                        Users.deleteOne({userName:userName}, function(error){
                            if(error){
                                res.status(500).json({message:"Error deleting user."})
                            }
                            res.status(200).json({message:"Deleted user "+ userName});
                        });
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
app.post('/login', (req, res) => {
    console.log("Login");
    //Get the info used to log in.
    const userName = req.body['userName'];
    const password = req.body['password'];
    //If one of them is empty, return an error.
    if(userName === "" || password === ""){
        res.status(400).json({message: "Empty fields"});
        return;
    }
    //Check if the userName is in the database.
    Users.findOne({userName: userName}, function(error, user){
        if(error){
            res.status(500).json("");    //Generic internal error with no more info.
        }
        else if(user === null){
            res.status(401).json({message:"Bad username or password."});
        }
        //found username.
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(err){
                    res.status(500).json("");   //Send generic error, comparing password failed.
                }else if(result){   //password === password.
                    //Return a token
                    let payload = {
                        userName: userName,
                        password: user.password,
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
                else{   //Bad password
                    res.status(401).json({message:"Bad username or password."});
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log("The server is running on port: " + port);
});
