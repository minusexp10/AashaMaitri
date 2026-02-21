import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()
  const name = localStorage.getItem("asha_name")
  const ashaId = localStorage.getItem("asha_id")

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#F7F5FF] via-[#FFF6FA] to-[#EAF6F3] px-4 py-6">
    
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
        
        <div>
          <h1 className="text-2xl font-bold text-[#6D4EDB]">
            Welcome, {name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ASHA ID: {ashaId}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 sm:mt-0 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* Summary Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Patient Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value="24" />
          <StatCard title="High Risk" value="3" color="text-red-500" />
          <StatCard title="Medium Risk" value="6" color="text-amber-500" />
          <StatCard title="Follow Ups" value="4" color="text-blue-500" />
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Quick Actions
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <ActionButton
            text="Register New Patient"
            onClick={() => navigate("/register")}
          />

          <ActionButton
            text="Upload Reports"
            onClick={() => navigate("/upload")}
          />

          <ActionButton
            text="View All Patients"
            onClick={() => navigate("/patients")}
          />

          <ActionButton
            text="High Risk Cases"
            onClick={() => navigate("/high-risk")}
            color="bg-red-400 hover:bg-red-500"
          />
        </div>
      </div>

    </div>
  </div>
)
}

/* --- Components --- */

function StatCard({ title, value, color = "text-[#6D4EDB]" }) {
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  )
}

function ActionButton({ text, onClick, color = "bg-[#7B5EEC] hover:bg-[#6D4EDB]" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition duration-300 ${color}`}
    >
      {text}
    </button>
  )
}