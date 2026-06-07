import { Suspense } from "react"
import LoginClient from "../../login/LoginClient"

export default function ArtistLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient roleHint="artist" />
    </Suspense>
  )
}
