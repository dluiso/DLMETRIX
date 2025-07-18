-- Add OffPage Data column to web_analyses table
-- This migration adds the off_page_data column to support OffPage SEO analysis

ALTER TABLE web_analyses ADD COLUMN off_page_data JSON NULL;

-- Verify the column was added
DESCRIBE web_analyses;