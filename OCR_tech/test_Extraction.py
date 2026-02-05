from OCR_Extraction import *
text = """
Hemoglobin : 8.6 g/dL (Normal Range 12.0 - 15.0)
"""
print(extract_all(text)["hemoglobin"])
text = "Platelets : 2.1 lakh"
print(extract_all(text)["platelets"])
text = "Fetal Fraction : 3.5 %"
print(extract_all(text)["fetal_fraction"])
text = "CBC Report WBC 7600"
print(extract_all(text)["hemoglobin"])
text = "Fetal Movement reduced. Presentation breech."
print(extract_all(text)["fetal_movement"])
print(extract_all(text)["fetal_position"])

