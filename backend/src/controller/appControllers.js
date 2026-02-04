const pool = require('../config/db')
const bcrypt = require('bcrypt')


exports.add_patients = async(req, res) =>{
    try{
        //asha_id

        //check for empty or invalid entry
        const 
            {asha_id, name, phone, aadhaar, age, region, no_kids, no_miscarriages, mother_blood_grp, father_blood_grp}
             = req.body;

        //check for invalid phone no
        if(phone.length > 10){
            return res
                    .status(500)
                    .json({message:"Invalid phone number"})
        }

        //check if patient already exists
        const hashed_aadhaar = await bcrypt.hash(aadhaar, 10)
        const [row] = await pool.query(
            "SELECT * FROM PATIENT WHERE phone = ?",
            [phone]
        )
        if(row.length>0){
            return res
                    .status(400)
                    .json({message:"Patient already exists"})
        }
        await pool.query(
            "INSERT INTO PATIENT(asha_id, name, phone, aadhaar, age, region, no_kids, no_miscarriages, mother_blood_grp, father_blood_grp) VALUES(?,?,?,?,?,?,?,?,?,?)",
            [asha_id, name, phone, hashed_aadhaar, age, region, no_kids, no_miscarriages, mother_blood_grp, father_blood_grp]
        )
        return res
                .status(200)
                .json({message:"Patient added successfully"})

    } catch(error){
        console.log(error)
        res.status(500).json({message:"Cannot add patients"})
    }
}

exports.get_patients = async(req, res) =>{
    try{
        const {asha_id} = req.body;
        
        const rows = await pool.query(
            "SELECT * FROM PATIENT WHERE ASHA_ID = ?",
            [asha_id]
        )
        console.log(rows)
        res.status(200).json(rows[0])
    } catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to fetch patients"})
    }
}

//workflow to delete a patient
//frontend call get_patient_from_phone, which displays the details of the user which the asha is about to remove
//after accepting it, the delete_patient api will be called.
exports.get_patient_from_phone = async(req, res) =>{
    try{
        const {phone} = req.body;
        
        const rows = await pool.query(
            "SELECT * FROM PATIENT WHERE PHONE = ?",
            [phone]
        )
        console.log(rows)
        res.status(200).json(rows[0])
    } catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to fetch patient"})
    }
}

exports.delete_patient = async(req, res) =>{
    try{
        const {phone} = req.body;
        
        await pool.query(
            "DELETE FROM PATIENT WHERE phone = ?",
            [phone]
        )
        res.status(200).json({message:"Patient deleted successfully"})
    } catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to fetch patients"})
    }
}


exports.upload = async(req, res) =>{
    try{

    }catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to upload files"})
    }
}