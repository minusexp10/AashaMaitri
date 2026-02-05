import re

# --------------------------------------------------
# TEXT NORMALIZATION
# --------------------------------------------------
def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.replace("\n", " ")
    text = re.sub(r"[^\w\s.%]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# --------------------------------------------------
# CONFIDENCE LOGIC
# --------------------------------------------------
def confidence(found: bool, valid: bool):
    if found and valid:
        return "HIGH"
    if found and not valid:
        return "MEDIUM"
    return "LOW"


# --------------------------------------------------
# SAFE NUMBER EXTRACTION (COLLISION-PROOF)
# --------------------------------------------------
def extract_number_anchor(text, keywords, window=40):
    for kw in keywords:
        idx = text.find(kw)
        if idx == -1:
            continue

        snippet = text[idx : idx + window]

        # Cut reference ranges
        snippet = re.split(r"normal range|reference|range| to |-", snippet)[0]

        # Match numbers WITH commas
        numbers = re.findall(
            r"\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.\d+|\d+",
            snippet
        )

        if numbers:
            clean = numbers[0].replace(",", "")
            return float(clean), True

    return None, False




# --------------------------------------------------
# UNIT NORMALIZATION
# --------------------------------------------------
def normalize_platelets(value, text):
    if value is None:
        return None
    if "lakh" in text:
        return value * 100
    return value


def normalize_fetal_fraction(value):
    if value is None:
        return None
    if value > 1:
        return value / 100
    return value


# --------------------------------------------------
# CBC EXTRACTION
# --------------------------------------------------
def extract_cbc(text):
    data = {}

    hb, found = extract_number_anchor(text, ["hemoglobin", "hb", "haemoglobin","Hemoglobin"])
    valid = hb is not None and 3 <= hb <= 20
    data["hemoglobin"] = {"value": hb if valid else None, "confidence": confidence(found, valid)}

    wbc, found = extract_number_anchor(text, ["wbc", "white blood", "leukocyte"])
    valid = wbc is not None and 1000 <= wbc <= 30000
    data["wbc"] = {"value": wbc if valid else None, "confidence": confidence(found, valid)}

    rbc, found = extract_number_anchor(text, ["rbc", "red blood", "erythrocyte","RBC Count"])
    valid = rbc is not None and 2 <= rbc <= 7
    data["rbc"] = {"value": rbc if valid else None, "confidence": confidence(found, valid)}

    platelets, found = extract_number_anchor(text, ["platelet", "plt","platelets"])
    platelets = normalize_platelets(platelets, text)
    valid = platelets is not None and 50 <= platelets <= 600
    data["platelets"] = {"value": platelets if valid else None, "confidence": confidence(found, valid)}

    hct, found = extract_number_anchor(text, ["hct", "hematocrit", "pcv"])
    valid = hct is not None and 20 <= hct <= 60
    data["hct"] = {"value": hct if valid else None, "confidence": confidence(found, valid)}

    return data


# --------------------------------------------------
# BLOOD GLUCOSE & TSH EXTRACTION
# --------------------------------------------------
def extract_glucose_tsh(text):
    data = {}

    glucose, found = extract_number_anchor(text, ["blood glucose", "glucose"])
    valid = glucose is not None and 60 <= glucose <= 300
    data["blood_glucose"] = {"value": glucose if valid else None, "confidence": confidence(found, valid)}

    tsh, found = extract_number_anchor(text, ["tsh", "thyroid stimulating hormone"])
    valid = tsh is not None and 0.01 <= tsh <= 20
    data["tsh"] = {"value": tsh if valid else None, "confidence": confidence(found, valid)}

    return data


# --------------------------------------------------
# NIPT EXTRACTION
# --------------------------------------------------
def extract_nipt(text):
    data = {}

    ff, found = extract_number_anchor(text, ["fetal fraction", "ff"])
    ff = normalize_fetal_fraction(ff)
    valid = ff is not None and 0 <= ff <= 1
    data["fetal_fraction"] = {"value": ff if valid else None, "confidence": confidence(found, valid)}

    def extract_trisomy(name):
        pattern = rf"{name}.*?(positive|negative|detected|not detected|high risk|low risk)"
        match = re.search(pattern, text)
        if match:
            status = match.group(1)
            value = -1 if status in ["positive", "detected", "high risk"] else 0
            return value, "HIGH"
        return None, "LOW"

    for t in ["trisomy 21", "trisomy 18", "trisomy 13"]:
        value, conf = extract_trisomy(t)
        data[t.replace(" ", "_")] = {"value": value, "confidence": conf}

    return data


# --------------------------------------------------
# ULTRASOUND EXTRACTION
# --------------------------------------------------
def extract_ultrasound(text):
    data = {}

    efw, found = extract_number_anchor(text, ["estimated fetal weight", "efw", "fetal weight"])
    valid = efw is not None and 300 <= efw <= 5000
    data["estimated_fetal_weight"] = {"value": efw if valid else None, "confidence": confidence(found, valid)}

    fhr, found = extract_number_anchor(text, ["fetal heart rate", "fhr","Fetal Heart Rate"])
    valid = fhr is not None and 80 <= fhr <= 200
    data["fetal_heart_rate"] = {"value": fhr if valid else None, "confidence": confidence(found, valid)}

    # Fetal Position → Binary
    if "cephalic" in text:
        data["fetal_position"] = {"value": 0, "confidence": "HIGH"}
    elif "breech" in text or "transverse" in text:
        data["fetal_position"] = {"value": 1, "confidence": "HIGH"}
    else:
        data["fetal_position"] = {"value": None, "confidence": "LOW"}

    # Fetal Movement → Binary
    if "normal movement" in text or "fetal movement normal" in text:
        data["fetal_movement"] = {"value": 0, "confidence": "HIGH"}
    elif "reduced movement" in text or "absent movement" in text or "movement reduced" in text:
        data["fetal_movement"] = {"value": 1, "confidence": "HIGH"}
    else:
        data["fetal_movement"] = {"value": None, "confidence": "LOW"}

    return data
# --------------------------------------------------
# URINE REPORT EXTRACTION (BINARY NORMALIZED)
# --------------------------------------------------
def extract_urine(text):
    data = {}

    # Transparency
    if "clear" in text:
        data["urine_transparency"] = {"value": 0, "confidence": "HIGH"}
    elif "turbid" in text or "cloudy" in text or "hazy" in text:
        data["urine_transparency"] = {"value": 1, "confidence": "HIGH"}
    else:
        data["urine_transparency"] = {"value": None, "confidence": "LOW"}

    # Urine Glucose
    if "urine glucose" in text or "glucose" in text:
        if "negative" in text or "nil" in text:
            data["urine_glucose"] = {"value": 0, "confidence": "HIGH"}
        elif "trace" in text or "+" in text or "positive" in text:
            data["urine_glucose"] = {"value": 1, "confidence": "HIGH"}
        else:
            data["urine_glucose"] = {"value": None, "confidence": "MEDIUM"}
    else:
        data["urine_glucose"] = {"value": None, "confidence": "LOW"}

    # Urine Protein
    if "protein" in text:
        if "negative" in text or "nil" in text:
            data["urine_protein"] = {"value": 0, "confidence": "HIGH"}
        elif "trace" in text or "+" in text or "positive" in text:
            data["urine_protein"] = {"value": 1, "confidence": "HIGH"}
        else:
            data["urine_protein"] = {"value": None, "confidence": "MEDIUM"}
    else:
        data["urine_protein"] = {"value": None, "confidence": "LOW"}

    # Urine Color
    if "pale yellow" in text or "yellow" in text:
        data["urine_color"] = {"value": 0, "confidence": "HIGH"}
    elif "dark yellow" in text or "amber" in text or "red" in text:
        data["urine_color"] = {"value": 1, "confidence": "HIGH"}
    else:
        data["urine_color"] = {"value": None, "confidence": "LOW"}

    return data


# --------------------------------------------------
# MAIN PIPELINE
# --------------------------------------------------
def extract_all(ocr_text: str):
    text = normalize_text(ocr_text)

    result = {}
    result.update(extract_cbc(text))
    result.update(extract_glucose_tsh(text))
    result.update(extract_nipt(text))
    result.update(extract_ultrasound(text))
    result.update(extract_urine(text))

    return result
