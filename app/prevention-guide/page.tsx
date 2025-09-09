import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PreventionGuidePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Prevention Guide</h1>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
              <li>Enable multi-factor authentication on all financial accounts.</li>
              <li>Verify domain names and payment addresses before sending funds.</li>
              <li>Be cautious of unsolicited investment opportunities and pressure tactics.</li>
              <li>Use hardware wallets and secure backups for crypto assets.</li>
              <li>Report suspicious activity immediately and preserve all evidence.</li>
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
