import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getTransportRoutes, getTransportAssignment, getChildrenOfParent } from '../../services/db'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Bus, MapPin, Clock, CreditCard, Users, CheckCircle, Navigation } from 'lucide-react'

export default function ParentTransport() {
  const { profile } = useAuth()
  const [routes, setRoutes]       = useState([])
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    const load = async () => {
      const [routeData, kids] = await Promise.all([
        getTransportRoutes(),
        getChildrenOfParent(profile.id),
      ])
      setRoutes(routeData)
      if (kids.length) {
        const asgn = await getTransportAssignment(kids[0].id)
        setAssignment(asgn)
      }
      setLoading(false)
    }
    load()
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  const assignedRoute = assignment?.transport_routes

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bus size={20} className="text-primary-600" /> Transport
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Bus routes, timings, and transport details</p>
      </div>

      {assignment && assignedRoute && (
        <div className="card border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-600" />
            <h3 className="font-semibold text-green-800 dark:text-green-400">Assigned Transport</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Route',          value: assignedRoute.name?.split('—')[0]?.trim() },
              { label:'Boarding Stop',  value: assignment.stop },
              { label:'Bus Number',     value: assignment.bus_number },
              { label:'Driver',         value: assignment.driver_name },
              { label:'Driver Contact', value: assignment.driver_contact },
              { label:'Morning Pickup', value: assignedRoute.morning_timing },
              { label:'Afternoon Drop', value: assignedRoute.return_timing },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Bus Routes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {routes.map(route => {
            const isAssigned = route.id === assignment?.route_id
            return (
              <div key={route.id} className={`card ${isAssigned?'ring-2 ring-green-500':''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <Bus size={16} className="text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{route.name}</p>
                  </div>
                  {isAssigned && <span className="badge-green text-xs">Assigned</span>}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                    <Navigation size={10} /> Route Stops
                  </p>
                  <div className="space-y-1">
                    {(route.stops || []).map((stop, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i===0?'bg-green-500':i===route.stops.length-1?'bg-red-500':'bg-gray-300'}`} />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{stop}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Morning</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{route.morning_timing}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Return</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{route.return_timing}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard size={12} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Monthly Fee</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">₹{route.fee?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Seats Left</p>
                      <p className={`text-xs font-medium ${route.available_seats<=3?'text-red-600':'text-green-600'}`}>
                        {route.available_seats}/{route.total_seats}
                      </p>
                    </div>
                  </div>
                </div>
                {!isAssigned && <button className="btn-secondary w-full mt-3 text-xs py-2">Request This Route</button>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

