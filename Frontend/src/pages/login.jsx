import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Login() {
  const [aashaId, setAashaId] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    console.log("Login attempt:", aashaId)
    // connect to backend later
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-white">
      
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-8 space-y-6">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-700">
              Maternal Health System
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Aasha Worker Login
            </p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Aasha ID"
              value={aashaId}
              onChange={(e) => setAashaId(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleLogin}
          >
            Login
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}
