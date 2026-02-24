import { useState } from "react"
import axios from "../api/api"
import { useNavigate } from "react-router-dom"
import Sidebar from "../component/Sidebar"
import { ArrowLeft, UserPlus } from "lucide-react"

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
    }      else if(formData.father_blood_grp == ""){
        formData.father_blood_grp = null
        return
    }
      else if(formData.region == ""){
        formData.region = null
        return}
      else if(formData.no_kids == ""){
        formData.no_kids = null
        return}
      else if(formData.no_miscarriages == ""){
        formData.no_miscarriages = null
        return}

    try {

      setLoading(true)

    // Clean optional fields
    const cleanedData = {
      ...formData,
      region: formData.region || null,
      no_kids: formData.no_kids || null,
      no_miscarriages: formData.no_miscarriages || null,
      father_blood_grp: formData.father_blood_grp || null,
      mother_blood_grp: formData.mother_blood_grp || null,
      asha_id: ashaId
    }

    await axios.post("/auth/add_patient", cleanedData)

    navigate("/patients")

  } catch (err) {
    console.error(err)
    setError(err.response?.data?.message || "Registration failed.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex bg-[#F8F7FF]">

      <Sidebar />

      <div className="flex-1 p-4 md:p-8 space-y-8">

        {/* Header Section */}
        <div className="bg-linear-to-r from-[#EEE9FF] to-[#F9F7FF] 
                      p-6 rounded-2xl border border-gray-100 shadow-sm
                      flex flex-col gap-4">

          {/* Back Button */}
          <button
            onClick={() => navigate("/patients")}
            className="group flex items-center gap-2 text-sm text-gray-600 hover:text-[#6D4EDB] transition w-fit"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to Patients
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Register New Patient
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter maternal details carefully to ensure accurate tracking
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 
                   max-w-4xl space-y-8"
        >

          {/* Personal Details */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Patient Name *" name="name" value={formData.name} onChange={handleChange} />
              <Input label="Phone *" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Aadhaar *" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
              <Input label="Age *" name="age" type="number" value={formData.age} onChange={handleChange} />
            </div>
          </div>

          {/* Medical Details */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Medical & Family Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Region" name="region" value={formData.region} onChange={handleChange} />
              <Input label="Number of Kids" name="no_kids" type="number" value={formData.no_kids} onChange={handleChange} />
              <Input label="Number of Miscarriages" name="no_miscarriages" type="number" value={formData.no_miscarriages} onChange={handleChange} />
              <Input label="Mother Blood Group" name="mother_blood_grp" value={formData.mother_blood_grp} onChange={handleChange} />
              <Input label="Father Blood Group" name="father_blood_grp" value={formData.father_blood_grp} onChange={handleChange} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2
                       bg-linear-to-r from-[#7B5EEC] to-[#6D4EDB]
                       text-white px-6 py-3 rounded-xl
                       font-medium shadow-md
                       hover:shadow-lg
                       active:scale-[0.98]
                       transition-all duration-200
                       disabled:opacity-70"
            >
              <UserPlus size={18} />
              {loading ? "Registering..." : "Register Patient"}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-600">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-[#C8B6FF]
                   focus:border-transparent
                   transition duration-200"
      />
    </div>
  )
}