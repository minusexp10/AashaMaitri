import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Sidebar from "../component/Sidebar"
import { Search, Bell, LogOut, Menu } from "lucide-react"
import { useTranslation } from "react-i18next"
import API from "../api/api"

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const name = localStorage.getItem("asha_name")

  const handleLogout = () => {
    localStorage.clear()
    navigate("/")
  }

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get("/auth/get_patients")
        setPatients(res.data || [])
      } catch (err) {
        console.error("Failed to fetch patients", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  )

  const highRisk = patients.filter(p => p.risk?.toUpperCase() === "HIGH").length
  const mediumRisk = patients.filter(p => p.risk?.toUpperCase() === "MEDIUM").length
  const lowRisk = patients.filter(p => p.risk?.toUpperCase() === "LOW").length

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between">

          <div className="flex items-center gap-4">

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

          <div className="flex items-center gap-4">

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />

              <input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B6FF] w-48 md:w-64"
              />
            </div>

            <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" size={20} />

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
        <main className="p-6 md:p-8 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <StatCard
              title="Total Patients"
              value={patients.length}
              accent="bg-purple-100 text-purple-600"
            />

            <StatCard
              title="High Risk"
              value={highRisk}
              accent="bg-red-100 text-red-500"
            />

            <StatCard
              title="Medium Risk"
              value={mediumRisk}
              accent="bg-amber-100 text-amber-500"
            />

            <StatCard
              title="Low Risk"
              value={lowRisk}
              accent="bg-green-100 text-green-500"
            />

          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Recent Patients
            </h2>

            <div className="space-y-3">

              {loading ? (
                <p className="text-sm text-gray-500">Loading patients...</p>
              ) : filteredPatients.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No patients registered yet.
                </p>
              ) : (
                filteredPatients.slice(0, 5).map((p) => (
                  <PatientRow
                    key={p.id}
                    name={p.name}
                    risk={p.risk || "Prediction Pending"}
                  />
                ))
              )}

            </div>

          </div>

        </main>

      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function StatCard({ title, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">

      <p className="text-sm text-gray-500">
        {title}
      </p>

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

  const normalizedRisk = risk?.toUpperCase()

  const riskColor =
    normalizedRisk === "HIGH"
      ? "text-red-500"
      : normalizedRisk === "MEDIUM"
        ? "text-amber-500"
        : normalizedRisk === "LOW"
          ? "text-green-500"
          : "text-gray-400"

  return (
    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition">

      <p className="text-sm text-gray-700">
        {name}
      </p>

      <p className={`text-sm font-medium ${riskColor}`}>
        {risk}
      </p>

    </div>
  )
}