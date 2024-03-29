/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Andre Machado do Monte Student ID: 152848164 Date: Ago 01, 2018
*
*  Online (Heroku) Link:   https://murmuring-scrubland-77983.herokuapp.com
*
********************************************************************************/ 

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

var userSchema = new Schema ({
    "userName":{
        "type": String, "unique": true},
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://amachado-do-monte:Monte29.@ds253831.mlab.com:53831/assignment_6");
        db.on('error', (err)=> {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=> {
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
        return new Promise ((resolve, reject) => {
            if(userData.password !== userData.password2){
                reject("Passwords do not match");
            } else {
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(userData.password, salt, function(err, hash){
                        if(err){
                            reject("There was an error encrypting the password");
                        }
                        else {
                            userData.password = hash;
                            let newUser = new User(userData);
                            newUser.save((err) => {
                                if(err){
                                    if(err.code == 11000){
                                        reject("User Name already taken");
                                    }
                                    reject("There was an error creating the user: " + err);
                                }
                                else{
                                    resolve();
                                }
                            })
                        }
                    })
                })
            }     
        });
    };

    module.exports.checkUser = (userData) => {
        return new Promise((resolve, reject) => {
            User.find({userName : userData.userName}).exec().then((users) => { // not {user} // users -> userData.userName 과 같은 userName을 가지는 DB 내 정보
            if(users[0].length == 0){
                reject("Unable to find user: " + userData.userName);
            }
            else{
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if (res === true){
                        users[0].loginHistory.push({dateTime: new Date(), userAgent: userData.userAgent});             
                        User.update({userName: userData.userName},
                                    {$set: {loginHistory: users[0].loginHistory}},
                                    {multi: false}
                        ).exec().then(() => {
                            resolve(users[0]);
                        }).catch((err) => {
                            reject( "There was an error verifying the user: " + err)
                        });
                    } else {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
            }).catch(() => {
                reject("Unable to find user: " + userData.userName);
                })
            }
        })
    })
};