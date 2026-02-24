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
    setFiles(e.target.files)
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

      // Create structured object
      const structuredData = {}
      expectedFields.forEach((field) => {
        structuredData[field] = backendData[field] ?? ""
      })

      setExtractedData(structuredData)

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

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#6D4EDB] transition">
            <UploadCloud className="mx-auto text-gray-400" size={28} />
            <p className="text-sm text-gray-500 mt-2">
              Click to upload multiple reports
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

        {/* Review Section */}
        {extractedData && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

            <h2 className="text-lg font-semibold text-gray-800">
              Review Extracted Values
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {expectedFields.map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-600 block mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>

                  <input
                    name={field}
                    value={extractedData[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C8B6FF]"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePredict}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition"
              >
                Predict Risk
              </button>
            </div>

            {riskResult && (
              <div className="bg-purple-50 text-purple-700 p-4 rounded-xl">
                Predicted Risk Level: <strong>{riskResult}</strong>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}