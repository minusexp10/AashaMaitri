const pool = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.signup = async(req, res) => {
    try{
        console.log(req.body)
        const {name, phone, password} = req.body;

        //empty phone or password check
        if(!name || !phone || !password)
            return res
                    .status(400)
                    .json({message:"Phone No, name and password required"})

        const [existing] = await pool.query(
            "SELECT 1 FROM ASHA WHERE phone = ?", 
            [phone]
        )

        if(existing.length > 0)
            return res
                    .status(409)
                    .json({message:"Mobile number already registered"})
        
        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query(
            "INSERT INTO ASHA (name , phone , password_hash) VALUES(?,?,?)",
            [name, phone, hashedPassword]
        )

        return res
                .status(200)
                .json({message:"Signup successful"})
    } catch(error) {
        console.log(error)
        return res
                .status(500)
                .json({message:"Server error"})
    }
}

exports.login = async (req, res) => {
    try{
        const{phone, password} = req.body;

        //check if username exists and compare password with hash
        const [users] = await pool.query(
            "SELECT id, name, password_hash FROM ASHA WHERE phone = ?",
            [phone]
        )

        const user = users[0]
        if(users.length == 0)
            return res
                    .status(401)
                    .json({message:"Invalid phone number or password"})

        const isMatch = await bcrypt.compare(password, user.password_hash)

        if(!isMatch)
            return res
                    .status(401)
                    .json({
                        message:"Invalid username or password"
                    })

        res.json({
            message:"Login Successful",
            asha_id:user.id
        })
    } catch(error){
        console.log(error)
        return res
                .status(500)
                .json({message:"Server error"
                })
    }
}
