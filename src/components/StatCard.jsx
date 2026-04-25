import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

const PALETTE = {
  brand:   { bg: 'bg-brand-50 dark:bg-brand-950/30',   text: 'text-brand-600 dark:text-brand-400',   gradient: 'from-brand-500 to-violet-500' },
  green:   { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
  yellow:  { bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-600 dark:text-amber-400',   gradient: 'from-amber-500 to-orange-500' },
  red:     { bg: 'bg-red-50 dark:bg-red-950/30',       text: 'text-red-600 dark:text-red-400',       gradient: 'from-red-500 to-rose-500' },
  purple:  { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', gradient: 'from-violet-500 to-purple-600' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/30',     text: 'text-blue-600 dark:text-blue-400',     gradient: 'from-blue-500 to-cyan-500' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'brand', trend, onClick }) {
  const p = PALETTE[color] || PALETTE.brand

  return (
    <div onClick={onClick}
      className={`metric-card group fade-in ${onClick ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-ink-4 dark:text-[#3d5070] uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-[28px] font-bold text-ink dark:text-[#F1F5F9] leading-none mb-1.5">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-ink-4 dark:text-[#3d5070]">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 ${trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {trend > 0
                ? <ArrowUpRight size={12} />
                : <ArrowDownRight size={12} />}
              <span className="text-[11px] font-semibold">{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${p.bg}
            group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={18} className={p.text} />
          </div>
        )}
      </div>
      {/* Hover accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl bg-gradient-to-r ${p.gradient}
        opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
    </div>
  )
}
