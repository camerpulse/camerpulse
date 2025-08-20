-- Create net schema then install pg_net extension into that schema
CREATE SCHEMA IF NOT EXISTS net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA net;