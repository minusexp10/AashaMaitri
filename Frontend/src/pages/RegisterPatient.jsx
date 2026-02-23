import { useState } from "react"
import axios from "../api/api"
import { useNavigate } from "react-router-dom"
import Sidebar from "../component/Sidebar"

export default function RegisterPatient() {
  const navigate = useNavigate()

  const ashaId = localStorage.getItem("asha_id")

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    aadhaar: "",
    age: "",
    region: "",
    no_kids: "",
    no_miscarriages: "",
    mother_blood_grp: "",
    father_blood_grp: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Required validation
    if (!formData.name || !formData.phone || !formData.aadhaar || !formData.age) {
      setError("Please fill all required fields.")
      return
    }

    try {
      setLoading(true)

     await axios.post("/patients/register", formData)

      navigate("/patients")

    } catch (err) {
      setError("Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar />

      <div className="flex-1 p-8">

        <h1 className="text-xl font-semibold text-gray-800 mb-6">
          Register New Patient
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl space-y-6"
        >

          <Input label="Patient Name *" name="name" value={formData.name} onChange={handleChange} />
          <Input label="Phone *" name="phone" value={formData.phone} onChange={handleChange} />
          <Input label="Aadhaar *" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
          <Input label="Age *" name="age" type="number" value={formData.age} onChange={handleChange} />

          <Input label="Region" name="region" value={formData.region} onChange={handleChange} />
          <Input label="Number of Kids" name="no_kids" type="number" value={formData.no_kids} onChange={handleChange} />
          <Input label="Number of Miscarriages" name="no_miscarriages" type="number" value={formData.no_miscarriages} onChange={handleChange} />
          <Input label="Mother Blood Group" name="mother_blood_grp" value={formData.mother_blood_grp} onChange={handleChange} />
          <Input label="Father Blood Group" name="father_blood_grp" value={formData.father_blood_grp} onChange={handleChange} />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-[#6D4EDB] text-white px-6 py-2 rounded-lg text-sm hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Patient"}
          </button>

        </form>

      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8B6FF]"
      />
    </div>
  )
}