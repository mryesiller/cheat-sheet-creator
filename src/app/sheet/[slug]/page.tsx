import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SheetViewer from "@/components/viewer/SheetViewer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sheet } = await supabase
    .from("cheat_sheets")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!sheet) return { title: "Not Found" };

  return {
    title: `${sheet.title} | CheatSheet Creator`,
    description: sheet.description || `A cheat sheet: ${sheet.title}`,
    openGraph: {
      title: sheet.title,
      description: sheet.description || `A cheat sheet: ${sheet.title}`,
      type: "article",
    },
  };
}

export default async function SheetPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

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
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!sheet) notFound();

  // Check if current user is the owner
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === sheet.user_id;

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

  return <SheetViewer sheet={sheetData} sections={sections} editorId={isOwner ? sheet.id : undefined} />;
}
