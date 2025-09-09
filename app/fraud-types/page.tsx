import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FraudTypesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">Fraud Types</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn about common fraud patterns to identify, report, and prevent losses.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            {[
              { title: "Investment Scams", desc: "Ponzi schemes, fake exchanges, and high-yield promises." },
              { title: "Romance Scams", desc: "Emotional manipulation to solicit funds and crypto." },
              { title: "Identity Theft", desc: "Account takeovers, SIM swaps, and impersonation." },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{item.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
