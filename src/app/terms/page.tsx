import Link from 'next/link'

export const metadata = { title: 'Terms of Service — flavr.' }

export default function TermsPage() {
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="app-header">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="logo">flavr<span className="logo-dot">.</span></span>
        </Link>
      </div>

      <div className="content-scroll" style={{ padding: '20px 22px 40px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>
          Terms of Service
        </h1>

        <div style={{
          background: 'var(--tag-bg)', border: '0.5px solid var(--green)', borderRadius: 'var(--r-card)',
          padding: '16px 18px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 12.5, color: 'var(--green)', lineHeight: 1.6, margin: 0, fontFamily: 'Epilogue, sans-serif' }}>
            We&apos;re finalising our full Terms of Service. In the meantime, here&apos;s a summary of the basics —
            the complete legal document will replace this page shortly.
          </p>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, fontFamily: 'Epilogue, sans-serif', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Using flavr.</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              flavr. provides AI-generated recipes, meal plans, and nutrition tracking. Nutrition estimates
              (including from photos) are AI-generated approximations, not medical or dietary advice — use your
              judgement, especially around allergies, medical conditions, or specific dietary needs.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Your account</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              You&apos;re responsible for the accuracy of information you provide and for keeping your account
              secure. You can delete your account at any time from Account settings.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Subscriptions</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Premium is a recurring subscription, billed until cancelled. You can manage or cancel it any time
              from Account → Subscription.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Content</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Recipes, meal plans, and nutrition estimates are generated for your personal use. Don&apos;t submit
              photos or content you don&apos;t have the right to share.
            </p>
          </section>
          <section>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Contact</h2>
            <p style={{ margin: 0, color: 'var(--muted-dark)' }}>
              Questions about these terms? Reach us via Help &amp; Feedback in the app.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
