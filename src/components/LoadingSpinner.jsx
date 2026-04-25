import { GraduationCap } from 'lucide-react'

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-surface-2 dark:bg-[#060912] gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-12 h-12 rounded-full border-2 border-brand-100 dark:border-brand-950/50 border-t-brand-500 animate-spin" />
          {/* Inner logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center sidebar-brand-gradient">
              <GraduationCap size={12} className="text-white" />
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-ink dark:text-[#E2E8F0]">Campus Pocket</p>
          <p className="text-[11px] text-ink-4 dark:text-[#3d5070] mt-0.5">Loading your portal...</p>
        </div>
      </div>
    )
  }

  const sizes = {
    sm: 'h-5 w-5 border',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className={`${sizes[size]} animate-spin rounded-full border-border dark:border-[#1a2235] border-t-brand-500`} />
    </div>
  )
}
