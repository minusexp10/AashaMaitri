from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
from PIL import Image
from pdf2image import convert_from_bytes
import pytesseract
import io
import traceback


from OCR_Extraction import extract_all, safe_update

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI(title="Maternal Health OCR Service")


@app.post("/ocr/extract")
async def extract_reports(files: List[UploadFile] = File(...)):
    try:
        final_result = {}
        processed_files = []

        for file in files:
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

            extracted = extract_all(all_text)
            safe_update(final_result, extracted)

            processed_files.append(file.filename)

        return {
            "status": "success",
            "files_received": len(files),
            "processed_files": processed_files,
            "extracted_fields": final_result
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
