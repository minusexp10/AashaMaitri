import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, AlertTriangle, FileText, X } from "lucide-react"

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <aside className="w-0 md:w-64 shrink-0">

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`
          bg-white border-r border-gray-100 p-6 flex flex-col
          h-screen w-64
          fixed md:static top-0 left-0 z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        {/* Mobile Header */}
        <div className="flex justify-between items-center md:hidden mb-6">
          <h2 className="text-xl font-bold text-[#6D4EDB]">
            Aasha Maitri
          </h2>
          <X onClick={() => setIsOpen(false)} className="cursor-pointer" />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-10">
          <h2 className="text-2xl font-bold text-[#6D4EDB]">
            Aasha Maitri
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Maternal Health System
          </p>
        </div>

        <nav className="space-y-2 text-sm">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active={isActive("/dashboard")}
            onClick={() => handleNavigate("/dashboard")}
          />

          <SidebarItem
            icon={<Users size={18} />}
            text="Patients Information"
            active={isActive("/patients")}
            onClick={() => handleNavigate("/patients")}
          />

          <SidebarItem
            icon={<FileText size={18} />}
            text="Upload Reports"
            active={isActive("/upload")}
            onClick={() => handleNavigate("/upload")}
          />

          <SidebarItem
            icon={<AlertTriangle size={18} />}
            text="High Risk Cases"
            active={isActive("/high-risk")}
            onClick={() => handleNavigate("/high-risk")}
          />

        </nav>

      </div>
    </aside>
  )
}

function SidebarItem({ icon, text, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
        ${active
          ? "bg-[#F3F0FF] text-[#6D4EDB] font-medium"
          : "text-gray-600 hover:bg-gray-50"}`}
    >
      {icon}
      {text}
    </div>
  )
}