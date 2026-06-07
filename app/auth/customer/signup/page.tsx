import { redirect } from "next/navigation"

export default async function CustomerSignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams({ role: "customer" })
  const next = params.next

  if (typeof next === "string") {
    query.set("next", next)
  }

  redirect(`/auth/signup?${query.toString()}`)
}
