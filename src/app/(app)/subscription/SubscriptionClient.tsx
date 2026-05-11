'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import BottomNav from '@/components/app/BottomNav'

interface Props {
  tier: 'free' | 'premium'
  name: string
}

const FREE_FEATURE_KEYS = [
  { key: 'feature_ai',        included: true },
  { key: 'feature_save',      included: true },
  { key: 'feature_pantry',    included: true },
  { key: 'feature_5day',      included: true },
  { key: 'feature_unlimited', included: false },
  { key: 'feature_pdf',       included: false },
  { key: 'feature_meal_plan', included: false },
  { key: 'feature_support',   included: false },
] as const

const PREMIUM_FEATURE_KEYS = [
  { key: 'feature_everything', included: true },
  { key: 'feature_unlimited',  included: true },
  { key: 'feature_pdf',        included: true },
  { key: 'feature_meal_plan',  included: true },
  { key: 'feature_support',    included: true },
  { key: 'feature_early',      included: true },
] as const

const GUIDES_PREVIEW = [
  {
    title: '30 High Protein Dinners',
    meta: 'Real meals with 30–50g protein',
    tag: 'Fitness',
    url: 'https://flavr-9927.myshopify.com/products/30-high-protein-dinners-real-meals-with-30-50g-protein-no-shakes-no-boring-food',
  },
  {
    title: 'The Mediterranean Reset',
    meta: '14-day meal plan for energy & health',
    tag: 'Health',
    url: 'https://flavr-9927.myshopify.com/products/the-mediterranean-reset-a-14-day-modern-meal-plan-for-energy-health-balance?variant=57985737490819',
  },
  {
    title: 'Weeknight Vegan',
    meta: '36 fast plant-based dinners in ≤22 min',
    tag: 'Plant-based',
    url: 'https://flavr-9927.myshopify.com/products/weeknight-vegan-36-fast-plant-based-dinners-ready-in-22-minutes-or-less?variant=57985732673923',
  },
]

const BUNDLE = {
  title: 'The Flavr Ultimate Bundle',
  meta: '3 cookbooks · save £10',
  tag: 'Bundle',
  url: 'https://flavr-9927.myshopify.com/products/the-flavr-ultimate-bundle-3-cookbooks-for-everyday-cooking-health-performance?variant=57985769996675',
}

const PREMIUM_URL = 'https://flavr-9927.myshopify.com/products/flavr-premium-access?variant=57985938325891'

export default function SubscriptionClient({ tier, name }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('subscription')
  const justUpgraded = searchParams.get('upgraded') === 'true'

  const isPremium = tier === 'premium' || justUpgraded

  type FeatureKey = Parameters<typeof t>[0]

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
          {t('back')}
        </button>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
          {t('title')}
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
              {t('current_plan')}
            </div>
            <div style={{
              fontFamily: 'Fraunces, serif', fontSize: 22,
              fontWeight: 500, color: isPremium ? '#fff' : 'var(--text)',
            }}>
              {isPremium ? t('premium') : t('free')}
            </div>
            {isPremium && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontFamily: 'Epilogue, sans-serif' }}>
                {t('all_unlocked')}
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
            {isPremium ? t('active') : t('free')}
          </div>
        </div>

        {/* Feature list */}
        <div>
          <div style={{
            fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--muted)',
            fontFamily: 'Epilogue, sans-serif', marginBottom: 10,
          }}>
            {isPremium ? t('whats_included') : t('your_plan')}
          </div>
          <div style={{
            background: '#fff', borderRadius: 'var(--r-card)',
            border: '0.5px solid var(--border)', overflow: 'hidden',
          }}>
            {(isPremium ? PREMIUM_FEATURE_KEYS : FREE_FEATURE_KEYS).map((f, i, arr) => (
              <div key={f.key} style={{
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
                  {t(f.key as FeatureKey)}
                </span>
                {!f.included && f.key === 'feature_pdf' && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, color: 'var(--accent)',
                    fontFamily: 'Epilogue, sans-serif', fontWeight: 600,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    {t('premium')}
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
            {t('pdf_guides_title')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GUIDES_PREVIEW.map(guide => (
              <div key={guide.title} style={{
                background: '#fff', borderRadius: 'var(--r-sm)',
                border: '0.5px solid var(--border)',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                      {guide.meta} · {guide.tag}
                    </div>
                  </div>
                </div>
                <div>
                  {isPremium ? (
                    <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600, fontFamily: 'Epilogue, sans-serif' }}>
                      {t('free_label')}
                    </span>
                  ) : (
                    <a
                      href={guide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 10, color: 'var(--accent)', fontWeight: 600,
                        fontFamily: 'Epilogue, sans-serif', textDecoration: 'none',
                      }}
                    >
                      {t('buy_label')}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Bundle card — always visible, separate purchase */}
            <a
              href={BUNDLE.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--text)', borderRadius: 'var(--r-sm)',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>
                  📦
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'Epilogue, sans-serif' }}>
                    {BUNDLE.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontFamily: 'Epilogue, sans-serif' }}>
                    {BUNDLE.meta}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 9.5, color: 'var(--accent)', fontWeight: 700,
                fontFamily: 'Epilogue, sans-serif', letterSpacing: '0.05em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                SAVE £10 →
              </span>
            </a>

            {!isPremium && (
              <p style={{
                fontSize: 11, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                fontStyle: 'italic', margin: 0, textAlign: 'center',
              }}>
                {t('store_note')}
              </p>
            )}
          </div>
        </div>

        {/* Success banner */}
        {justUpgraded && (
          <div style={{
            background: 'var(--tag-bg)', borderRadius: 'var(--r-card)',
            border: '1px solid var(--green)', padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, color: 'var(--green)', marginBottom: 2 }}>
                {t('welcome')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif' }}>
                {t('welcome_body')}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade CTA (free users only) */}
        {!isPremium && (
          <div style={{
            background: 'var(--green)', borderRadius: 'var(--r-card)',
            padding: '18px', display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>
                {t('upgrade_title')}
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', fontFamily: 'Epilogue, sans-serif', lineHeight: 1.6 }}>
                {t('upgrade_subtitle')}
              </div>
            </div>
            <a
              href={PREMIUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '13px', borderRadius: 'var(--r-pill)',
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
                textDecoration: 'none',
              }}
            >
              {t('upgrade_btn')}
            </a>
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
              {t('manage')}
            </span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif' }}>
              {t('coming_soon')}
            </span>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
