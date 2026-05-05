'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/app/BottomNav'

interface Props {
  tier: 'free' | 'premium'
  name: string
}

const FREE_FEATURES = [
  { label: 'AI recipe generation',        included: true },
  { label: 'Save recipes',                included: true },
  { label: 'Pantry tracking',             included: true },
  { label: '5 recipes / day',             included: true },
  { label: 'Unlimited recipes',           included: false },
  { label: 'PDF cooking guides (free)',   included: false },
  { label: 'Meal planning',               included: false },
  { label: 'Priority support',            included: false },
]

const PREMIUM_FEATURES = [
  { label: 'Everything in Free',          included: true },
  { label: 'Unlimited recipes',           included: true },
  { label: 'PDF cooking guides (free)',   included: true },
  { label: 'Meal planning',               included: true },
  { label: 'Priority support',            included: true },
  { label: 'Early access to new features',included: true },
]

const GUIDES_PREVIEW = [
  { title: 'West African Kitchen Essentials', pages: '24 pages', tag: 'Cooking' },
  { title: 'High-Protein Meal Prep Guide',    pages: '18 pages', tag: 'Fitness' },
  { title: 'Spice Blending Handbook',         pages: '32 pages', tag: 'Flavour' },
  { title: 'Budget Cooking: 30 Meals',        pages: '28 pages', tag: 'Budget' },
]

export default function SubscriptionClient({ tier, name }: Props) {
  const router = useRouter()
  const isPremium = tier === 'premium'
  const [showUpgradeInfo, setShowUpgradeInfo] = useState(false)

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', flexShrink: 0,
        borderBottom: '0.5px solid var(--border)',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 20,
            padding: '4px 12px', fontSize: 9, color: 'var(--muted)',
            fontFamily: 'Epilogue, sans-serif', cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
          Subscription
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Current plan badge */}
        <div style={{
          background: isPremium ? 'var(--green)' : '#fff',
          borderRadius: 'var(--r-card)',
          border: isPremium ? 'none' : '0.5px solid var(--border)',
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: 'Epilogue, sans-serif',
              color: isPremium ? 'rgba(255,255,255,0.65)' : 'var(--muted)',
              marginBottom: 4,
            }}>
              Current plan
            </div>
            <div style={{
              fontFamily: 'Fraunces, serif', fontSize: 22,
              fontWeight: 500, color: isPremium ? '#fff' : 'var(--text)',
            }}>
              {isPremium ? 'Premium' : 'Free'}
            </div>
            {isPremium && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontFamily: 'Epilogue, sans-serif' }}>
                All features unlocked
              </div>
            )}
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 'var(--r-pill)',
            background: isPremium ? 'var(--accent)' : 'var(--tag-bg)',
            color: isPremium ? '#fff' : 'var(--green)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', fontFamily: 'Epilogue, sans-serif',
          }}>
            {isPremium ? 'Active' : 'Free'}
          </div>
        </div>

        {/* Feature list */}
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)',
            fontFamily: 'Epilogue, sans-serif', marginBottom: 10,
          }}>
            {isPremium ? "What's included" : 'Your plan includes'}
          </div>
          <div style={{
            background: '#fff', borderRadius: 'var(--r-card)',
            border: '0.5px solid var(--border)', overflow: 'hidden',
          }}>
            {(isPremium ? PREMIUM_FEATURES : FREE_FEATURES).map((f, i, arr) => (
              <div key={f.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                opacity: f.included ? 1 : 0.45,
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: f.included ? 'var(--tag-bg)' : 'rgba(0,0,0,0.05)',
                  fontSize: 10,
                }}>
                  {f.included ? '✓' : '×'}
                </span>
                <span style={{
                  fontSize: 12.5, color: f.included ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'Epilogue, sans-serif',
                }}>
                  {f.label}
                </span>
                {!f.included && f.label.includes('PDF') && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, color: 'var(--accent)',
                    fontFamily: 'Epilogue, sans-serif', fontWeight: 600,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    Premium
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PDF Guides section */}
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)',
            fontFamily: 'Epilogue, sans-serif', marginBottom: 10,
          }}>
            PDF cooking guides
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GUIDES_PREVIEW.map(guide => (
              <div key={guide.title} style={{
                background: '#fff', borderRadius: 'var(--r-sm)',
                border: '0.5px solid var(--border)',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: isPremium ? 1 : 0.7,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: 'var(--tag-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    📄
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
                      {guide.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, fontFamily: 'Epilogue, sans-serif' }}>
                      {guide.pages} · {guide.tag}
                    </div>
                  </div>
                </div>
                <div>
                  {isPremium ? (
                    <span style={{
                      fontSize: 10, color: 'var(--green)', fontWeight: 600,
                      fontFamily: 'Epilogue, sans-serif',
                    }}>
                      Free ✓
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 10, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                    }}>
                      Buy →
                    </span>
                  )}
                </div>
              </div>
            ))}
            {!isPremium && (
              <p style={{
                fontSize: 11, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                fontStyle: 'italic', margin: 0, textAlign: 'center',
              }}>
                Upgrade for free access, or purchase individual guides from our store (coming soon).
              </p>
            )}
          </div>
        </div>

        {/* Upgrade CTA (free users only) */}
        {!isPremium && (
          <div style={{
            background: 'var(--green)', borderRadius: 'var(--r-card)',
            padding: '18px', display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div>
              <div style={{
                fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500,
                color: '#fff', marginBottom: 4,
              }}>
                Upgrade to Premium
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', fontFamily: 'Epilogue, sans-serif', lineHeight: 1.6 }}>
                Unlimited recipes, free PDF guides, and everything we add next.
              </div>
            </div>

            {!showUpgradeInfo ? (
              <button
                onClick={() => setShowUpgradeInfo(true)}
                style={{
                  padding: '13px', borderRadius: 'var(--r-pill)',
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Upgrade to Premium →
              </button>
            ) : (
              <div style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--r-sm)',
                padding: '14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>⏳</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: '#fff', marginBottom: 6 }}>
                  Payments coming soon
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'Epilogue, sans-serif', lineHeight: 1.6 }}>
                  We&apos;re finishing up secure payments. You&apos;ll be notified at{' '}
                  <span style={{ fontWeight: 600 }}>your registered email</span> the moment Premium launches.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium manage plan */}
        {isPremium && (
          <div style={{
            background: '#fff', borderRadius: 'var(--r-card)',
            border: '0.5px solid var(--border)', padding: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12.5, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
              Manage or cancel plan
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>
              Coming soon ›
            </span>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
