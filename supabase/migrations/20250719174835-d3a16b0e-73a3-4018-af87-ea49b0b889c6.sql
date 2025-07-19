-- Insert notification flow configurations with correct enum values
INSERT INTO public.notification_flows (flow_name, event_type, recipient_type, channel, condition_logic, is_active, priority, delay_minutes) VALUES
('Artist Submission Received', 'artist_profile_submitted', 'artist', 'email', '{}', true, 1, 0),
('Artist Application Approved', 'artist_verified', 'artist', 'email', '{}', true, 1, 0),
('Artist Profile Rejected', 'artist_denied', 'artist', 'email', '{}', true, 1, 0),
('New Follower Alert', 'artist_new_follower', 'artist', 'in_app', '{}', true, 2, 0),
('Song Upload Confirmation', 'new_song_uploaded', 'artist', 'email', '{}', true, 1, 0),
('New Song Fan Notification', 'new_song_uploaded', 'fan', 'email', '{}', true, 1, 0),
('Stream Milestone Alert', 'song_milestone_reached', 'artist', 'in_app', '{}', true, 2, 0),
('Award Nomination - Artist', 'artist_award_nomination', 'artist', 'email', '{}', true, 1, 0),
('Award Nomination - Fan Alert', 'artist_award_nomination', 'fan', 'email', '{}', true, 1, 0),
('Award Voting Open', 'voting_opens', 'public', 'email', '{}', true, 1, 0),
('Award Voting Closed', 'voting_closes', 'artist', 'in_app', '{}', true, 2, 0),
('Award Winner Announcement', 'artist_award_win', 'artist', 'email', '{}', true, 1, 0),
('Event Published Confirmation', 'new_event_published', 'artist', 'email', '{}', true, 1, 0),
('New Event Fan Notification', 'new_event_published', 'fan', 'email', '{}', true, 1, 0),
('Ticket Purchase Confirmation', 'ticket_purchased', 'buyer', 'email', '{}', true, 1, 0),
('Event Reminder 24h', 'event_reminder_24h', 'buyer', 'email', '{}', true, 1, 1440),
('Event Cancellation Notice', 'event_cancelled', 'buyer', 'email', '{}', true, 1, 0);

-- Insert corresponding notification templates
INSERT INTO public.notification_templates (template_name, channel, subject_template, body_template, metadata) VALUES
('artist_submission_received', 'email', 'Artist Application Received', 'Thank you for submitting your artist application to CamerPlay. We will review your submission and get back to you within 5-7 business days.', '{}'),
('artist_approved_verified', 'email', 'Welcome to CamerPlay - Application Approved!', 'Congratulations! Your artist application has been approved. You can now access all CamerPlay features.', '{}'),
('artist_profile_rejected', 'email', 'Artist Application Update', 'Thank you for your interest in CamerPlay. Unfortunately, your application needs some changes before approval. Please review our feedback and resubmit.', '{}'),
('artist_new_follower', 'in_app', 'New Follower', 'You have a new follower on CamerPlay!', '{}'),
('song_uploaded_confirmation', 'email', 'Song Upload Successful', 'Your song has been successfully uploaded to CamerPlay and is now live!', '{}'),
('notify_fans_new_song', 'email', 'New Music Alert', 'Your favorite artist has just released new music on CamerPlay!', '{}'),
('stream_milestone_alert', 'in_app', 'Streaming Milestone Reached', 'Congratulations! Your song has reached a new streaming milestone.', '{}'),
('award_nomination_notice', 'email', 'Award Nomination', 'Congratulations! You have been nominated for a CamerPlay award.', '{}'),
('fan_award_nomination_alert', 'email', 'Your Artist Nominated', 'Great news! An artist you follow has been nominated for an award.', '{}'),
('award_voting_open', 'email', 'Award Voting Now Open', 'Voting is now open for the CamerPlay Awards. Cast your vote now!', '{}'),
('award_voting_closed', 'in_app', 'Voting Closed', 'Award voting has closed. Results will be announced soon.', '{}'),
('artist_award_winner_announcement', 'email', 'Congratulations - Award Winner!', 'Congratulations! You have won a CamerPlay award!', '{}'),
('event_published_confirmation', 'email', 'Event Published', 'Your event has been successfully published on CamerPlay.', '{}'),
('notify_fans_new_event', 'email', 'New Event Alert', 'Your favorite artist has announced a new event!', '{}'),
('ticket_purchase_confirmation', 'email', 'Ticket Purchase Confirmation', 'Thank you for your ticket purchase. Your tickets are confirmed!', '{}'),
('event_reminder_24h', 'email', 'Event Reminder - 24 Hours', 'Reminder: Your event is happening in 24 hours!', '{}'),
('event_cancellation_notice', 'email', 'Event Cancellation Notice', 'Unfortunately, the event you purchased tickets for has been cancelled.', '{}');