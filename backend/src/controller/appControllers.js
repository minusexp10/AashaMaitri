
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
        console.log(rows)
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

exports.receive_risk = async(req, res) => {
    try{
        const response = req.body
        let ml_payload = {}

        for(let key in response){
            // console.log(key)
            if(response[key].value == null || response[key].value == '')
                ml_payload[key] = 0
            else
                ml_payload[key] = response[key].value
        }
        console.log(ml_payload)
        const ml_risk = await axios.post(
                "http://127.0.0.1:8000/predict-risk",
                ml_payload,   // 👈 SEND DATA
                {
                    headers: {
                    "Content-Type": "application/json"
                    }
                }
                )
            console.log(ml_risk.data)
        await pool.query(
            "INSERT INTO REPORT (patient_id, asha_id, risk) VALUES(?, ?, ?)",
            ["11", "36", ml_risk.data.risk]
        )
        res.status(200).json({"risk" : ml_risk.data.risk_level})
    } catch(error){
        console.log(error)
        console.log("Unable to predict risk");
        res.status(500).send("Something went wrong");
    }

}

exports.high_risk = async(req, res) =>{
    try{
        const rows = await pool.query(
            "SELECT * FROM REPORT WHERE ASHA_ID = ?, RISK = ?",
            [asha_id, "HIGH"]
        )


        res.send(200).json(rows[0])
    } catch(error){
        console.log("Unable to fetch high risk cases")
        res.status(200).json({message:"Unable to fetch patients"})
    }
}
