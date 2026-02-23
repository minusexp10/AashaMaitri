import { useNavigate } from "react-router-dom"
import Sidebar from "../component/Sidebar"
import { Plus, ArrowLeft } from "lucide-react"
export default function PatientsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar />

      <div className="flex-1 p-8 space-y-8">

        {/* Header Section */}
        <div className="bg-linear-to-r from-[#EEE9FF] to-[#F9F7FF] 
          p-6 md:p-8 
          rounded-2xl 
          border border-gray-100 
          shadow-sm 
          flex flex-col md:flex-row 
          md:items-center 
          md:justify-between 
          gap-6">

          {/* Left Side: Back + Text */}
          <div className="space-y-3">

            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#6D4EDB] transition"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>

            {/* Text Section */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Patients Information
              </h1>
              <p className="text-sm md:text-base text-gray-500 max-w-md">
                Manage and monitor all registered maternal patients
              </p>
            </div>

          </div>

          {/* Responsive CTA (UNCHANGED STYLE) */}
          <button
            onClick={() => navigate("/patients/register")}
            className="w-full md:w-auto bg-linear-to-r 
               from-[#7B5EEC] to-[#6D4EDB]
               text-white px-6 py-3 rounded-xl
               font-medium shadow-md
               hover:shadow-lg active:scale-[0.98]
               transition-all duration-200
               flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Register Patient
          </button>

        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat title="Total" value="24" />
          <MiniStat title="High Risk" value="3" color="text-red-500" />
          <MiniStat title="Medium Risk" value="6" color="text-amber-500" />
          <MiniStat title="Low Risk" value="15" color="text-green-500" />
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <input
            placeholder="Search by name or phone..."
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B6FF] w-full md:w-80"
          />

          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none">
            <option>All Risk Levels</option>
            <option>High Risk</option>
            <option>Medium Risk</option>
            <option>Low Risk</option>
          </select>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-4 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600">
            <div>Name</div>
            <div>Phone</div>
            <div>Risk Level</div>
            <div>Last Visit</div>
          </div>

          <PatientRow name="Sunita Devi" phone="9876543210" risk="High" date="12 Feb 2026" />
          <PatientRow name="Rekha Sharma" phone="9123456780" risk="Medium" date="10 Feb 2026" />
          <PatientRow name="Pooja Patel" phone="9988776655" risk="Low" date="08 Feb 2026" />

        </div>

      </div>
    </div>
  )
}


function MiniStat({ title, value, color = "text-[#6D4EDB]" }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-lg font-semibold mt-1 ${color}`}>
        {value}
      </p>
    </div>
  )
}

function PatientRow({ name, phone, risk, date }) {
  const riskColor =
    risk === "High"
      ? "bg-red-100 text-red-600"
      : risk === "Medium"
      ? "bg-amber-100 text-amber-600"
      : "bg-green-100 text-green-600"

  return (
    <div className="border-t border-gray-100">

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-4 px-6 py-4 text-sm hover:bg-gray-50 transition">
        <div className="text-gray-700">{name}</div>
        <div className="text-gray-500">{phone}</div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {risk}
          </span>
        </div>
        <div className="text-gray-500">{date}</div>
      </div>

      {/* Mobile Layout */}
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

      </div>

    </div>
  )
}