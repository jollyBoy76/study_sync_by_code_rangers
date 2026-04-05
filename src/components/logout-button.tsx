'use client'
import { supabaseClient as supabase } from '@/lib/supabase.client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return <Button onClick={logout}>Logout</Button>
}
