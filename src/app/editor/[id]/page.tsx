import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditorCanvas from "@/components/editor/EditorCanvas";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sheet } = await supabase
    .from("cheat_sheets")
    .select(
      `
      *,
      sections(
        *,
        items(*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (!sheet) notFound();
  if (sheet.user_id !== user.id) notFound();

  // Sort sections and items
  const sections = (sheet.sections || [])
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
    .map((s: { items?: { position: number }[] }) => ({
      ...s,
      items: (s.items || []).sort(
        (a: { position: number }, b: { position: number }) => a.position - b.position
      ),
    }));

  const sheetData = { ...sheet };
  delete sheetData.sections;

  return <EditorCanvas initialSheet={sheetData} initialSections={sections} />;
}
