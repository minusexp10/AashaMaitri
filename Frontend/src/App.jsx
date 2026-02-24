import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Signup from "./pages/Signup"
import ProtectedRoute from "./component/ProtectedRoute"
import PatientsPage from "./pages/PatientPage"
import RegisterPatient from "./pages/RegisterPatient"
import UploadReports from "./pages/UploadReports"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={

            <Dashboard />

          }
        />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/register" element={<RegisterPatient />} />
        <Route path="/upload" element={<UploadReports />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App