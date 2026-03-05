import { useNavigate } from "react-router-dom"
import Sidebar from "../component/Sidebar"
import { Plus, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import API from "../api/api"

export default function PatientsPage() {
  const navigate = useNavigate()

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get("/auth/get_patients")

        const normalized = (res.data || []).map((p) => ({
          ...p,
          risk_level: p.risk?.toLowerCase() || "prediction pending",
        }))

        setPatients(normalized)
      } catch (error) {
        console.error(error)
        setErrorMsg("Failed to load patients.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery)

    const matchesRisk =
      riskFilter === "all" || p.risk_level === riskFilter

    return matchesSearch && matchesRisk
  })

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar />

      <div className="flex-1 p-6 md:p-8 space-y-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#EEE9FF] to-[#F9F7FF]
          p-6 md:p-8
          rounded-2xl
          border border-gray-100
          shadow-sm
          flex flex-col md:flex-row
          md:items-center
          md:justify-between
          gap-6">

          <div className="space-y-3">

            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#6D4EDB]"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Patients Information
              </h1>

              <p className="text-sm text-gray-500">
                Manage and monitor all registered maternal patients
              </p>
            </div>

          </div>

          <button
            onClick={() => navigate("/patients/register")}
            className="w-full md:w-auto bg-gradient-to-r
              from-[#7B5EEC] to-[#6D4EDB]
              text-white px-6 py-3 rounded-xl
              font-medium shadow-md
              hover:shadow-lg active:scale-[0.98]
              transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Register Patient
          </button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <MiniStat title="Total" value={patients.length} />

          <MiniStat
            title="High Risk"
            value={patients.filter(p => p.risk_level === "high").length}
            color="text-red-500"
          />

          <MiniStat
            title="Medium Risk"
            value={patients.filter(p => p.risk_level === "medium").length}
            color="text-amber-500"
          />

          <MiniStat
            title="Low Risk"
            value={patients.filter(p => p.risk_level === "low").length}
            color="text-green-500"
          />

        </div>

        {/* Search + Filter */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between">

          <input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B6FF] w-full md:w-80"
          />

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-5 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
            <div>Name</div>
            <div>Phone</div>
            <div>Risk Level</div>
            <div>Last Visit</div>
            <div>Upload</div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500 text-sm">
              Loading patients...
            </div>

          ) : errorMsg ? (
            <div className="p-6 text-red-500 text-sm">
              {errorMsg}
            </div>

          ) : filteredPatients.length === 0 ? (
            <div className="p-6 text-gray-500 text-sm">
              No matching patients found.
            </div>

          ) : (
            filteredPatients.map((patient) => (
              <PatientRow
                key={patient.id}
                name={patient.name}
                phone={patient.phone}
                risk={patient.risk_level}
                date={
                  patient.record_date
                    ? new Date(patient.record_date).toLocaleDateString()
                    : "-"
                }
              />
            ))
          )}

        </div>

      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function MiniStat({ title, value, color = "text-[#6D4EDB]" }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-lg font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function PatientRow({ name, phone, risk, date }) {

  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)

  const normalizedRisk = risk?.toLowerCase()

  const riskColor =
    normalizedRisk === "high"
      ? "bg-red-100 text-red-600"
      : normalizedRisk === "medium"
      ? "bg-amber-100 text-amber-600"
      : normalizedRisk === "low"
      ? "bg-green-100 text-green-600"
      : "bg-gray-100 text-gray-500"

  const handleUpload = async () => {
    if (uploading) return

    try {
      setUploading(true)

      const res = await API.post("/auth/upload_patient", { phone })

      const reportId = res.data.reportId

      if (res.status === 200 && res.data.message === "OK") {
        localStorage.setItem("reportId", reportId)
        navigate("/upload")
      }

    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-t border-gray-100">

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-5 px-6 py-4 text-sm hover:bg-gray-50 transition">

        <div className="text-gray-700 font-medium">{name}</div>

        <div className="text-gray-500">{phone}</div>

        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {risk}
          </span>
        </div>

        <div className="text-gray-500">{date}</div>

        <div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-3 py-1 rounded-lg text-xs text-white transition
              ${uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#6D4EDB] hover:opacity-90"
              }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>

      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3 hover:bg-gray-50 transition">

        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-800">{name}</p>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {risk}
          </span>
        </div>

        <div className="text-sm text-gray-500 flex justify-between">
          <span>{phone}</span>
          <span>{date}</span>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`px-3 py-1 rounded-lg text-xs text-white transition
            ${uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#6D4EDB]"
            }`}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

      </div>

    </div>
  )
}