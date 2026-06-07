import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  const redirectTo = params.redirect

  if (typeof redirectTo === "string") {
    query.set("redirect", redirectTo)
  }

  redirect(`/auth/customer/login${query.toString() ? `?${query.toString()}` : ""}`)
}
