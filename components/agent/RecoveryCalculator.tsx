import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calculator,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Percent,
} from "lucide-react"

interface CalculationResult {
  probability: number
  estimatedAmount: number
  timeframe: string
  riskLevel: "low" | "medium" | "high"
  factors: {
    name: string
    impact: number
    description: string
  }[]
}

export function RecoveryCalculator() {
  const [formData, setFormData] = useState({
    fraudType: "",
    amount: "",
    timeSinceIncident: "",
    paymentMethod: "",
    hasCommunication: false,
    hasEvidence: false,
  })
  const [result, setResult] = useState<CalculationResult | null>(null)

  const fraudTypes = [
    "Cryptocurrency Scam",
    "Investment Fraud",
    "Romance Scam",
    "Business Email Compromise",
    "Identity Theft",
    "Online Shopping Fraud",
  ]

  const paymentMethods = [
    "Cryptocurrency",
    "Wire Transfer",
    "Credit Card",
    "Bank Transfer",
    "Payment App",
    "Gift Cards",
  ]

  const calculateRecovery = () => {
    // This is a simplified calculation model
    let baseProbability = 50
    let impactFactors = []

    // Fraud type impact
    switch (formData.fraudType) {
      case "Credit Card Fraud":
        baseProbability += 20
        impactFactors.push({
          name: "Fraud Type",
          impact: 20,
          description: "Credit card fraud has established recovery procedures",
        })
        break
      case "Cryptocurrency Scam":
        baseProbability -= 15
        impactFactors.push({
          name: "Fraud Type",
          impact: -15,
          description: "Cryptocurrency transactions are harder to reverse",
        })
        break
      default:
        impactFactors.push({
          name: "Fraud Type",
          impact: 0,
          description: "Standard case type with average recovery rate",
        })
    }

    // Time impact
    const timeInDays = parseInt(formData.timeSinceIncident)
    if (timeInDays <= 7) {
      baseProbability += 15
      impactFactors.push({
        name: "Time Since Incident",
        impact: 15,
        description: "Recent incident increases recovery chances",
      })
    } else if (timeInDays <= 30) {
      baseProbability += 5
      impactFactors.push({
        name: "Time Since Incident",
        impact: 5,
        description: "Moderate time frame affects recovery potential",
      })
    } else {
      baseProbability -= 10
      impactFactors.push({
        name: "Time Since Incident",
        impact: -10,
        description: "Extended time reduces recovery likelihood",
      })
    }

    // Evidence impact
    if (formData.hasEvidence) {
      baseProbability += 15
      impactFactors.push({
        name: "Evidence Available",
        impact: 15,
        description: "Supporting evidence improves recovery chances",
      })
    }

    // Communication impact
    if (formData.hasCommunication) {
      baseProbability += 10
      impactFactors.push({
        name: "Communication Records",
        impact: 10,
        description: "Communication history aids investigation",
      })
    }

    // Calculate estimated amount
    const totalAmount = parseFloat(formData.amount)
    const estimatedAmount = (totalAmount * baseProbability) / 100

    // Determine risk level
    let riskLevel: "low" | "medium" | "high"
    if (baseProbability >= 70) riskLevel = "low"
    else if (baseProbability >= 40) riskLevel = "medium"
    else riskLevel = "high"

    // Determine timeframe
    let timeframe
    if (baseProbability >= 70) timeframe = "2-4 weeks"
    else if (baseProbability >= 40) timeframe = "1-3 months"
    else timeframe = "3-6 months"

    // Ensure probability is between 0 and 100
    baseProbability = Math.min(Math.max(baseProbability, 0), 100)

    setResult({
      probability: baseProbability,
      estimatedAmount,
      timeframe,
      riskLevel,
      factors: impactFactors,
    })
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-500"
    if (probability >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "high":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fraudType">Type of Fraud</Label>
            <Select
              value={formData.fraudType}
              onValueChange={(value) =>
                setFormData({ ...formData, fraudType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fraud type" />
              </SelectTrigger>
              <SelectContent>
                {fraudTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Lost</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeSinceIncident">
              Days Since Incident
            </Label>
            <Input
              id="timeSinceIncident"
              type="number"
              value={formData.timeSinceIncident}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeSinceIncident: e.target.value,
                })
              }
              placeholder="Number of days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) =>
                setFormData({ ...formData, paymentMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Additional Factors</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasEvidence}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasEvidence: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                Has Evidence
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasCommunication}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasCommunication: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                Has Communication Records
              </label>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={calculateRecovery}
            disabled={
              !formData.fraudType ||
              !formData.amount ||
              !formData.timeSinceIncident ||
              !formData.paymentMethod
            }
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Recovery Probability
          </Button>
        </CardContent>
      </Card>

      {/* Results Display */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              {/* Probability Display */}
              <div className="text-center p-6 rounded-lg bg-secondary">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recovery Probability</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span
                      className={`text-4xl font-bold ${getProbabilityColor(
                        result.probability
                      )}`}
                    >
                      {Math.round(result.probability)}%
                    </span>
                    <Percent className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <Progress
                  value={result.probability}
                  className="h-2 mt-4"
                />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium mb-1">
                        Estimated Recovery
                      </p>
                      <p className="text-2xl font-bold">
                        ${Math.round(result.estimatedAmount).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium mb-1">
                        Estimated Timeframe
                      </p>
                      <p className="text-2xl font-bold">{result.timeframe}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium mb-1">Risk Level</p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskBadgeColor(
                          result.riskLevel
                        )}`}
                      >
                        {result.riskLevel}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Factors */}
              <div className="space-y-4">
                <h4 className="font-medium">Impact Factors</h4>
                <div className="space-y-2">
                  {result.factors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-secondary"
                    >
                      {factor.impact >= 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{factor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {factor.description}
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            factor.impact >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          Impact: {factor.impact >= 0 ? "+" : ""}
                          {factor.impact}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-center text-muted-foreground">
              <div>
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No calculation performed</p>
                <p className="text-sm">
                  Fill in the form and calculate to see results
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}