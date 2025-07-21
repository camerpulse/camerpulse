-- Insert all CamerPulse platform plugins into the registry
INSERT INTO public.plugin_registry (
  plugin_name, plugin_author, plugin_version, plugin_status, plugin_type, 
  file_paths, routes_introduced, dependencies_used, api_endpoints, 
  metadata, plugin_risk_score
) VALUES
-- Core Plugins
('CamerPulse.Core.PollsSystem', 'CamerPulse Team', '2.1.0', 'enabled', 'feature',
 ARRAY['src/pages/Polls*', 'src/components/Polls*', 'src/hooks/usePolls*'], 
 ARRAY['/polls', '/polls/*', '/poll-archive', '/enhanced-polls'], 
 '{"dependencies": ["@tanstack/react-query", "react-router-dom"]}'::jsonb,
 ARRAY['/api/polls', '/api/poll-votes', '/api/poll-fraud'],
 '{"display_name": "Polls & Voting System", "description": "Comprehensive polling system with fraud detection", "category": "core", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 3),

('CamerPulse.Core.PoliticiansParties', 'CamerPulse Team', '1.8.0', 'enabled', 'feature',
 ARRAY['src/pages/Politicians*', 'src/pages/PoliticalParties*', 'src/components/Political*'],
 ARRAY['/politicians', '/political-parties', '/politician-performance'],
 '{"dependencies": ["@tanstack/react-query", "react-router-dom"]}'::jsonb,
 ARRAY['/api/politicians', '/api/political-parties', '/api/approval-ratings'],
 '{"display_name": "Politicians & Political Parties", "description": "Political figures database with ratings", "category": "core", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 2),

('CamerPulse.Core.CivicFeed', 'CamerPulse Team', '1.5.0', 'enabled', 'feature',
 ARRAY['src/pages/CivicFeed*', 'src/pages/Feed*', 'src/pages/Social*'],
 ARRAY['/civic-feed', '/feed', '/pulse-feed', '/social', '/social-community'],
 '{"dependencies": ["@tanstack/react-query", "react-router-dom"]}'::jsonb,
 ARRAY['/api/feed', '/api/civic-posts', '/api/social-engagement'],
 '{"display_name": "Civic Feed & Social Feed", "description": "Social media-style civic engagement feed", "category": "core", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 2),

('CamerPulse.Core.PulseNotifications', 'CamerPulse Team', '2.0.0', 'enabled', 'feature',
 ARRAY['src/pages/NotificationSettings*', 'src/pages/NotificationFlow*', 'src/components/Notification*'],
 ARRAY['/notification-settings', '/notification-flow', '/notification-campaigns'],
 '{"dependencies": ["@tanstack/react-query", "sonner"]}'::jsonb,
 ARRAY['/api/notifications', '/api/notification-settings', '/api/campaigns'],
 '{"display_name": "Notification System", "description": "Multi-channel notification system", "category": "core", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 3),

-- Governance Plugins
('CamerPulse.Governance.ProjectTracker', 'CamerPulse Team', '1.3.0', 'enabled', 'feature',
 ARRAY['src/pages/GovProjectTracker*', 'src/pages/Promises*'],
 ARRAY['/government-projects', '/promises'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/government-projects', '/api/promises'],
 '{"display_name": "Government Project Tracker", "description": "Track government projects and promises", "category": "governance", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 4),

('CamerPulse.Governance.PetitionsEngine', 'CamerPulse Team', '1.6.0', 'enabled', 'feature',
 ARRAY['src/pages/Petitions*', 'src/components/Petition*'],
 ARRAY['/petitions', '/petitions/*', '/admin/petitions'],
 '{"dependencies": ["@tanstack/react-query", "react-hook-form"]}'::jsonb,
 ARRAY['/api/petitions', '/api/petition-signatures'],
 '{"display_name": "Petitions Platform", "description": "Citizen petitions with government response tracking", "category": "governance", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 3),

-- Economy Plugins
('CamerPulse.Economy.CompanyDirectory', 'CamerPulse Team', '1.7.0', 'enabled', 'feature',
 ARRAY['src/pages/Company*', 'src/components/Company*'],
 ARRAY['/companies', '/companies/*', '/monetization-dashboard'],
 '{"dependencies": ["@tanstack/react-query", "react-hook-form"]}'::jsonb,
 ARRAY['/api/companies', '/api/business-registry'],
 '{"display_name": "Company Directory", "description": "Business registry and company profiles", "category": "economy", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 3),

('CamerPulse.Economy.Marketplace', 'CamerPulse Team', '1.4.0', 'enabled', 'feature',
 ARRAY['src/pages/Marketplace*', 'src/pages/OrderSuccess*'],
 ARRAY['/marketplace', '/marketplace/*'],
 '{"dependencies": ["@tanstack/react-query", "@stripe/stripe-js"]}'::jsonb,
 ARRAY['/api/marketplace', '/api/orders'],
 '{"display_name": "CamerPulse Marketplace", "description": "E-commerce platform for local businesses", "category": "economy", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 4),

('CamerPulse.Economy.BillionaireTracker', 'CamerPulse Team', '1.1.0', 'enabled', 'feature',
 ARRAY['src/pages/Billionaire*'],
 ARRAY['/billionaires', '/billionaires/*', '/admin/billionaires'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/billionaires', '/api/wealth-tracking'],
 '{"display_name": "Billionaire Tracker", "description": "Track ultra-wealthy individuals", "category": "economy", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 2),

('CamerPulse.Economy.NationalDebtMonitor', 'CamerPulse Team', '1.0.0', 'enabled', 'feature',
 ARRAY['src/pages/NationalDebtTracker*', 'src/pages/DebtAdmin*'],
 ARRAY['/national-debt', '/admin/debt'],
 '{"dependencies": ["@tanstack/react-query", "recharts"]}'::jsonb,
 ARRAY['/api/national-debt', '/api/fiscal-data'],
 '{"display_name": "National Debt Monitor", "description": "Real-time fiscal health tracking", "category": "economy", "roles_allowed": ["Citizen", "Moderator", "Admin", "Government"]}'::jsonb,
 3),

-- Analytics Plugins
('CamerPulse.Analytics.Intelligence', 'CamerPulse Team', '2.0.0', 'enabled', 'feature',
 ARRAY['src/pages/CamerPulseIntelligence*', 'src/pages/IntelligenceDashboard*', 'src/pages/PoliticaAI*'],
 ARRAY['/camerpulse-intelligence', '/intelligence-dashboard', '/politica-ai', '/sentiment-analysis', '/predictive-analytics'],
 '{"dependencies": ["@tanstack/react-query", "@huggingface/transformers"]}'::jsonb,
 ARRAY['/api/intelligence', '/api/sentiment', '/api/ai-insights'],
 '{"display_name": "AI Intelligence Platform", "description": "AI-powered analytics and insights", "category": "analytics", "roles_allowed": ["Admin", "Government"]}'::jsonb,
 5),

('CamerPulse.Analytics.ElectionForecast', 'CamerPulse Team', '1.3.0', 'enabled', 'feature',
 ARRAY['src/pages/ElectionForecast*'],
 ARRAY['/election-forecast'],
 '{"dependencies": ["@tanstack/react-query", "recharts"]}'::jsonb,
 ARRAY['/api/election-forecasts', '/api/voter-analysis'],
 '{"display_name": "Election Forecasting", "description": "Election predictions and voter analysis", "category": "analytics", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 4),

-- Entertainment Plugins
('CamerPulse.Entertainment.CamerPlayMusic', 'CamerPulse Team', '2.2.0', 'enabled', 'feature',
 ARRAY['src/pages/CamerPlay*'],
 ARRAY['/camerplay', '/camerplay/*'],
 '{"dependencies": ["@tanstack/react-query", "@stripe/stripe-js", "html2canvas"]}'::jsonb,
 ARRAY['/api/music', '/api/artists', '/api/events', '/api/tickets'],
 '{"display_name": "CamerPlay Music Platform", "description": "Music streaming and artist platform", "category": "entertainment", "roles_allowed": ["Citizen", "Artist", "Admin"]}'::jsonb,
 4),

('CamerPulse.Entertainment.ArtistEcosystem', 'CamerPulse Team', '1.9.0', 'enabled', 'feature',
 ARRAY['src/pages/Artist*', 'src/pages/Ecosystem*', 'src/pages/FanPortal*'],
 ARRAY['/artist-landing', '/artist-register', '/artist-dashboard', '/ecosystem', '/fan-portal'],
 '{"dependencies": ["@tanstack/react-query", "react-hook-form"]}'::jsonb,
 ARRAY['/api/artist-applications', '/api/artist-ecosystem'],
 '{"display_name": "Artist Ecosystem", "description": "Artist management and ecosystem", "category": "entertainment", "roles_allowed": ["Artist", "Admin"]}'::jsonb,
 3),

('CamerPulse.Entertainment.EventsCalendar', 'CamerPulse Team', '1.4.0', 'enabled', 'feature',
 ARRAY['src/pages/Events*', 'src/pages/EventCalendar*', 'src/pages/CertificateVerification*'],
 ARRAY['/events', '/calendar', '/verify-certificate'],
 '{"dependencies": ["@tanstack/react-query", "react-day-picker"]}'::jsonb,
 ARRAY['/api/events', '/api/calendar', '/api/certificates'],
 '{"display_name": "Events & Calendar", "description": "Event management and calendar system", "category": "entertainment", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 2),

-- Directory Plugins
('CamerPulse.Directories.VillagesDirectory', 'CamerPulse Team', '1.2.0', 'enabled', 'feature',
 ARRAY['src/pages/Village*'],
 ARRAY['/villages', '/villages/*'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/villages', '/api/village-profiles'],
 '{"display_name": "Villages Directory", "description": "Comprehensive villages directory", "category": "directories", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 2),

('CamerPulse.Directories.SchoolDirectory', 'CamerPulse Team', '1.0.0', 'enabled', 'feature',
 ARRAY['src/pages/SchoolsDirectory*'],
 ARRAY['/schools'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/schools'],
 '{"display_name": "Schools Directory", "description": "Educational institutions directory", "category": "directories", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 1),

('CamerPulse.Directories.HospitalDirectory', 'CamerPulse Team', '1.0.0', 'enabled', 'feature',
 ARRAY['src/pages/HospitalsDirectory*'],
 ARRAY['/hospitals'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/hospitals'],
 '{"display_name": "Hospitals Directory", "description": "Healthcare facilities directory", "category": "directories", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 1),

('CamerPulse.Directories.PharmacyDirectory', 'CamerPulse Team', '1.0.0', 'enabled', 'feature',
 ARRAY['src/pages/PharmaciesDirectory*'],
 ARRAY['/pharmacies'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/pharmacies'],
 '{"display_name": "Pharmacies Directory", "description": "Pharmacy directory with services", "category": "directories", "roles_allowed": ["Citizen", "Moderator", "Admin"]}'::jsonb,
 1),

-- Diaspora Plugins
('CamerPulse.Diaspora.DiasporaConnect', 'CamerPulse Team', '1.1.0', 'enabled', 'feature',
 ARRAY['src/pages/DiasporaConnect*'],
 ARRAY['/diaspora-connect'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/diaspora', '/api/diaspora-projects'],
 '{"display_name": "Diaspora Connect", "description": "Connect diaspora with homeland", "category": "diaspora", "roles_allowed": ["Diaspora", "Citizen", "Admin"]}'::jsonb,
 3),

-- Security Plugins
('CamerPulse.Security.UserVerification2FA', 'CamerPulse Team', '1.5.0', 'enabled', 'feature',
 ARRAY['src/pages/Auth*', 'src/pages/Security*'],
 ARRAY['/auth', '/security'],
 '{"dependencies": ["@supabase/supabase-js", "input-otp"]}'::jsonb,
 ARRAY['/api/auth', '/api/verification'],
 '{"display_name": "User Verification & 2FA", "description": "Authentication and verification system", "category": "security", "roles_allowed": ["All"]}'::jsonb,
 5),

('CamerPulse.Security.ModerationSystem', 'CamerPulse Team', '1.3.0', 'enabled', 'feature',
 ARRAY['src/pages/Moderator*', 'src/pages/ModerationCenter*', 'src/pages/UserManagement*'],
 ARRAY['/moderators/*', '/moderation-center', '/user-management'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/moderation', '/api/content-review'],
 '{"display_name": "Content Moderation", "description": "AI-powered content moderation", "category": "security", "roles_allowed": ["Moderator", "Admin"]}'::jsonb,
 4),

-- Admin Tools
('CamerPulse.Admin.AdminDashboards', 'CamerPulse Team', '2.0.0', 'enabled', 'feature',
 ARRAY['src/pages/Admin*', 'src/pages/CamerPulseMaster*'],
 ARRAY['/admin', '/admin/*', '/camerpulse-master'],
 '{"dependencies": ["@tanstack/react-query", "recharts"]}'::jsonb,
 ARRAY['/api/admin', '/api/dashboard-stats'],
 '{"display_name": "Admin Dashboard Suite", "description": "Comprehensive admin tools", "category": "admin_tools", "roles_allowed": ["Admin"]}'::jsonb,
 5),

('CamerPulse.Admin.PluginManager', 'CamerPulse Team', '1.0.0', 'enabled', 'feature',
 ARRAY['src/components/Admin/PluginManager*', 'src/hooks/usePluginSystem*'],
 ARRAY['/admin/plugins'],
 '{"dependencies": ["@tanstack/react-query"]}'::jsonb,
 ARRAY['/api/plugins', '/api/plugin-management'],
 '{"display_name": "Plugin Manager", "description": "System plugin management", "category": "admin_tools", "roles_allowed": ["Admin"]}'::jsonb,
 6);

-- Update existing plugins to have proper metadata if they already exist
UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"core"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Core.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"governance"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Governance.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"economy"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Economy.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"analytics"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Analytics.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"entertainment"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Entertainment.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"directories"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Directories.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"diaspora"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Diaspora.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"security"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Security.%';

UPDATE public.plugin_registry 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{category}',
  '"admin_tools"'::jsonb
) 
WHERE plugin_name LIKE 'CamerPulse.Admin.%';