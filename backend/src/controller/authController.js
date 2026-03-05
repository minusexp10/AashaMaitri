const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')

// Ideally keep it in .env
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; 

exports.signup = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({
        message: "Phone No, name and password required"
      });

    const [existing] = await pool.query(
      "SELECT 1 FROM ASHA WHERE phone = ?",
      [phone]
    );

    if (existing.length > 0)
      return res.status(409).json({
        message: "Mobile number already registered"
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO ASHA (name, phone, password_hash) VALUES (?, ?, ?)",
      [name, phone, hashedPassword]
    );

    // Optional: auto-login after signup
    const token = jwt.sign(
      { phone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Signup successful",
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const [users] = await pool.query(
      "SELECT id, name, phone, password_hash FROM ASHA WHERE phone = ?",
      [phone]
    );

    if (users.length == 0)
      return res.status(401).json({
        message: "Invalid phone number or password"
      });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch)
      return res.status(401).json({
        message: "Invalid phone number or password"
      });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        phone: user.phone
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login Successful",
      asha_id: user.id,
      name: user.name,
      token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.add_patient = async(req, res) =>{
    try{
        //asha_id

        //check for empty or invalid entry
        // console.log("in add_patient")
        // console.log(req.body)
        const 
            {asha_id, name, phone, aadhaar, age, mother_blood_grp}
             = req.body;
        var 
          {region, no_kids, no_miscarriages, father_blood_grp}
          =req.body;
        //check for invalid phone no
        if(phone.length > 10){
            return res
                    .status(500)
                    .json({message:"Invalid phone number"})
        }
        if(father_blood_grp == "")
          father_blood_grp = null
        if(region == "")
          region = null
        if(no_kids == "")
          no_kids = null
        if(no_miscarriages == "")
          no_miscarriages = null

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
        // console.log(req.body)
        // console.log("in get patients")
        const asha_id = req.asha_id;
        // console.log(asha_id)
        const rows = await pool.query(
            `
            SELECT 
                patient.*,
                report.id AS report_id,
                report.risk,
                report.report_date
            FROM patient
            JOIN report 
            ON patient.id = report.patient_id
            WHERE report.asha_id = 11;
            `,
            [asha_id]
        )
        // console.log(rows[0])
        res.status(200).json(rows[0])
    } catch(error){
        console.log(error)
        res.status(500).json({message:"Unable to fetch patients"})
    }
}

exports.upload_patient = async (req, res) => {
  try {

    const phone = req.patientPhone

    // Get patient
    const [patients] = await pool.query(
      "SELECT id, asha_id FROM PATIENT WHERE PHONE = ?",
      [phone]
    )

    if (!patients.length) {
      return res.status(404).json({
        message: "Patient not found"
      })
    }

    const { id: patient_id, asha_id } = patients[0]

    // Try inserting report (ignored if already exists)
    const [insertResult] = await pool.query(
      "INSERT IGNORE INTO REPORT (PATIENT_ID, ASHA_ID) VALUES (?, ?)",
      [patient_id, asha_id]
    )

    let reportId

    if (insertResult.insertId) {
      // New report created
      reportId = insertResult.insertId
    } else {
      // Report already existed → fetch its id
      const [existing] = await pool.query(
        "SELECT id FROM REPORT WHERE PATIENT_ID = ? AND ASHA_ID = ?",
        [patient_id, asha_id]
      )

      reportId = existing[0].id
    }

    return res.status(200).json({
      message: "OK",
      reportId
    })

  } catch (error) {
    console.error("Upload patient error:", error)

    return res.status(500).json({
      message: "Unable to upload for the given patient"
    })
  }
}

exports.receive_risk = async(req, res) => {
    try{
        // console.log(req.body)
        const { report_id, data } = req.body;
        const response = data;
        let ml_payload = {}

        for(let key in response){
            // console.log(key)
            if(response[key].value == null || response[key].value == '')
                ml_payload[key] = 0
            else
                ml_payload[key] = response[key].value
        }
        // console.log(ml_payload)
        const ml_risk = await axios.post(
                "http://127.0.0.1:8000/predict-risk",
                ml_payload,   // 👈 SEND DATA
                {
                    headers: {
                    "Content-Type": "application/json"
                    }
                }
                )
        // console.log(ml_risk.data)
        console.log(report_id)
        await pool.query(
          "UPDATE report SET risk = ? WHERE id = ?",
          [ml_risk.data.risk_level, report_id]
        )
        // console.log("DB Risk updated")
        res.status(200).json({"risk" : ml_risk.data.risk_level})
    } catch(error){
        console.log(error)
        console.log("Unable to predict risk");
        res.status(500).send("Something went wrong");
    }

}

exports.high_risk = async(req, res) =>{
    try{
      // console.log(req.asha_id)
        const [rows] = await pool.query(
          `
          SELECT p.name, p.phone, r.risk
          FROM REPORT r
          JOIN PATIENT p ON r.patient_id = p.id
          WHERE r.asha_id = ? AND r.risk = ?
          `,
          [req.asha_id, "HIGH"]
        )
        // console.log(rows[0])
        res.status(200).json(rows)
    } catch(error){
        console.log("Unable to fetch high risk cases")
        res.status(500).json({message:"Unable to fetch patients"})
    }
}