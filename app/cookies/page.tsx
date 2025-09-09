import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Cookies</h1>
            <p className="text-muted-foreground mb-4">
              We use essential and analytics cookies to improve service quality. You can control cookies through your
              browser settings.
            </p>
            <p className="text-muted-foreground">We do not sell personal data.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
