const mongoose = require("mongoose")
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs');

const env = require("dotenv")
env.config()

const userSchema = new Schema({
    username: {
        type: String, 
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date, 
        userAgent: String
    }]
})

let User;

function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGO_URI)
          
          // verify the db1 connection
          
          db.on('error', (err) => {
            console.log(err);
            reject(err)
          })
          
          db.once('open', () => {
            console.log('MongoDB connected')
            User = db.model("users", userSchema)
            console.log("model registered")
            resolve("done")
          })
    })
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("passwords do not match")
        }

        bcrypt.hash(userData.password, 10).then((hash) => {
            userData.password = hash
            let newUser = new User(userData)
            newUser.save().then(() => {
                resolve("User registered successfully")
            }).catch((err) => {
                if (err.code == 11000) {
                    console.log(err)
                    reject("Username already taken")
                } else {
                    console.log(err)
                    reject("Error saving user "+err)
                }
            })
        }).catch((err) => {
            console.log(err)
            reject("Encryption Error: "+err)
        })
    })
}

function loginUser(userData) {
    return new Promise((resolve, reject) => {
        // check if the user exists
        // check if the password is correct
        // if both are true, resolve

        User.findOne({username: userData.username})
        .exec()
        .then((user) => {
            bcrypt.compare(userData.password, user.password).then((result) => {
                if (result) {
                    // add login history
                    // user.loginHistory.push({dateTime: (new Date()), userAgent: userData.userAgent})
                    // User.updateOne(...)
                    resolve(user)
                } else {
                    reject("incorrect credentials")
                }
            }).catch((err) => {
                console.log(err)
                reject("decryption error "+err)
            })
        }).catch((err) => {
            console.log(err)
            reject("incorrect credentials")
        })
    })
}

module.exports = {
    initialize,
    registerUser,
    loginUser
}