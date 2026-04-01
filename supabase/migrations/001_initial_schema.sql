-- Cheat Sheets table
CREATE TABLE cheat_sheets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'Untitled Cheat Sheet',
  description   TEXT DEFAULT '',
  slug          TEXT NOT NULL UNIQUE,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  layout        JSONB NOT NULL DEFAULT '{"columns": 4, "font_body": "inter", "font_mono": "jetbrains-mono"}',
  theme         JSONB NOT NULL DEFAULT '{"background": "#ffffff", "text": "#1f2937"}',
  toggles       JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sheets_user ON cheat_sheets(user_id);
CREATE INDEX idx_sheets_slug ON cheat_sheets(slug);

-- Sections table
CREATE TABLE sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id      UUID NOT NULL REFERENCES cheat_sheets(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT 'New Section',
  color         TEXT NOT NULL DEFAULT 'blue',
  icon          TEXT DEFAULT NULL,
  position      INTEGER NOT NULL DEFAULT 0,
  column_hint   INTEGER DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sections_sheet ON sections(sheet_id);

-- Items table
CREATE TABLE items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  item_type     TEXT NOT NULL DEFAULT 'pair' CHECK (item_type IN ('pair', 'subheader', 'divider')),
  key_text      TEXT NOT NULL DEFAULT '',
  value_text    TEXT NOT NULL DEFAULT '',
  variants      JSONB DEFAULT NULL,
  is_new        BOOLEAN NOT NULL DEFAULT false,
  added_date    DATE DEFAULT CURRENT_DATE,
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_section ON items(section_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON cheat_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE cheat_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- cheat_sheets policies
CREATE POLICY "Owner full access" ON cheat_sheets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public sheets readable by all" ON cheat_sheets
  FOR SELECT USING (is_public = true);

-- sections policies
CREATE POLICY "Owner full access on sections" ON sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM cheat_sheets WHERE id = sections.sheet_id AND user_id = auth.uid())
  );

CREATE POLICY "Public sections readable" ON sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cheat_sheets WHERE id = sections.sheet_id AND is_public = true)
  );

-- items policies
CREATE POLICY "Owner full access on items" ON items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN cheat_sheets cs ON cs.id = s.sheet_id
      WHERE s.id = items.section_id AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Public items readable" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN cheat_sheets cs ON cs.id = s.sheet_id
      WHERE s.id = items.section_id AND cs.is_public = true
    )
  );
