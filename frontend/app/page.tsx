import AuthForm from "@/components/auth-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  )
}
