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
def confidence(found, valid, had_comma=False):
    if found and valid and not had_comma:
        return "HIGH"
    if found and valid and had_comma:
        return "MEDIUM"
    if found and not valid:
        return "MEDIUM"
    return "LOW"


# --------------------------------------------------
# SAFE NUMBER EXTRACTION (COLLISION-PROOF)
# --------------------------------------------------
def extract_number_anchor(text, keyword_list, lookahead=6):
    words = text.split()

    keyword_tokens = [normalize_text(kw).split() for kw in keyword_list]

    for tokens in keyword_tokens:
        n = len(tokens)

        for i in range(len(words) - n + 1):
            # 1️⃣ Match keyword (single or multi-word)
            if words[i:i+n] == tokens:

                parts = []
                started = False  # 🔥 NEW: track numeric start

                # 2️⃣ Scan forward AFTER keyword
                for w in words[i+n:i+n+lookahead]:

                    # If numeric → start / continue collecting
                    if re.fullmatch(r"\d+(\.\d+)?", w):
                        parts.append(w)
                        started = True
                        continue

                    # 🔥 NEW: skip garbage BEFORE number starts
                    if not started:
                        continue

                    # Existing behavior: stop once number collection ends
                    break

                if parts:
                    value = float("".join(parts))
                    noisy = len(parts) > 1
                    return value, True, noisy

    return None, False, False



def safe_update(base, new):
    for key, value in new.items():
        if key not in base:
            base[key] = value
        else:
            # Do not overwrite existing valid values
            if base[key]["value"] is None and value["value"] is not None:
                base[key] = value
    return base

# --------------------------------------------------
# UNIT NORMALIZATION
# --------------------------------------------------
def normalize_platelets(value, text):
    if value is None:
        return None

    # Indian format: "1.8 lakh"
    if "lakh" in text:
        return value * 100

    # Standard lab format: 180000 → 180
    if value > 1000:
        return value / 1000

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

    # Hemoglobin
    hb, found, had_comma = extract_number_anchor(
        text,
        ["hemoglobin", "hb", "haemoglobin", "Hgb","hgb concentration", "mass concentration of hemoglobin"]
    )
    valid = hb is not None and 3 <= hb <= 20
    conf = confidence(found, valid, had_comma)
    data["hemoglobin"] = {
        "value": hb if valid else None,
        "confidence": conf
    }

    # WBC
    wbc, found, had_comma = extract_number_anchor(
        text,
        ["wbc", "leukocyte","total leukocyte count","wbc count","white blood cell count","leukocycte count","tlc"]
    )
    valid = wbc is not None and 1000 <= wbc <= 30000
    conf = confidence(found, valid, had_comma)
    data["wbc"] = {
        "value": wbc if valid else None,
        "confidence": conf
    }

    # RBC
    rbc, found, had_comma = extract_number_anchor(
        text,
        ["rbc","erythrocyte","total rbc count","rbc count","red blood cell count", "erythrocyte count"]
    )
    valid = rbc is not None and 2 <= rbc <= 7
    conf = confidence(found, valid, had_comma)
    data["rbc"] = {
        "value": rbc if valid else None,
        "confidence": conf
    }

    # Platelets
    platelets, found, had_comma = extract_number_anchor(
        text,
        ["platelet", "plt", "platelets","platelet count","plt Count","thrombocyte count","mpv"]
    )
    platelets = normalize_platelets(platelets, text)
    valid = platelets is not None and 150 <= platelets <= 400
    conf = confidence(found, valid, had_comma)
    data["platelets"] = {
        "value": platelets if valid else None,
        "confidence": conf
    }

    # HCT
    hct, found, had_comma = extract_number_anchor(
        text,
        ["hct", "hematocrit", "pcv","crit","evf"]
    )
    valid = hct is not None and 20 <= hct <= 60
    conf = confidence(found, valid, had_comma)
    data["hct"] = {
        "value": hct if valid else None,
        "confidence": conf
    }

    return data



# --------------------------------------------------
# BLOOD GLUCOSE & TSH EXTRACTION
# --------------------------------------------------
def extract_glucose_tsh(text):
    data = {}

    # Blood Glucose
    glucose, found, had_comma = extract_number_anchor(
        text,
        ["blood glucose", "glucose"]
    )
    valid = glucose is not None and 60 <= glucose <= 300
    conf = confidence(found, valid, had_comma)
    data["blood_glucose"] = {
        "value": glucose if valid else None,
        "confidence": conf
    }

    # TSH
    tsh, found, had_comma = extract_number_anchor(
        text,
        ["tsh", "thyroid stimulating hormone"]
    )
    valid = tsh is not None and 0.01 <= tsh <= 20
    conf = confidence(found, valid, had_comma)
    data["tsh"] = {
        "value": tsh if valid else None,
        "confidence": conf
    }

    return data


# --------------------------------------------------
# NIPT EXTRACTION
# --------------------------------------------------
def extract_nipt(text):
    data = {}

    # Fetal Fraction
    ff, found, had_comma = extract_number_anchor(
        text,
        ["fetal fraction", "ff"]
    )
    ff = normalize_fetal_fraction(ff)
    valid = ff is not None and 0 <= ff <= 1
    conf = confidence(found, valid, had_comma)

    data["fetal_fraction"] = {
        "value": ff if valid else None,
        "confidence": conf
    }

    # Trisomy extraction (unchanged – rule based)
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
        data[t.replace(" ", "_")] = {
            "value": value,
            "confidence": conf
        }

    return data

# --------------------------------------------------
# ULTRASOUND EXTRACTION
# --------------------------------------------------
def extract_ultrasound(text):
    data = {}

    # Estimated Fetal Weight
    efw, found, had_comma = extract_number_anchor(
        text,
        ["estimated fetal weight", "efw", "fetal weight"]
    )
    valid = efw is not None and 300 <= efw <= 5000
    conf = confidence(found, valid, had_comma)

    data["estimated_fetal_weight"] = {
        "value": efw if valid else None,
        "confidence": conf
    }

    # Fetal Heart Rate
    fhr, found, had_comma = extract_number_anchor(
        text,
        ["fetal heart rate", "fhr"]
    )
    valid = fhr is not None and 80 <= fhr <= 200
    conf = confidence(found, valid, had_comma)

    data["fetal_heart_rate"] = {
        "value": fhr if valid else None,
        "confidence": conf
    }

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
    elif (
        "reduced movement" in text
        or "absent movement" in text
        or "movement reduced" in text
    ):
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
# --------------------------------------------------
# REPORT TYPE DETECTION (CONTENT BASED)
# --------------------------------------------------
def detect_report_type_from_content(text: str):
    text = normalize_text(text)

    report_keywords = {
        "cbc": [
            "hemoglobin", "platelet", "wbc", "rbc",
            "hematocrit", "complete blood count", "pcv","hct"
        ],
        "ultrasound": [
            "fetal heart rate", "fetal movement",
            "estimated fetal weight", "efw",
            "presentation", "cephalic", "breech"
        ],
        "nipt": [
            "trisomy 21", "trisomy 18",
            "trisomy 13", "fetal fraction",
            "cell free dna"
        ],
        "urine": [
            "urine", "protein", "transparency",
            "color", "pus cells"
        ],
        "blood": [
            "blood glucose", "tsh",
            "thyroid stimulating hormone"
        ]
    }

    scores = {}

    for report_type, keywords in report_keywords.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[report_type] = score

    detected_type = max(scores, key=scores.get)

    if scores[detected_type] == 0:
        return "unknown"

    return detected_type


# --------------------------------------------------
# ROUTED EXTRACTION
# --------------------------------------------------
def extract_all(ocr_text: str):
    """
    This now performs content-based routing.
    Only the relevant extractor will run.
    """

    text = normalize_text(ocr_text)
    report_type = detect_report_type_from_content(text)

    if report_type == "cbc":
        return extract_cbc(text)

    elif report_type == "ultrasound":
        return extract_ultrasound(text)

    elif report_type == "nipt":
        return extract_nipt(text)

    elif report_type == "urine":
        return extract_urine(text)

    elif report_type == "blood":
        return extract_glucose_tsh(text)

    else:
        return {}


