import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CTABanner } from "@/components/cta-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Handshake } from "lucide-react"

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Handshake className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Partnerships</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We collaborate with law enforcement, financial institutions, and cybersecurity firms to accelerate
              recovery and prevention.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Law Enforcement</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Coordinated evidence packages and chain-of-custody workflows to support investigations.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Banks & Exchanges</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Rapid freezing requests, compliance-ready case data, and risk intel sharing.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Security Vendors</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Threat intel integrations and case enrichment to improve recovery outcomes.
              </CardContent>
            </Card>
          </div>
        </section>

        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
