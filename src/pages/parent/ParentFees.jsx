import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getChildrenOfParent, getFees } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  CreditCard, AlertTriangle, CheckCircle, Clock, X,
  Shield, Lock, Smartphone, Building2, ChevronRight,
  ArrowLeft, Loader2, BadgeCheck, Receipt
} from 'lucide-react'

// ── Payment Gateway Modal ─────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    icon: CreditCard,
    desc: 'Visa, Mastercard, RuPay',
    color: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-950/30',
  },
  {
    id: 'upi',
    label: 'UPI',
    icon: Smartphone,
    desc: 'GPay, PhonePe, Paytm, BHIM',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: Building2,
    desc: 'All major banks supported',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
]

function PaymentModal({ fee, onClose, onSuccess }) {
  const [step, setStep]       = useState('method')   // method | details | processing | success
  const [method, setMethod]   = useState(null)
  const [form, setForm]       = useState({ card: '', expiry: '', cvv: '', name: '', upi: '' })
  const [bank, setBank]       = useState('SBI')
  const [error, setError]     = useState('')

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4)
    return d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d
  }

  const handlePay = (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (method === 'card') {
      if (form.card.replace(/\s/g,'').length < 16) { setError('Enter a valid 16-digit card number'); return }
      if (form.expiry.length < 5) { setError('Enter a valid expiry date'); return }
      if (form.cvv.length < 3) { setError('Enter a valid CVV'); return }
      if (!form.name.trim()) { setError('Enter the cardholder name'); return }
    }
    if (method === 'upi') {
      if (!form.upi.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi)'); return }
    }

    // Simulate processing
    setStep('processing')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onSuccess(fee.id)
        onClose()
      }, 2500)
    }, 2200)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface dark:bg-[#0D1117] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl
        border-0 sm:border border-border/60 dark:border-[#1a2235]
        shadow-2xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)]
        slide-up overflow-hidden">

        {/* ── Header ── */}
        {step !== 'processing' && step !== 'success' && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 dark:border-[#1a2235]">
            <div className="flex items-center gap-2.5">
              {step === 'details' && (
                <button onClick={() => setStep('method')} className="btn-ghost p-1.5 w-8 h-8 min-w-0 min-h-0 mr-1">
                  <ArrowLeft size={15} />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center sidebar-brand-gradient">
                <Lock size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9]">Secure Payment</p>
                <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">256-bit SSL encrypted</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost p-2 w-8 h-8 min-w-0 min-h-0">
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Amount banner ── */}
        {(step === 'method' || step === 'details') && (
          <div className="mx-5 mt-4 px-4 py-3 rounded-xl bg-surface-3 dark:bg-[#0f1929] border border-border/40 dark:border-[#1a2235]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-4 dark:text-[#3d5070] font-medium uppercase tracking-wider">Paying for</p>
                <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0] mt-0.5">{fee.term}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-4 dark:text-[#3d5070] font-medium uppercase tracking-wider">Amount</p>
                <p className="text-[20px] font-bold text-ink dark:text-[#F1F5F9]">₹{fee.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Choose method ── */}
        {step === 'method' && (
          <div className="p-5 space-y-2.5">
            <p className="text-[12px] font-bold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-3">
              Choose payment method
            </p>
            {PAYMENT_METHODS.map(m => (
              <button key={m.id} onClick={() => { setMethod(m.id); setStep('details') }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border/60 dark:border-[#1a2235]
                  bg-surface dark:bg-[#080d18] hover:border-brand-400/50 dark:hover:border-brand-500/40
                  hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                  <m.icon size={18} className={m.color} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0]">{m.label}</p>
                  <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">{m.desc}</p>
                </div>
                <ChevronRight size={15} className="text-ink-4 group-hover:text-brand-500 transition-colors" />
              </button>
            ))}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-ink-4 dark:text-[#3d5070]">
                <Shield size={12} />
                <span className="text-[10px] font-medium">PCI DSS Secure</span>
              </div>
              <div className="flex items-center gap-1.5 text-ink-4 dark:text-[#3d5070]">
                <Lock size={12} />
                <span className="text-[10px] font-medium">SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-ink-4 dark:text-[#3d5070]">
                <BadgeCheck size={12} />
                <span className="text-[10px] font-medium">RBI Compliant</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Step: Payment details ── */}
        {step === 'details' && (
          <form onSubmit={handlePay} className="p-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30">
                <div className="w-1.5 h-1.5 bg-danger rounded-full flex-shrink-0" />
                <p className="text-[12px] text-danger font-medium">{error}</p>
              </div>
            )}

            {/* Card form */}
            {method === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">Card Number</label>
                  <div className="relative">
                    <input value={form.card} onChange={e => setForm(f => ({ ...f, card: formatCard(e.target.value) }))}
                      className="input h-11 pr-12" placeholder="1234 5678 9012 3456" maxLength={19} required />
                    <CreditCard size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">Expiry</label>
                    <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                      className="input h-11" placeholder="MM/YY" maxLength={5} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">CVV</label>
                    <input type="password" value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                      className="input h-11" placeholder="•••" maxLength={4} required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">Name on Card</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input h-11" placeholder="As printed on card" required />
                </div>
              </div>
            )}

            {/* UPI form */}
            {method === 'upi' && (
              <div>
                <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">UPI ID</label>
                <div className="relative">
                  <input value={form.upi} onChange={e => setForm(f => ({ ...f, upi: e.target.value }))}
                    className="input h-11 pr-12" placeholder="yourname@upi" required />
                  <Smartphone size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
                </div>
                <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-2">
                  e.g. name@okaxis, name@ybl, name@paytm
                </p>
                {/* Quick UPI apps */}
                <div className="flex gap-2 mt-3">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button key={app} type="button"
                      onClick={() => setForm(f => ({ ...f, upi: `demo@${app.toLowerCase()}` }))}
                      className="flex-1 py-2 rounded-xl text-[11px] font-semibold border border-border/60 dark:border-[#1a2235]
                        bg-surface-3 dark:bg-[#0f1929] text-ink-3 dark:text-[#64748B]
                        hover:border-emerald-400/50 hover:text-emerald-600 transition-all">
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Net banking form */}
            {method === 'netbanking' && (
              <div>
                <label className="block text-[11px] font-bold text-ink-2 dark:text-[#8896A8] mb-1.5 uppercase tracking-wider">Select Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(b => (
                    <button key={b} type="button" onClick={() => setBank(b)}
                      className={`py-2.5 rounded-xl text-[12px] font-semibold border transition-all
                        ${bank === b
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                          : 'border-border/60 dark:border-[#1a2235] bg-surface dark:bg-[#080d18] text-ink-3 dark:text-[#64748B] hover:border-brand-400/40'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full h-11 text-[14px] font-bold mt-2">
              Pay ₹{fee.amount.toLocaleString()} →
            </button>

            <p className="text-center text-[10px] text-ink-4 dark:text-[#3d5070]">
              🔒 Your payment is secured with 256-bit encryption
            </p>
          </form>
        )}

        {/* ── Step: Processing ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-14 px-5 gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl sidebar-brand-gradient flex items-center justify-center shadow-lg">
                <CreditCard size={28} className="text-white" />
              </div>
              <div className="absolute -inset-2 rounded-3xl border-2 border-brand-500/30 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-ink dark:text-[#F1F5F9]">Processing Payment</p>
              <p className="text-[13px] text-ink-4 dark:text-[#3d5070] mt-1">Please wait, do not close this window...</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-14 px-5 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg pop-in">
              <CheckCircle size={32} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-ink dark:text-[#F1F5F9]">Payment Successful!</p>
              <p className="text-[13px] text-ink-4 dark:text-[#3d5070] mt-1">
                ₹{fee.amount.toLocaleString()} paid for {fee.term}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30">
              <Receipt size={14} className="text-emerald-600" />
              <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
                Receipt sent to your registered email
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PAID:    { label:'Paid',    icon:CheckCircle,  color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-950/20',  badge:'badge-green'  },
  PENDING: { label:'Pending', icon:Clock,        color:'text-amber-600 dark:text-amber-400',     bg:'bg-amber-50 dark:bg-amber-950/20',      badge:'badge-yellow' },
  OVERDUE: { label:'Overdue', icon:AlertTriangle,color:'text-red-600 dark:text-red-400',         bg:'bg-red-50 dark:bg-red-950/20',          badge:'badge-red'    },
}

export default function ParentFees() {
  const { profile } = useAuth()
  const [children, setChildren]   = useState([])
  const [selected, setSelected]   = useState(null)
  const [fees, setFees]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [payingFee, setPayingFee] = useState(null) // fee object being paid

  useEffect(() => {
    if (!profile?.id) return
    getChildrenOfParent(profile.id).then(kids => {
      setChildren(kids)
      if (kids.length) setSelected(kids[0].id)
      setLoading(false)
    })
  }, [profile?.id])

  useEffect(() => {
    if (selected) getFees(selected).then(setFees)
  }, [selected])

  // Mark fee as paid locally (demo — no real DB write)
  const handlePaymentSuccess = (feeId) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'PAID' } : f))
  }

  if (loading) return <LoadingSpinner />

  const totalPaid    = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + f.amount, 0)
  const totalDue     = fees.filter(f => f.status !== 'PAID').reduce((s, f) => s + f.amount, 0)
  const hasOverdue   = fees.some(f => f.status === 'OVERDUE')
  const unpaidFees   = fees.filter(f => f.status !== 'PAID')

  return (
    <div className="space-y-5 fade-in max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-bold text-ink dark:text-[#F1F5F9]">Fee Management</h2>
          <p className="text-[12px] text-ink-4 dark:text-[#3d5070] mt-0.5">View and pay school fees securely</p>
        </div>
        {children.length > 1 && (
          <div className="flex gap-2">
            {children.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all
                  ${selected === c.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'btn-secondary'}`}>
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overdue alert */}
      {hasOverdue && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl
          bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30">
          <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-700 dark:text-red-400">Overdue Fee Alert</p>
            <p className="text-[12px] text-red-600/80 dark:text-red-400/70 mt-0.5">
              You have overdue fees. Please clear them immediately to avoid late penalties.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <p className="text-[11px] font-semibold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-2">Total Paid</p>
          <p className="text-[26px] font-bold text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-1">{fees.filter(f => f.status === 'PAID').length} terms cleared</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-2">Amount Due</p>
          <p className={`text-[26px] font-bold ${hasOverdue ? 'text-danger' : 'text-amber-600 dark:text-amber-400'}`}>
            ₹{totalDue.toLocaleString()}
          </p>
          <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-1">{unpaidFees.length} term{unpaidFees.length !== 1 ? 's' : ''} pending</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-2">Total Fees</p>
          <p className="text-[26px] font-bold text-ink dark:text-[#F1F5F9]">₹{fees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</p>
          <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-1">{fees.length} terms total</p>
        </div>
      </div>

      {/* Pay all due button */}
      {unpaidFees.length > 0 && (
        <button
          onClick={() => setPayingFee(unpaidFees[0])}
          className="btn-primary w-full h-12 text-[14px] font-bold flex items-center justify-center gap-2">
          <CreditCard size={16} />
          Pay All Due — ₹{totalDue.toLocaleString()}
        </button>
      )}

      {/* Term-wise breakdown */}
      <div className="card">
        <p className="text-[14px] font-bold text-ink dark:text-[#F1F5F9] mb-4">Term-wise Breakdown</p>
        <div className="space-y-3">
          {fees.map(fee => {
            const cfg = STATUS_CONFIG[fee.status]
            const Icon = cfg.icon
            return (
              <div key={fee.id}
                className={`flex items-center justify-between p-4 rounded-xl border
                  ${fee.status === 'PAID'
                    ? 'bg-surface-3 dark:bg-[#0f1929] border-border/40 dark:border-[#1a2235]'
                    : fee.status === 'OVERDUE'
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0]">{fee.term}</p>
                    <p className="text-[12px] text-ink-4 dark:text-[#3d5070]">₹{fee.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cfg.badge}>{cfg.label}</span>
                  {fee.status !== 'PAID' && (
                    <button
                      onClick={() => setPayingFee(fee)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold
                        text-white sidebar-brand-gradient shadow-sm
                        hover:opacity-90 transition-opacity">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment modal */}
      {payingFee && (
        <PaymentModal
          fee={payingFee}
          onClose={() => setPayingFee(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
