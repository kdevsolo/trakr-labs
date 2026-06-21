'use server'

import { getMe as fetchMe } from '@/lib/api/users'
import { createClient } from '@/lib/supabase/server'

export async function getMe() {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()
        return await fetchMe(session?.access_token)
    } catch (error) {
        console.error({ error })
        return null
    }
}