const express = require("express")
const app = express()

app.use(express.json())

const authRoutes = require('./routes/authRoutes')
const appRoutes = require('./routes/appRoutes')

app.use('/auth' , authRoutes)
app.use('/app', appRoutes)

app.get('/' , (req,res) => {
    res.send("Server is running..");
})

module.exports = app;