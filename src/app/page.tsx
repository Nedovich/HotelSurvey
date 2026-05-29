import { redirect } from "next/navigation";

import { getPostLoginRedirectPath, getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  redirect(session ? await getPostLoginRedirectPath() : "/login");
}
