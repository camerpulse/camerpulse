-- 1) Ensure pg_net extension exists for functions using net.*
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA net;