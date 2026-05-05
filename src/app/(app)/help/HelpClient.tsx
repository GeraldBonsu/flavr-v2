'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/app/BottomNav'
import { createClient } from '@/lib/supabase/client'

type TicketType = 'billing' | 'technical' | 'feedback' | 'other'

interface Props {
  userId: string
  email: string
  name: string
}

const TICKET_TYPES: { value: TicketType; label: string }[] = [
  { value: 'billing',   label: 'Billing' },
  { value: 'technical', label: 'Technical' },
  { value: 'feedback',  label: 'Feedback' },
  { value: 'other',     label: 'Other' },
]

const FAQS = [
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Account → Subscription. You can cancel or manage your plan there at any time.',
  },
  {
    q: 'Why are my recipes not saving?',
    a: 'Make sure you\'re signed in. Recipes save automatically after generation. If the issue persists, try signing out and back in.',
  },
  {
    q: 'Can I change my dietary preferences?',
    a: 'Yes — go to Account → Update profile to update your goals, dietary restrictions, and cultural preferences.',
  },
  {
    q: 'How does the pantry work?',
    a: 'The pantry stores your go-to ingredients. They\'re pre-loaded when you visit the home screen. Items in the fridge section show expiry prompts after 3 days.',
  },
]

export default function HelpClient({ userId, email, name }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState<TicketType>('technical')
  const [nameVal, setNameVal] = useState(name)
  const [emailVal, setEmailVal] = useState(email)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    await supabase.from('support_tickets').insert({
      user_id: userId,
      type,
      name: nameVal,
      email: emailVal,
      message: message.trim(),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

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
        <span style={{
          fontSize: 12, fontWeight: 500, color: 'var(--text)',
          fontFamily: 'Epilogue, sans-serif',
        }}>
          Help &amp; feedback
        </span>
        <div style={{ width: 52 }} />
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {submitted ? (
          /* Success state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '40px 20px', gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--tag-bg)', border: '1px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              ✓
            </div>
            <div>
              <p style={{
                fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500,
                color: 'var(--text)', margin: '0 0 6px',
              }}>
                Message sent!
              </p>
              <p style={{
                fontSize: 12, color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                lineHeight: 1.6, margin: 0,
              }}>
                We&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              style={{
                marginTop: 8, padding: '12px 28px', borderRadius: 'var(--r-pill)',
                background: 'var(--text)', border: 'none', color: '#fff',
                fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
                cursor: 'pointer',
              }}
            >
              Back to account
            </button>
          </div>
        ) : (
          <>
            {/* Type selector */}
            <div>
              <div style={{
                fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                fontFamily: 'Epilogue, sans-serif', marginBottom: 10,
              }}>
                What&apos;s this about?
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {TICKET_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--r-pill)',
                      fontSize: 11.5, fontFamily: 'Epilogue, sans-serif', fontWeight: 500,
                      cursor: 'pointer',
                      border: type === t.value ? 'none' : '0.5px solid var(--border-strong)',
                      background: type === t.value ? 'var(--accent)' : '#fff',
                      color: type === t.value ? '#fff' : 'var(--muted-dark)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form card */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                background: '#fff', borderRadius: 'var(--r-card)',
                border: '0.5px solid var(--border)', overflow: 'hidden',
              }}>
                {/* Name */}
                <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <label style={{
                    display: 'block', fontSize: 9, fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif', marginBottom: 4,
                  }}>
                    Name
                  </label>
                  <input
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    required
                    style={{
                      width: '100%', border: 'none', outline: 'none',
                      fontSize: 13, fontFamily: 'Epilogue, sans-serif',
                      color: 'var(--text)', background: 'transparent',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ padding: '12px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <label style={{
                    display: 'block', fontSize: 9, fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif', marginBottom: 4,
                  }}>
                    Email
                  </label>
                  <input
                    value={emailVal}
                    onChange={e => setEmailVal(e.target.value)}
                    type="email"
                    required
                    style={{
                      width: '100%', border: 'none', outline: 'none',
                      fontSize: 13, fontFamily: 'Epilogue, sans-serif',
                      color: 'var(--text)', background: 'transparent',
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ padding: '12px 14px' }}>
                  <label style={{
                    display: 'block', fontSize: 9, fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif', marginBottom: 4,
                  }}>
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe your issue or feedback…"
                    style={{
                      width: '100%', border: 'none', outline: 'none',
                      fontSize: 13, fontFamily: 'Epilogue, sans-serif',
                      color: 'var(--text)', background: 'transparent',
                      resize: 'none', lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                style={{
                  padding: '14px', borderRadius: 'var(--r-pill)',
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  fontSize: 13, fontWeight: 500, fontFamily: 'Epilogue, sans-serif',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </form>

            {/* FAQ */}
            <div>
              <div style={{
                fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--muted)',
                fontFamily: 'Epilogue, sans-serif', marginBottom: 10,
              }}>
                Common questions
              </div>
              <div style={{
                background: '#fff', borderRadius: 'var(--r-card)',
                border: '0.5px solid var(--border)', overflow: 'hidden',
              }}>
                {FAQS.map((faq, i) => (
                  <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', padding: '13px 14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontSize: 12.5, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif',
                        flex: 1, paddingRight: 10,
                      }}>
                        {faq.q}
                      </span>
                      <span style={{ color: 'var(--muted)', fontSize: 14, flexShrink: 0 }}>
                        {openFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {openFaq === i && (
                      <div style={{
                        padding: '0 14px 13px', fontSize: 12,
                        color: 'var(--muted)', fontFamily: 'Epilogue, sans-serif',
                        lineHeight: 1.6,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
