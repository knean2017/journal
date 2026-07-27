import { LoginForm } from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="eyebrow">ICRR</div>
        <h1 className="mt-2 mb-0 font-serif text-[26px] font-normal">Editorial office</h1>
        <div className="rule-double mt-5 mb-6" />
        <LoginForm />
      </div>
    </div>
  )
}
