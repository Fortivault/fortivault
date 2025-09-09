import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Compliance</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fortivault adheres to global data protection and financial crime compliance standards.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">GDPR, CCPA, and SOC-aligned controls.</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AML & KYC</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Risk-based processes and audit trails.</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Incident Response</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">Coordinated disclosures and escalation paths.</CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
