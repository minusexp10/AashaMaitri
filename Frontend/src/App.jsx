import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-700 mb-6">
          Maternal Health
        </h2>
        <ul className="space-y-4 text-gray-700">
          <li>Dashboard</li>
          <li>Upload Reports</li>
          <li>Risk Prediction</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold text-gray-800">
          Patient Dashboard
        </h1>

        {/* Upload Section */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Upload Reports</h2>
              <p className="text-sm text-gray-500">
                Upload CBC, Ultrasound, NIPT, Urine reports
              </p>
            </div>
            <Button>Upload Files</Button>
          </CardContent>
        </Card>

        {/* Extracted Values */}
        <Card>
          <CardContent className="p-6 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Hemoglobin</p>
              <p className="text-xl font-semibold">12.8 g/dL</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">WBC</p>
              <p className="text-xl font-semibold">5100</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Platelets</p>
              <p className="text-xl font-semibold">180</p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Section */}
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <h2 className="text-lg font-medium">Overall Risk</h2>
            <Badge className="bg-red-500">HIGH</Badge>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

