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
        let i = 0
        while(i<results.length){
            console.log(results[i].fastapi.extracted_fields)
            i++
        }
        res.json({
            message: "All files processed",
            count: results.length,
            results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Image upload failed" });
    }
};
