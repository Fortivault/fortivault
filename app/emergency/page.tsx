import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function EmergencyPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Emergency Assistance</h1>
            <p className="text-muted-foreground mb-4">
              If you believe an active fraud is in progress, contact your bank and local law enforcement immediately.
              Preserve all messages, receipts, and transaction IDs.
            </p>
            <p className="text-muted-foreground">For urgent Fortivault support, call +14582983729.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
