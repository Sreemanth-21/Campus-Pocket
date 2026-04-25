/**
 * adminEdge.js — Calls the admin-ops Edge Function
 * Use these instead of adminApi.js for operations that need SERVICE_ROLE.
 */
import { supabase } from './supabase'

async function callAdminOps(action, payload) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ops`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action, payload }),
    }
  )

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Edge function error')
  return json
}

/** Create a student or teacher via Edge Function */
export async function createUserViaEdge(role, userData, profileData, schoolId) {
  return callAdminOps('createUser', { ...userData, role, schoolId, profileData })
}

/** Reset any user's password via Edge Function */
export async function resetPasswordViaEdge(authUserId, newPassword) {
  return callAdminOps('resetPassword', { authUserId, newPassword })
}

/** Bulk import students from parsed CSV array */
export async function bulkImportViaEdge(students, schoolId) {
  return callAdminOps('bulkImport', { students, schoolId })
}

/** Hard-delete a user (auth + all data) */
export async function deleteUserViaEdge(authUserId) {
  return callAdminOps('deleteUser', { authUserId })
}

