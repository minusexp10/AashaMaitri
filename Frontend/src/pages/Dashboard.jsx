import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Sidebar from "../component/Sidebar"
import {
  Search,
  Bell,
  LogOut,Menu
} from "lucide-react"


export default function Dashboard() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const name = localStorage.getItem("asha_name")
  const ashaId = localStorage.getItem("asha_id")

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

 return (
  <div className="min-h-screen flex bg-[#F8F7FF]">
  <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

  <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">

  {/* LEFT SECTION */}
  <div className="flex items-center gap-4">

    {/* Hamburger (mobile only) */}
    <Menu
      className="md:hidden cursor-pointer"
      onClick={() => setIsOpen(true)}
      size={22}
    />

    <div>
      <h1 className="text-lg md:text-xl font-semibold text-gray-800">
        Dashboard
      </h1>
      <p className="text-xs md:text-sm text-gray-500">
        Welcome back, {name}
      </p>
    </div>

  </div>

  {/* RIGHT SECTION */}
  <div className="flex items-center gap-3 md:gap-4">

    {/* Search (hide on small screens) */}
    <div className="relative hidden sm:block">
      <Search
        className="absolute left-3 top-2.5 text-gray-400"
        size={16}
      />
      <input
        placeholder="Search patients..."
        className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B6FF] w-48 md:w-64"
      />
    </div>

    <Bell className="text-gray-500 cursor-pointer" size={20} />

    {/* Logout text hidden on mobile */}
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition"
    >
      <LogOut size={18} />
      <span className="hidden md:inline">Logout</span>
    </button>

  </div>

</header>


      {/* Dashboard Content */}
      <main className="p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Patients" value="24" accent="bg-purple-100 text-purple-600" />
          <StatCard title="High Risk" value="3" accent="bg-red-100 text-red-500" />
          <StatCard title="Medium Risk" value="6" accent="bg-amber-100 text-amber-500" />
          <StatCard title="Follow Ups" value="4" accent="bg-blue-100 text-blue-500" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Patients
          </h2>

          <div className="space-y-3">
            <PatientRow name="Sunita Devi" risk="High" />
            <PatientRow name="Rekha Sharma" risk="Medium" />
            <PatientRow name="Pooja Patel" risk="Low" />
          </div>
        </div>

      </main>
    </div>
  </div>
)
}

/* --- Components --- */


function StatCard({ title, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <div className="flex items-center justify-between mt-3">
        <p className="text-2xl font-semibold text-gray-800">
          {value}
        </p>

        <div className={`px-3 py-1 rounded-full text-xs font-medium ${accent}`}>
          Updated
        </div>
      </div>
    </div>
  )
}

function PatientRow({ name, risk }) {
  const riskColor =
    risk === "High"
      ? "text-red-500"
      : risk === "Medium"
      ? "text-amber-500"
      : "text-green-500"

  return (
    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition">
      <p className="text-sm text-gray-700">{name}</p>
      <p className={`text-sm font-medium ${riskColor}`}>
        {risk} Risk
      </p>
    </div>
  )
}