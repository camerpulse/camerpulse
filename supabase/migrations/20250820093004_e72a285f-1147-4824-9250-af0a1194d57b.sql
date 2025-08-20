-- Fix pg_net installation by removing conflicting schema and installing extension
DROP SCHEMA IF EXISTS net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net;