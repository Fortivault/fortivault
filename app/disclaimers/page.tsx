import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Disclaimers</h1>
            <p className="text-muted-foreground mb-4">
              Fortivault provides best-effort recovery services. Outcomes depend on case facts, jurisdiction, and
              third-party cooperation. Nothing on this site constitutes legal advice.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Timeframes and success rates vary by case complexity.</li>
              <li>We recommend filing police reports and preserving evidence.</li>
              <li>Fees are disclosed before engagement and may differ by service.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
