
const pool = require('../config/db');
const axios = require("axios")



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
        // console.log(rows)
        res.status(200).json(rows[0])
    } catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to fetch patient"})
    }
}

// exports.delete_patient = async(req, res) =>{
//     try{
//         const {phone} = req.body;
        
//         await pool.query(
//             "DELETE FROM PATIENT WHERE phone = ?",
//             [phone]
//         )
//         res.status(200).json({message:"Patient deleted successfully"})
//     } catch(error){
//         console.log(error)
//         res.status(500).json({message:"Unable to fetch patients"})
//     }
// }

exports.receiveOCR = async (req, res) => {
    try {
        const data = req.session;

        if (!data) {
            return res.redirect("/upload"); // safety fallback
        }

        res.status(200).json({"ocr":{ data }});

    } catch (error) {
        console.log("Unable to receive OCR values");
        res.status(500).send("Something went wrong");
    }
};


