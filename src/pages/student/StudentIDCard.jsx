import { useAuth } from '../../contexts/AuthContext'
import { GraduationCap, School, Hash, User } from 'lucide-react'

export default function StudentIDCard() {
  const { profile, user } = useAuth()

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Digital ID Card</h2>

      <div className="max-w-sm mx-auto">
        {/* Card front */}
        <div className="relative bg-gradient-to-br from-primary-700 to-accent-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6 relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Campus Pocket</p>
                <p className="text-xs text-white/70">Student ID</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">2024-25</span>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 relative">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-white/30">
              {profile?.name?.[0] || 'S'}
            </div>
            <div>
              <h3 className="text-xl font-bold">{profile?.name}</h3>
              <p className="text-white/80 text-sm">Class {profile?.class} - Section {profile?.section}</p>
              <p className="text-white/60 text-xs mt-0.5">@{user?.username}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 relative">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><Hash size={10} /> Student ID</p>
              <p className="font-mono font-bold text-sm mt-0.5">{profile?.id?.slice(0, 10).toUpperCase()}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><School size={10} /> School</p>
              <p className="font-bold text-sm mt-0.5">Demo School</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 flex items-center gap-1"><User size={10} /> Role</p>
              <p className="font-bold text-sm mt-0.5 capitalize">{user?.role}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">Attendance</p>
              <p className="font-bold text-sm mt-0.5">{profile?.attendance_percentage}%</p>
            </div>
          </div>

          {/* Barcode-like decoration */}
          <div className="mt-4 flex gap-0.5 justify-center relative">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="bg-white/30 rounded-full" style={{ width: 2, height: Math.random() > 0.5 ? 16 : 10 }} />
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          This is a digital ID card for Campus Pocket demo.
        </p>
      </div>
    </div>
  )
}

