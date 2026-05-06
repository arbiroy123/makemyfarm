-- Run this once on any existing database to add admin support.
-- New installs using schema.sql already include this column.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- To make your first admin, run:
-- UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
