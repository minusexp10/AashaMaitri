import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/api"

export default function Login() {
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const validate = () => {
        if (!/^[0-9]{10}$/.test(phone)) {
            return "Enter a valid 10-digit phone number"
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters"
        }

        return ""
    }

    const handleLogin = async () => {
        const validationError = validate()
        if (validationError) {
            setError(validationError)
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await API.post("/auth/login", {
                phone,
                password
            })

            localStorage.setItem("token", response.data.token)
            localStorage.setItem("asha_id", response.data.asha_id)
            localStorage.setItem("asha_name", response.data.name)

            navigate("/dashboard")

        } catch (error) {
            setError(
                error.response?.data?.message || "Invalid phone or password"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F7F5FF] via-[#FFF0F6] to-[#E6F4F1] px-4">

            <div className="w-full max-w-md backdrop-blur-md bg-white/70 border border-white/40 p-8 rounded-2xl shadow-2xl">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-[#6D4EDB] tracking-tight">
                        AashaMaitri
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Tech-Enabled Maternal Health Platform
                    </p>
                </div>

                <div className="space-y-4">

                    <div>
                        <label className="text-sm text-gray-700 font-medium">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8B6FF]"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8B6FF]"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className={`w-full font-semibold py-2.5 rounded-lg shadow-md transition duration-300 ${
                            loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#7B5EEC] hover:bg-[#6D4EDB] text-white"
                        }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        New ASHA worker?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-[#6D4EDB] font-semibold cursor-pointer hover:underline"
                        >
                            Create Account
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