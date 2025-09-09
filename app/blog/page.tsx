import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">Insights & Updates</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Research, case studies, and prevention tips.</p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Article {i}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">Coming soon.</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
