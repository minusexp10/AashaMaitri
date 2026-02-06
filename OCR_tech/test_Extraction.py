from OCR_Extraction import *

text = "WBC 5,100 cells/mm3"
print(extract_all(text)["wbc"])
text = "Hemoglobin 12.8 Platelet Count 1,80,000 WBC 5,100"
print(extract_all(text))
text="WBC 5100 cells/mm3"
print(extract_all(text)["wbc"])


