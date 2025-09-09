import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Support Center</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> support@fortivault.com
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Line</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +14582983729
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
