const axios = require("axios");
const FormData = require("form-data");   // <-- only here

exports.uploadController = async (req, res) => {
    try {
        console.log("files received:", req.files.length);

        let results = [];

        for (const file of req.files) {
            const fileBuffer = file.buffer;

            const form = new FormData();
            form.append("files", fileBuffer, {
                filename: file.originalname,
                contentType: file.mimetype
            });

            const response = await axios.post(
                "http://127.0.0.1:8000/ocr/extract",
                form,
                { headers: form.getHeaders() }
            );

            results.push({
                filename: file.originalname,
                fastapi: response.data
            });
        }

        var ocr_payload = {}

        for (let key in results) {

            let extracted = results[key].fastapi.extracted_fields;

            for (let key1 in extracted) {

                let extracted1 = extracted[key1];

                ocr_payload[key1] = {};   // create cbc / ultrasound object

                for (let key2 in extracted1) {

                    ocr_payload[key1][key2] = {};  // FIXED HERE

                    let extracted2 = extracted1[key2];

                    for (let key3 in extracted2) {

                        ocr_payload[key1][key2][key3] = extracted2[key3];  // FIXED HERE
                    }
                }
            }
        }

        const response = {
            message: "All files processed",
            redirectTo: '/ocrvalues',
            count: results.length,
            ocr_payload
        }
      res.status(200).json(response.ocr_payload)
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Image upload failed" });
    }
};

// exports.MLdata = async(req, res) => {
//     try{
//         const data = req.body
//     } catch(error){
//         console.log(error);
//         res.status(500).json({ message : "Unable to receive values"})
//     }
// }


/*
ALL VALUES WHICH SHOULD BE FED TO THE MODEL
IF ANY VALUE IS NULL, IT SHOULD BE PREFILLED TO ZERO
{
    "age":,
    "weight":,
    "total_pregnancies": ,

    "systolic_bp":,
    "diastolic_bp": ,

    "blood_glucose":,
    "bodytemp": ,
    "heartrate":,
    "tsh": ,

    "hemoglobin": ,
    "wbc": ,
    "rbc": ,
    "platelets": ,
    "hct": ,

    "urine_transparency": ,
    "urine_glucose": ,
    "urine_protein": ,
    "urine_color": ,

    "fetal_fraction": ,
    "trisomy_21": ,
    "trisomy_18": ,
    "trisomy_13": ,

    "fetal_position": ,
    "fetal_movement": ,
    "fetal_heart_rate": 
}
*/


