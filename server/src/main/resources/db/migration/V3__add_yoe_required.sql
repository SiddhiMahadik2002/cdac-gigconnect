-- Add yoe_required column to requirements table
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS yoe_required INTEGER;