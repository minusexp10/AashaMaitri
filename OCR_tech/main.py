from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from pdf2image import convert_from_bytes
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
import io
import traceback

from OCR_Extraction import extract_all

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI(title="Maternal Health OCR Service")


@app.post("/ocr/extract")
async def extract_report(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        all_text = ""

        # ----------------------------
        # PDF HANDLING
        # ----------------------------
        if file.filename.lower().endswith(".pdf"):
            images = convert_from_bytes(contents, dpi=300)

            for img in images:
                img = img.convert("L")
                text = pytesseract.image_to_string(img)
                all_text += " " + text

        # ----------------------------
        # IMAGE HANDLING
        # ----------------------------
        else:
            image = Image.open(io.BytesIO(contents))
            image = image.convert("L")
            image = image.resize((image.width * 2, image.height * 2))
            all_text = pytesseract.image_to_string(image)

        # ----------------------------
        # EXTRACTION
        # ----------------------------
        extracted_data = extract_all(all_text)

        return {
            "status": "success",
            "extracted_fields": extracted_data
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-extract")
def test_extract():
    text = "Hemoglobin 8.6 Platelets 210 Fetal Movement reduced"
    return extract_all(text)
