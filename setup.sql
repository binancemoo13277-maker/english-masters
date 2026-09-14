CREATE TABLE IF NOT EXISTS site_content (
  id integer PRIMARY KEY,
  content jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_content (id, content)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS orders (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL DEFAULT '',
  qty integer NOT NULL DEFAULT 1,
  address text NOT NULL DEFAULT '',
  total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
