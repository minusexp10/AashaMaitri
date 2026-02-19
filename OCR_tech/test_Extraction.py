from OCR_Extraction import *

text = "cbc WBC 5,100 cells/mm3"
print(extract_all(text))
# text = "MASS concentration of Hemoglobin abcdf 12.8 Platelet Count trash 1,80,000 WBC 5,100"
# print(extract_all(text))
text="urine report Test urine 5100 cells/mm3"
print(extract_all(text))


