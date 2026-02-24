import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/api"

export default function Signup() {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const validate = () => {
        if (name.length < 3) {
            return "Name must be at least 3 characters"
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return "Enter a valid 10-digit phone number"
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters"
        }

        return ""
    }

    const handleSignup = async () => {
        const validationError = validate()
        if (validationError) {
            setError(validationError)
            return
        }

        try {
            setLoading(true)
            setError("")

            await API.post("/auth/signup", {
                name,
                phone,
                password
            })

            navigate("/")

        } catch (error) {
            setError(
                error.response?.data?.message || "Signup failed"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F7F5FF] via-[#FFF0F6] to-[#E6F4F1] px-4">

            <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-white/40 p-8 rounded-2xl shadow-2xl">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#6D4EDB]">
                        Create ASHA Account
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Register to access maternal health dashboard
                    </p>
                </div>

                <div className="space-y-4">

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8B6FF]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8B6FF]"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#C8B6FF]"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg transition ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#7B5EEC] text-white hover:bg-[#6D4EDB]"
                        }`}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-3">
                        Already have an account?{" "}
                        <span
                            onClick={() => navigate("/")}
                            className="text-[#6D4EDB] font-semibold cursor-pointer hover:underline"
                        >
                            Login
                        </span>
                    </p>

                    <p className="text-center text-xs text-gray-500 mt-3">
                        Empowering safe motherhood through technology
                    </p>

                </div>
            </div>
        </div>
    )
}