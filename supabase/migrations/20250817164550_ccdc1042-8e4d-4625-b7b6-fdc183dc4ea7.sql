-- Phase 1: Remove Plugin System Database Tables
-- These tables are causing database bloat and performance issues

DROP TABLE IF EXISTS plugin_activation_history CASCADE;
DROP TABLE IF EXISTS plugin_registry CASCADE;
DROP TABLE IF EXISTS plugin_versions CASCADE;
DROP TABLE IF EXISTS plugin_snapshots CASCADE;
DROP TABLE IF EXISTS plugin_marketplace CASCADE;
DROP TABLE IF EXISTS plugin_submissions CASCADE;
DROP TABLE IF EXISTS plugin_security_scans CASCADE;
DROP TABLE IF EXISTS plugin_licenses CASCADE;
DROP TABLE IF EXISTS plugin_license_keys CASCADE;
DROP TABLE IF EXISTS plugin_purchases CASCADE;
DROP TABLE IF EXISTS plugin_conflicts CASCADE;
DROP TABLE IF EXISTS plugin_stress_tests CASCADE;
DROP TABLE IF EXISTS plugin_risk_assessments CASCADE;
DROP TABLE IF EXISTS plugin_watchdog_config CASCADE;

-- Remove unused logistics tables
DROP TABLE IF EXISTS logistics_api_integrations CASCADE;
DROP TABLE IF EXISTS logistics_fleet_vehicles CASCADE;
DROP TABLE IF EXISTS logistics_insurance_policies CASCADE;
DROP TABLE IF EXISTS logistics_tenants CASCADE;

-- Clean up any indexes related to these tables
DROP INDEX IF EXISTS idx_plugin_registry_name CASCADE;
DROP INDEX IF EXISTS idx_plugin_registry_status CASCADE;
DROP INDEX IF EXISTS idx_logistics_tenants_id CASCADE;