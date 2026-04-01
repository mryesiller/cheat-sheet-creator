import { createClient } from "@/lib/supabase/server";
import { generateSlug, slugBase } from "@/lib/utils/slug";
import { NextResponse } from "next/server";
import {
  parseCreateSheetBody,
  ValidationError,
} from "@/lib/api/sheet-validation";

async function allocateUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string
): Promise<string> {
  const base = slugBase(title);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateSlug(title);
    const { data, error } = await supabase
      .from("cheat_sheets")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  return base ? `${base}-${Date.now()}` : `sheet-${Date.now()}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sheets, error } = await supabase
    .from("cheat_sheets")
    .select(
      `
      *,
      sections(id, color)
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(sheets);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;

  try {
    body = await parseCreateSheetBody(request);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = body.title;
  const slug = await allocateUniqueSlug(supabase, title);
  const templateSections = body.sections;
  const templateToggles = body.toggles;
  const templateLayout = body.layout;

  const { data: sheet, error } = await supabase
    .from("cheat_sheets")
    .insert({
      user_id: user.id,
      title,
      slug,
      ...(templateToggles ? { toggles: templateToggles } : {}),
      ...(templateLayout ? { layout: templateLayout } : {}),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert template sections and items if provided
  if (templateSections && templateSections.length > 0) {
    for (let si = 0; si < templateSections.length; si++) {
      const sec = templateSections[si];
      const { data: section, error: secError } = await supabase
        .from("sections")
        .insert({
          sheet_id: sheet.id,
          title: sec.title,
          color: sec.color,
          position: si,
        })
        .select()
        .single();

      if (secError || !section) continue;

      if (sec.items && sec.items.length > 0) {
        await supabase.from("items").insert(
          sec.items.map((item, ii) => ({
            section_id: section.id,
            item_type: item.item_type,
            key_text: item.key_text,
            value_text: item.value_text,
            is_new: item.is_new ?? false,
            position: ii,
          }))
        );
      }
    }
  }

  return NextResponse.json(sheet, { status: 201 });
}
