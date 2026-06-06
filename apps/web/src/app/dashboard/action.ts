'use server'

import { getMe as fetchMe } from '@/lib/api/users'
import { createClient } from '@/lib/supabase/server'

export async function getMe() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return fetchMe(session?.access_token)
}