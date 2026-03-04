import { useEffect, useState } from "react"
import Sidebar from "../component/Sidebar"
import API from "../api/api"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function HighRiskPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await API.get("auth/high_risk")
        console.log(res.data)

        setPatients(res.data)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 space-y-6">

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#6D4EDB]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <h1 className="text-2xl font-semibold text-red-600">
          High Risk Pregnancies
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : patients.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border text-gray-500">
            No high-risk patients detected.
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
          <div
            key={patient.phone}
            className="bg-white p-5 rounded-xl border border-red-200 shadow-sm"
          >
            <h3 className="font-semibold text-gray-800">{patient.name}</h3>

            <p className="text-sm text-gray-500">
              Phone: {patient.phone}
            </p>

            <p className="text-sm text-red-600 font-medium mt-2">
              HIGH RISK
            </p>
          </div>
        ))}
          </div>
        )}

      </div>
    </div>
  )
}