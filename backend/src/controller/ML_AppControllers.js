const axios = require("axios");
const FormData = require("form-data");

exports.uploadController = async (req, res) => {
    try {
        console.log("files received:", req.files.length);

        const file = req.files[0];
        const fileBuffer = file.buffer;

        const form = new FormData();
        form.append("file", fileBuffer, file.originalname);

        const response = await axios.post(
            "http://127.0.0.1:8000/ocr/extract",
            form,
            { headers: form.getHeaders() }
        );

        console.log("FastAPI response:", response.data);

        res.json({
            message: "Forwarded to FastAPI",
            fastapi: response.data
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
};