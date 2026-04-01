import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sheets } = await supabase
    .from("cheat_sheets")
    .select(
      `
      *,
      sections(id, color)
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <DashboardContent sheets={sheets || []} />;
}
