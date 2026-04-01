import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  parseUpdateSheetBody,
  ValidationError,
} from "@/lib/api/sheet-validation";
import { enforceRateLimit } from "@/lib/api/rate-limit";

const READ_RATE_LIMIT = { maxRequests: 240, windowMs: 60_000 } as const;
const WRITE_RATE_LIMIT = { maxRequests: 90, windowMs: 60_000 } as const;

function sortSheetContent(sheet: {
  sections?: Array<{
    position: number;
    items?: Array<{ position: number }>;
  }>;
}) {
  if (!sheet.sections) {
    return sheet;
  }

  sheet.sections.sort((a, b) => a.position - b.position);

  for (const section of sheet.sections) {
    if (section.items) {
      section.items.sort((a, b) => a.position - b.position);
    }
  }

  return sheet;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await enforceRateLimit(
    supabase,
    user.id,
    "sheets:get",
    READ_RATE_LIMIT
  );
  if (rate.limited) {
    return NextResponse.json(
      {
        error: `Çok hızlı istek gönderiyorsunuz. ${rate.retryAfterSeconds} saniye sonra tekrar deneyin.`,
        code: "RATE_LIMIT_EXCEEDED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  const { data: sheet, error } = await supabase
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
    .eq("user_id", user.id)
    .single();

  if (error || !sheet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(sortSheetContent(sheet));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await enforceRateLimit(
    supabase,
    user.id,
    "sheets:update",
    WRITE_RATE_LIMIT
  );
  if (rate.limited) {
    return NextResponse.json(
      {
        error: `Çok hızlı istek gönderiyorsunuz. ${rate.retryAfterSeconds} saniye sonra tekrar deneyin.`,
        code: "RATE_LIMIT_EXCEEDED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("cheat_sheets")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body;

  try {
    body = await parseUpdateSheetBody(request);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Update sheet metadata
  const { error: sheetError } = await supabase
    .from("cheat_sheets")
    .update({
      title: body.title,
      description: body.description,
      is_public: body.is_public,
      layout: body.layout,
      theme: body.theme,
      toggles: body.toggles,
    })
    .eq("id", id);

  if (sheetError) {
    return NextResponse.json({ error: sheetError.message }, { status: 500 });
  }

  // Sync sections
  if (body.sections) {
    const incomingSectionIds = new Set(body.sections.map((section) => section.id).filter(Boolean));

    const { data: existingSections, error: existingSectionsError } = await supabase
      .from("sections")
      .select("id")
      .eq("sheet_id", id);

    if (existingSectionsError) {
      return NextResponse.json(
        { error: existingSectionsError.message },
        { status: 500 }
      );
    }

    const sectionIdsToDelete = (existingSections || [])
      .map((s) => s.id)
      .filter((existingId) => !incomingSectionIds.has(existingId));

    if (sectionIdsToDelete.length > 0) {
      const { error: deleteSectionsError } = await supabase
        .from("sections")
        .delete()
        .in("id", sectionIdsToDelete);

      if (deleteSectionsError) {
        return NextResponse.json(
          { error: deleteSectionsError.message },
          { status: 500 }
        );
      }
    }

    // Upsert sections and their items
    for (const section of body.sections) {
      const { error: sectionError } = await supabase.from("sections").upsert({
        id: section.id,
        sheet_id: id,
        title: section.title,
        color: section.color,
        icon: section.icon,
        position: section.position,
        column_hint: section.column_hint,
      });

      if (sectionError) {
        return NextResponse.json({ error: sectionError.message }, { status: 500 });
      }

      if (section.items) {
        const incomingItemIds = new Set(section.items.map((item) => item.id).filter(Boolean));

        const { data: existingItems, error: existingItemsError } = await supabase
          .from("items")
          .select("id")
          .eq("section_id", section.id);

        if (existingItemsError) {
          return NextResponse.json(
            { error: existingItemsError.message },
            { status: 500 }
          );
        }

        const itemIdsToDelete = (existingItems || [])
          .map((i) => i.id)
          .filter((existingId) => !incomingItemIds.has(existingId));

        if (itemIdsToDelete.length > 0) {
          const { error: deleteItemsError } = await supabase
            .from("items")
            .delete()
            .in("id", itemIdsToDelete);

          if (deleteItemsError) {
            return NextResponse.json(
              { error: deleteItemsError.message },
              { status: 500 }
            );
          }
        }

        // Upsert items
        if (section.items.length > 0) {
          const itemsToUpsert = section.items.map((item) => ({
              id: item.id,
              section_id: section.id,
              item_type: item.item_type,
              key_text: item.key_text,
              value_text: item.value_text,
              variants: item.variants,
              is_new: item.is_new,
              added_date: item.added_date,
              position: item.position,
            }));

          const { error: itemsError } = await supabase
            .from("items")
            .upsert(itemsToUpsert);

          if (itemsError) {
            return NextResponse.json({ error: itemsError.message }, { status: 500 });
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await enforceRateLimit(
    supabase,
    user.id,
    "sheets:delete",
    WRITE_RATE_LIMIT
  );
  if (rate.limited) {
    return NextResponse.json(
      {
        error: `Çok hızlı istek gönderiyorsunuz. ${rate.retryAfterSeconds} saniye sonra tekrar deneyin.`,
        code: "RATE_LIMIT_EXCEEDED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      }
    );
  }

  const { error } = await supabase
    .from("cheat_sheets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
