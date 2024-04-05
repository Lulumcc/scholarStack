const mongoose = require("mongoose")
const Schema = mongoose.Schema

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
        let db1 = mongoose.createConnection(process.env.MONGO_URI)
          
          // verify the db1 connection
          
          db1.on('error', (err) => {
            console.log(err);
            reject(err)
          })
          
          db1.once('open', () => {
            console.log('MongoDB connected')
            User = mongoose.model("users", userSchema)
            console.log("model registered")
            resolve("done")
            // const test = new User({
            //     username: "test",
            //     password: "test",
            //     email: "test@test.test"
            // })

            // test.save().then(() => {
            //     console.log("test user saved")  
            //     resolve("done")

            // }).catch((err) => {
            //     console.log(err)
            // })
          })
    })
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("passwords do not match")
        }

        let newUser = new User(userData)
        newUser.save().then(() => {
            resolve("user saved")
        }).catch((err) => {
            console.log(err)
            reject(err)
        })
    })
}

module.exports = {
    initialize,
    registerUser
}