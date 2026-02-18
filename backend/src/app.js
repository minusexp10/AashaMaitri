const express = require("express")
const app = express()
const session = require("express-session")

app.use(express.json())

app.use(session({
    secret:"Shashwat_randi",
    resave: false,
    saveUninitialized: false
}))

const authRoutes = require('./routes/authRoutes')
const appRoutes = require('./routes/appRoutes')

app.use('/auth' , authRoutes)
app.use('/app', appRoutes)

app.get('/' , (req,res) => {
    res.send("Server is running..");
})

module.exports = app;