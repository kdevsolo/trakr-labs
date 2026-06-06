import { redirect } from 'next/navigation'
import { signOut } from '@/app/auth/actions'
import Sidebar from '@/components/dashboard/Sidebar'
import { getMe } from './action'

export default async function DashboardPage() {
  const meDetails = await getMe()
  if (!meDetails) redirect('/auth/login')
  
  if(meDetails && !meDetails.orgId) redirect('/dashboard/onboarding')

  return (
    <div>
      <h1>Dashboard</h1>
      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
      {/* <Sidebar /> */}
    </div>
  )
}