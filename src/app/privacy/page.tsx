import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — flavr.' }

export default function PrivacyPage() {
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="app-header">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="logo">flavr<span className="logo-dot">.</span></span>
        </Link>
      </div>

      <div className="content-scroll" style={{ padding: '20px 22px 40px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
          Privacy Policy
        </h1>

        <div style={{
          background: 'var(--tag-bg)', border: '0.5px solid var(--green)', borderRadius: 'var(--r-card)',
          padding: '16px 18px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 12.5, color: 'var(--green)', lineHeight: 1.6, margin: 0, fontFamily: 'Epilogue, sans-serif' }}>
            We&apos;re finalising our full Privacy Policy. In the meantime, here&apos;s an accurate summary of what
            we collect and why — the complete legal document will replace this page shortly.
          </p>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, fontFamily: 'Epilogue, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>What we collect</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Account details (name, email), profile and fitness information you choose to provide (age, weight,
              height, activity level, goals), food and nutrition data you log (meals, calories, macros, pantry
              items, saved recipes), and photos you submit for meal analysis.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>How we use it</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              To generate recipes and meal plans tailored to you, estimate calories/macros from photos or
              descriptions you submit, track your progress over time, and process subscription payments.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Who we share it with</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Supabase (account and data storage), Anthropic (processes meal photos/descriptions you submit to
              estimate nutrition), and Stripe (payment processing for subscriptions). We do not sell your data.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Your choices</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              You can update or delete your data at any time from Account settings, including permanently deleting
              your account and all associated data.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Contact</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Questions about this policy or your data? Reach us via Help &amp; Feedback in the app.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
