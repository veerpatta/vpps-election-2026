import { useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail } from 'lucide-react'
import { Button, Card, Field, PageBackground, SchoolMark, TextInput } from '../../components/ui/primitives'

export function AdminLoginPage() {
  const navigate = useNavigate()
  return (
    <PageBackground>
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-8">
        <Card className="w-full p-6 sm:p-8">
          <div className="grid place-items-center text-center">
            <SchoolMark />
            <h1 className="mt-6 text-3xl font-black">Staff Login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Enter the election control room for this prototype.</p>
          </div>
          <div className="mt-8 grid gap-4">
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <TextInput className="w-full pl-12" type="email" placeholder="staff@vpps.edu" />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <TextInput className="w-full pl-12" type="password" placeholder="Enter password" />
              </div>
            </Field>
            <Button type="button" onClick={() => navigate('/admin/dashboard')} className="mt-2 w-full">Login</Button>
          </div>
        </Card>
      </main>
    </PageBackground>
  )
}
