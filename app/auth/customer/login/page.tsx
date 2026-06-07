import { Suspense } from "react"
import LoginClient from "../../login/LoginClient"

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient roleHint="customer" />
    </Suspense>
  )
}
