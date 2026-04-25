/**
 * Campus Pocket — Admin Edge Function
 * Handles operations that require the SERVICE_ROLE key:
 *   - createUser (student/teacher)
 *   - resetPassword
 *   - bulkImport
 *
 * Deploy: supabase functions deploy admin-ops
 * Call:   POST /functions/v1/admin-ops  { action, payload }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const callerClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await callerClient.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: callerProfile } = await callerClient
      .from('users').select('role').eq('auth_id', user.id).single()
    if (callerProfile?.role !== 'admin') {
      return new Response('Forbidden — admin only', { status: 403 })
    }

    // Admin client with service role
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { action, payload } = await req.json()

    // ── CREATE USER ──────────────────────────────────────────
    if (action === 'createUser') {
      const { email, password, username, role, schoolId, profileData } = payload

      const { data: authData, error: authErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { username, role },
      })
      if (authErr) throw authErr

      const { data: userRow, error: userErr } = await admin
        .from('users')
        .insert({ auth_id: authData.user.id, username, email, role, school_id: schoolId })
        .select().single()
      if (userErr) throw userErr

      // Insert into role-specific table
      if (role === 'student') {
        await admin.from('students').insert({ user_id: userRow.id, ...profileData })
      } else if (role === 'teacher') {
        await admin.from('teachers').insert({ user_id: userRow.id, ...profileData })
      }

      return new Response(JSON.stringify({ success: true, userId: userRow.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── RESET PASSWORD ───────────────────────────────────────
    if (action === 'resetPassword') {
      const { authUserId, newPassword } = payload
      const { error } = await admin.auth.admin.updateUserById(authUserId, { password: newPassword })
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── BULK IMPORT ──────────────────────────────────────────
    if (action === 'bulkImport') {
      const { students, schoolId } = payload
      const results = { success: 0, failed: 0, errors: [] }

      for (const s of students) {
        try {
          const { data: authData, error: authErr } = await admin.auth.admin.createUser({
            email: s.email, password: s.password, email_confirm: true,
          })
          if (authErr) throw authErr

          const { data: userRow } = await admin.from('users')
            .insert({ auth_id: authData.user.id, username: s.username, email: s.email, role: 'student', school_id: schoolId })
            .select().single()

          await admin.from('students').insert({
            user_id: userRow.id, name: s.name, class_id: s.classId,
            admission_number: s.admissionNumber, school_id: schoolId,
          })
          results.success++
        } catch (err) {
          results.failed++
          results.errors.push({ email: s.email, reason: err.message })
        }
      }

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── DELETE USER ──────────────────────────────────────────
    if (action === 'deleteUser') {
      const { authUserId } = payload
      const { error } = await admin.auth.admin.deleteUser(authUserId)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Unknown action', { status: 400 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
