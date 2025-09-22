import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to sign-in page for now
  redirect('/sign-in')
}
