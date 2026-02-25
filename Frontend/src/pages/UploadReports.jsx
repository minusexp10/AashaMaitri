import { useState } from "react"
import Sidebar from "../component/Sidebar"
import API from "../api/api"
import { ArrowLeft, UploadCloud, FileText, Trash } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function UploadReports() {
  const navigate = useNavigate()

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState("")
  const [riskResult, setRiskResult] = useState(null)

  const expectedFields = [
    "hemoglobin",
    "platelets",
    "blood_pressure",
    "sugar",
    "rbc",
    "wbc"
  ]

  // FIX 1: Append new files instead of replacing
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)

    setFiles((prev) => [...prev, ...selected])
  }

  const removeFile = (index) => {
    const updated = [...files]
    updated.splice(index, 1)
    setFiles(updated)
  }

  // FIX 2 + 3: Proper FormData with filenames, no manual headers
  const handleUpload = async () => {
    if (!files.length) {
      setError("Please select at least one file.")
      return
    }

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("report", files[i], files[i].name)  // IMPORTANT
    }

    try {
      setLoading(true)
      setError("")
      setRiskResult(null)

      const res = await API.post("/app/upload", formData)  // NO HEADERS MANUALLY

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
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-semibold text-gray-800">Upload Reports</h1>
          <p className="text-sm text-gray-500">Upload lab reports to extract medical values using OCR</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#6D4EDB] transition">
            <UploadCloud className="mx-auto text-gray-400" size={28} />
            <p className="text-sm text-gray-500 mt-2">Click to upload multiple reports</p>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* SHOW FILE LIST */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileText size={16} className="text-purple-600" />
                    {file.name}
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

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

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Existing extracted-data UI rendered here */}
        {/* unchanged */}
      </div>
    </div>
  )
}