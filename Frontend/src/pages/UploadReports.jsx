import { useState } from "react"
import Sidebar from "../component/Sidebar"
import API from "../api/api"
import { ArrowLeft, UploadCloud } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function UploadReports() {
  const navigate = useNavigate()

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState("")
  const [riskResult, setRiskResult] = useState(null)

  // 🔹 Define expected medical fields (adjust according to ML model)
  const expectedFields = [
    "hemoglobin",
    "platelets",
    "blood_pressure",
    "sugar",
    "rbc",
    "wbc"
  ]


  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)

    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const handleUpload = async () => {
    if (!files.length) {
      setError("Please select at least one file.")
      return
    }

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("report", files[i])
    }

    try {
      setLoading(true)
      setError("")
      setRiskResult(null)

      const res = await API.post("/app/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      const backendData = res.data || {}

      if (!Object.keys(backendData).length) {
        setError("No medical values detected in report.")
        return
      }

      const flatData = {}

      Object.values(backendData).forEach((section) => {
        if (typeof section === "object") {
          Object.entries(section).forEach(([key, obj]) => {
            if (obj && typeof obj === "object" && "value" in obj) {
              flatData[key] = {
                value: obj.value,
                confidence: obj.confidence || "UNKNOWN"
              }
            }
          })
        }
      })

      // Manual fields (no confidence)
      const manualFields = [
        "weight",
        "total_pregnancies",
        "systolic_bp",
        "diastolic_bp",
        "bodytemp",
        "heartrate"
      ]

      manualFields.forEach((field) => {
        if (!(field in flatData)) {
          flatData[field] = {
            value: "",
            confidence: "MANUAL"
          }
        }
      })

      setExtractedData(flatData)

    } catch (err) {
      console.error(err)
      setError("Upload failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setExtractedData({
      ...extractedData,
      [e.target.name]: e.target.value
    })
  }

  const handlePredict = async () => {
    try {
      const numericData = {}

      Object.keys(extractedData).forEach((key) => {
        const value = extractedData[key]
        numericData[key] = isNaN(value) ? value : Number(value)
      })

      const res = await API.post("/predict-risk", numericData)

      setRiskResult(res.data.risk)

    } catch (err) {
      console.error(err)
      setError("Prediction failed.")
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-8">

        {/* Header */}
        <div className="bg-linear-to-r from-[#EEE9FF] to-[#F9F7FF] 
                        p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#6D4EDB] transition"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-semibold text-gray-800">
            Upload Reports
          </h1>

          <p className="text-sm text-gray-500">
            Upload lab reports to extract medical values using OCR
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#6D4EDB] transition group">
            <UploadCloud className="mx-auto text-gray-400 group-hover:text-[#6D4EDB]" size={28} />
            <p className="text-sm text-gray-500 mt-2">
              Click to upload multiple reports
            </p>
            <p className="text-xs text-gray-400">
              You can select multiple files at once
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-linear-to-r from-[#7B5EEC] to-[#6D4EDB] 
                       text-white px-6 py-3 rounded-xl font-medium 
                       shadow-md hover:shadow-lg transition 
                       disabled:opacity-60"
          >
            {loading ? "Processing..." : "Extract Data"}
          </button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-3 mt-4">

            <p className="text-sm font-medium text-gray-700">
              Uploaded Files ({files.length})
            </p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm"
                >
                  <span className="truncate max-w-[70%]">
                    {file.name}
                  </span>

                  <button
                    onClick={() => {
                      setFiles(files.filter((_, i) => i !== index))
                    }}
                    className="text-red-500 hover:text-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Section */}
        {extractedData && (
          <div className="space-y-8">

            {/* ---------- GENERIC VITALS ---------- */}
            <Section title="Patient Vitals (Manual Entry)">
              <Grid>
                <InputField name="weight" label="Weight (kg)" data={extractedData} setData={setExtractedData} />
                <InputField name="total_pregnancies" label="Total Pregnancies" data={extractedData} setData={setExtractedData} />
                <InputField name="systolic_bp" label="Systolic BP" data={extractedData} setData={setExtractedData} />
                <InputField name="diastolic_bp" label="Diastolic BP" data={extractedData} setData={setExtractedData} />
                <InputField name="bodytemp" label="Body Temperature" data={extractedData} setData={setExtractedData} />
                <InputField name="heartrate" label="Heart Rate" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            {/* ---------- CBC ---------- */}
            <Section title="CBC Report">
              <Grid>
                <InputField name="hemoglobin" label="Hemoglobin" data={extractedData} setData={setExtractedData} />
                <InputField name="wbc" label="WBC" data={extractedData} setData={setExtractedData} />
                <InputField name="rbc" label="RBC" data={extractedData} setData={setExtractedData} />
                <InputField name="platelets" label="Platelets" data={extractedData} setData={setExtractedData} />
                <InputField name="hct" label="HCT" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            {/* ---------- BLOOD GLUCOSE ---------- */}
            <Section title="Blood Glucose Report">
              <Grid>
                <InputField name="blood_glucose" label="Blood Glucose" data={extractedData} setData={setExtractedData} />
                <InputField name="tsh" label="TSH" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            {/* ---------- ULTRASOUND ---------- */}
            <Section title="Ultrasound Report">
              <Grid>
                <InputField name="fetal_position" label="Fetal Position" data={extractedData} setData={setExtractedData} />
                <InputField name="fetal_movement" label="Fetal Movement" data={extractedData} setData={setExtractedData} />
                <InputField name="fetal_heart_rate" label="Fetal Heart Rate" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            {/* ---------- URINE ---------- */}
            <Section title="Urine Report">
              <Grid>
                <InputField name="urine_transparency" label="Urine Transparency" data={extractedData} setData={setExtractedData} />
                <InputField name="urine_glucose" label="Urine Glucose" data={extractedData} setData={setExtractedData} />
                <InputField name="urine_protein" label="Urine Protein" data={extractedData} setData={setExtractedData} />
                <InputField name="urine_color" label="Urine Color" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            {/* ---------- NIPT ---------- */}
            <Section title="NIPT Report">
              <Grid>
                <InputField name="fetal_fraction" label="Fetal Fraction" data={extractedData} setData={setExtractedData} />
                <InputField name="trisomy_21" label="Trisomy 21" data={extractedData} setData={setExtractedData} />
                <InputField name="trisomy_18" label="Trisomy 18" data={extractedData} setData={setExtractedData} />
                <InputField name="trisomy_13" label="Trisomy 13" data={extractedData} setData={setExtractedData} />
              </Grid>
            </Section>

            <div className="flex justify-end">
              <button
                onClick={handlePredict}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition"
              >
                Predict Risk
              </button>
            </div>

          </div>
        )}

      </div>
    </div>

  )
}
function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  )
}

function InputField({ name, label, data, setData }) {

  const field = data[name] || { value: "", confidence: "UNKNOWN" }
  const value = field.value
  const confidence = field.confidence

  const isMedicalAbnormal = () => {
    if (name === "hemoglobin" && value && Number(value) < 11) return true
    if (name === "platelets" && value && Number(value) < 150) return true
    if (name === "blood_glucose" && value && Number(value) > 140) return true
    return false
  }

  const getConfidenceStyle = () => {
    if (confidence === "LOW") return "bg-red-100 text-red-600"
    if (confidence === "MEDIUM") return "bg-yellow-100 text-yellow-600"
    if (confidence === "HIGH") return "bg-green-100 text-green-600"
    if (confidence === "MANUAL") return "bg-blue-100 text-blue-600"
    return "bg-gray-100 text-gray-500"
  }

  const getBorderStyle = () => {
    if (confidence === "LOW") return "border-red-400 bg-red-50"
    if (confidence === "MEDIUM") return "border-yellow-400 bg-yellow-50"
    if (isMedicalAbnormal()) return "border-red-400 bg-red-50"
    return "border-gray-200"
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-600">
          {label}
        </label>

        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceStyle()}`}>
          {confidence}
        </span>
      </div>

      <input
        value={value}
        onChange={(e) =>
          setData({
            ...data,
            [name]: {
              ...field,
              value: e.target.value
            }
          })
        }
        className={`w-full px-4 py-2 rounded-xl text-sm border
          focus:ring-2 focus:ring-[#C8B6FF] transition
          ${getBorderStyle()}`}
      />
    </div>
  )
}