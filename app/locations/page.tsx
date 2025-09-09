import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LocationsPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">Locations</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { city: "New York", region: "USA" },
                { city: "London", region: "UK" },
                { city: "Singapore", region: "APAC" },
              ].map((loc) => (
                <Card key={loc.city}>
                  <CardHeader>
                    <CardTitle>
                      {loc.city}, {loc.region}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">By appointment only.</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
