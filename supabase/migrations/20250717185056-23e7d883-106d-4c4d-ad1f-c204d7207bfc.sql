-- Create enums for fan engagement system (skip payment_method as it exists)
CREATE TYPE public.fan_activity_type AS ENUM (
  'stream', 'vote', 'donation', 'purchase', 'event_attendance', 'review', 'share'
);

CREATE TYPE public.badge_type AS ENUM (
  'fan_of_month', 'top_supporter', 'early_adopter', 'voting_champion', 'event_attendee'
);

CREATE TYPE public.transaction_type AS ENUM (
  'topup', 'purchase', 'tip', 'donation', 'subscription', 'refund'
);

CREATE TYPE public.product_type AS ENUM (
  'song', 'album', 'ticket', 'merchandise', 'livestream', 'exclusive_content'
);

-- Fan profiles (extends user functionality)
CREATE TABLE public.fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  total_activity_points INTEGER DEFAULT 0,
  current_rank INTEGER DEFAULT 0,
  total_spent_fcfa BIGINT DEFAULT 0,
  total_votes_cast INTEGER DEFAULT 0,
  total_events_attended INTEGER DEFAULT 0,
  favorite_genres TEXT[] DEFAULT '{}',
  preferred_region TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan saved content (wishlist/favorites)
CREATE TABLE public.fan_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'artist', 'song', 'album', 'event'
  content_id UUID NOT NULL,
  content_title TEXT NOT NULL,
  artist_name TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan voting system
CREATE TABLE public.fan_voting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  poll_id UUID, -- References polls table if exists
  award_category TEXT,
  voted_for_id UUID NOT NULL,
  voted_for_name TEXT NOT NULL,
  vote_weight INTEGER DEFAULT 1,
  voting_round TEXT DEFAULT 'general',
  ip_address INET,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan leaderboards and points
CREATE TABLE public.fan_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL, -- 'global', 'regional', 'artist_specific'
  reference_id UUID, -- Artist ID if artist-specific
  current_rank INTEGER NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan badges and achievements
CREATE TABLE public.fan_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  earned_for_month DATE, -- For monthly badges
  artist_id UUID, -- If artist-specific badge
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Fan wallet system
CREATE TABLE public.fan_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  balance_fcfa BIGINT DEFAULT 0,
  pending_balance_fcfa BIGINT DEFAULT 0,
  total_topup_fcfa BIGINT DEFAULT 0,
  total_spent_fcfa BIGINT DEFAULT 0,
  spending_limit_fcfa BIGINT,
  is_active BOOLEAN DEFAULT true,
  pin_hash TEXT, -- For wallet security
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan transactions
CREATE TABLE public.fan_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount_fcfa BIGINT NOT NULL,
  payment_method payment_method,
  description TEXT NOT NULL,
  reference_id UUID, -- Product, artist, or event ID
  external_reference TEXT, -- Payment gateway reference
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Storefront products
CREATE TABLE public.storefront_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  product_type product_type NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  price_fcfa BIGINT NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  thumbnail_url TEXT,
  preview_url TEXT, -- For music previews
  download_url TEXT, -- For purchased content
  stock_quantity INTEGER, -- For merchandise
  is_digital BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan purchases
CREATE TABLE public.fan_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.storefront_products(id),
  transaction_id UUID REFERENCES public.fan_transactions(id),
  quantity INTEGER DEFAULT 1,
  unit_price_fcfa BIGINT NOT NULL,
  total_price_fcfa BIGINT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  access_expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan subscriptions (for fan clubs)
CREATE TABLE public.fan_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL,
  subscription_tier TEXT NOT NULL,
  monthly_price_fcfa BIGINT NOT NULL,
  benefits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchandise catalog
CREATE TABLE public.merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
  product_id UUID REFERENCES public.storefront_products(id),
  merch_type TEXT NOT NULL, -- 'tshirt', 'hoodie', 'cap', 'poster', etc.
  sizes_available TEXT[] DEFAULT '{}',
  colors_available TEXT[] DEFAULT '{}',
  material TEXT,
  care_instructions TEXT,
  shipping_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan activity tracking
CREATE TABLE public.fan_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  activity_type fan_activity_type NOT NULL,
  points_earned INTEGER DEFAULT 0,
  reference_id UUID, -- ID of related content/artist/event
  reference_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fan notifications
CREATE TABLE public.fan_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id UUID NOT NULL REFERENCES public.fan_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_voting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fan_profiles
CREATE POLICY "Fans can view their own profile" ON public.fan_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Fans can update their own profile" ON public.fan_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can create fan profile" ON public.fan_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view basic fan info" ON public.fan_profiles
  FOR SELECT USING (true);

-- RLS Policies for fan_saved_content
CREATE POLICY "Fans can manage their saved content" ON public.fan_saved_content
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_voting
CREATE POLICY "Fans can view their votes" ON public.fan_voting
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Fans can cast votes" ON public.fan_voting
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_leaderboards
CREATE POLICY "Anyone can view leaderboards" ON public.fan_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboards" ON public.fan_leaderboards
  FOR ALL USING (true);

-- RLS Policies for fan_badges
CREATE POLICY "Anyone can view badges" ON public.fan_badges
  FOR SELECT USING (true);

CREATE POLICY "Fans can view their badges" ON public.fan_badges
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_wallets
CREATE POLICY "Fans can view their wallet" ON public.fan_wallets
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Fans can update their wallet" ON public.fan_wallets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_transactions
CREATE POLICY "Fans can view their transactions" ON public.fan_transactions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Fans can create transactions" ON public.fan_transactions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for storefront_products
CREATE POLICY "Anyone can view active products" ON public.storefront_products
  FOR SELECT USING (true);

CREATE POLICY "Artists can manage their products" ON public.storefront_products
  FOR ALL USING (artist_id IN (
    SELECT id FROM public.artist_memberships WHERE user_id = auth.uid()
  ));

-- RLS Policies for fan_purchases
CREATE POLICY "Fans can view their purchases" ON public.fan_purchases
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_subscriptions
CREATE POLICY "Fans can manage their subscriptions" ON public.fan_subscriptions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- RLS Policies for fan_activities
CREATE POLICY "Fans can view their activities" ON public.fan_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

CREATE POLICY "System can track activities" ON public.fan_activities
  FOR INSERT WITH CHECK (true);

-- RLS Policies for fan_notifications
CREATE POLICY "Fans can manage their notifications" ON public.fan_notifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.fan_profiles 
    WHERE id = fan_id AND user_id = auth.uid()
  ));

-- Functions and triggers
CREATE OR REPLACE FUNCTION public.update_fan_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_fan_profiles_timestamp
  BEFORE UPDATE ON public.fan_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_fan_timestamps();

CREATE TRIGGER update_fan_leaderboards_timestamp
  BEFORE UPDATE ON public.fan_leaderboards
  FOR EACH ROW EXECUTE FUNCTION public.update_fan_timestamps();

CREATE TRIGGER update_fan_wallets_timestamp
  BEFORE UPDATE ON public.fan_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_fan_timestamps();

CREATE TRIGGER update_storefront_products_timestamp
  BEFORE UPDATE ON public.storefront_products
  FOR EACH ROW EXECUTE FUNCTION public.update_fan_timestamps();

CREATE TRIGGER update_merchandise_timestamp
  BEFORE UPDATE ON public.merchandise
  FOR EACH ROW EXECUTE FUNCTION public.update_fan_timestamps();

-- Function to award points for activities
CREATE OR REPLACE FUNCTION public.award_fan_points(
  p_fan_id UUID,
  p_activity_type fan_activity_type,
  p_reference_id UUID DEFAULT NULL,
  p_reference_name TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  points_to_award INTEGER := 0;
  activity_id UUID;
BEGIN
  -- Determine points based on activity type
  CASE p_activity_type
    WHEN 'stream' THEN points_to_award := 1;
    WHEN 'vote' THEN points_to_award := 5;
    WHEN 'donation' THEN points_to_award := 10;
    WHEN 'purchase' THEN points_to_award := 15;
    WHEN 'event_attendance' THEN points_to_award := 20;
    WHEN 'review' THEN points_to_award := 3;
    WHEN 'share' THEN points_to_award := 2;
    ELSE points_to_award := 1;
  END CASE;

  -- Insert activity record
  INSERT INTO public.fan_activities (
    fan_id, activity_type, points_earned, reference_id, reference_name
  ) VALUES (
    p_fan_id, p_activity_type, points_to_award, p_reference_id, p_reference_name
  ) RETURNING id INTO activity_id;

  -- Update fan profile points
  UPDATE public.fan_profiles 
  SET total_activity_points = total_activity_points + points_to_award,
      updated_at = now()
  WHERE id = p_fan_id;

  -- Update leaderboard entries
  INSERT INTO public.fan_leaderboards (
    fan_id, leaderboard_type, current_rank, total_points, monthly_points, weekly_points
  ) VALUES (
    p_fan_id, 'global', 0, points_to_award, points_to_award, points_to_award
  )
  ON CONFLICT (fan_id, leaderboard_type) WHERE reference_id IS NULL
  DO UPDATE SET
    total_points = fan_leaderboards.total_points + points_to_award,
    monthly_points = fan_leaderboards.monthly_points + points_to_award,
    weekly_points = fan_leaderboards.weekly_points + points_to_award,
    last_activity_at = now(),
    updated_at = now();

  RETURN points_to_award;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process wallet transactions
CREATE OR REPLACE FUNCTION public.process_wallet_transaction(
  p_fan_id UUID,
  p_transaction_type transaction_type,
  p_amount_fcfa BIGINT,
  p_description TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  current_balance BIGINT;
BEGIN
  -- Get current balance
  SELECT balance_fcfa INTO current_balance
  FROM public.fan_wallets 
  WHERE fan_id = p_fan_id;

  -- Validate transaction
  IF p_transaction_type IN ('purchase', 'tip', 'donation') AND current_balance < p_amount_fcfa THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Create transaction record
  INSERT INTO public.fan_transactions (
    fan_id, transaction_type, amount_fcfa, description, reference_id, status
  ) VALUES (
    p_fan_id, p_transaction_type, p_amount_fcfa, p_description, p_reference_id, 'completed'
  ) RETURNING id INTO transaction_id;

  -- Update wallet balance
  IF p_transaction_type = 'topup' THEN
    UPDATE public.fan_wallets 
    SET balance_fcfa = balance_fcfa + p_amount_fcfa,
        total_topup_fcfa = total_topup_fcfa + p_amount_fcfa,
        updated_at = now()
    WHERE fan_id = p_fan_id;
  ELSE
    UPDATE public.fan_wallets 
    SET balance_fcfa = balance_fcfa - p_amount_fcfa,
        total_spent_fcfa = total_spent_fcfa + p_amount_fcfa,
        updated_at = now()
    WHERE fan_id = p_fan_id;
  END IF;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create fan notification
CREATE OR REPLACE FUNCTION public.create_fan_notification(
  p_fan_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.fan_notifications (
    fan_id, notification_type, title, message, action_url
  ) VALUES (
    p_fan_id, p_type, p_title, p_message, p_action_url
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_fan_profiles_user_id ON public.fan_profiles(user_id);
CREATE INDEX idx_fan_saved_content_fan_id ON public.fan_saved_content(fan_id);
CREATE INDEX idx_fan_voting_fan_id ON public.fan_voting(fan_id);
CREATE INDEX idx_fan_leaderboards_type ON public.fan_leaderboards(leaderboard_type, current_rank);
CREATE INDEX idx_fan_badges_fan_id ON public.fan_badges(fan_id);
CREATE INDEX idx_fan_wallets_fan_id ON public.fan_wallets(fan_id);
CREATE INDEX idx_fan_transactions_fan_id ON public.fan_transactions(fan_id);
CREATE INDEX idx_storefront_products_artist ON public.storefront_products(artist_id);
CREATE INDEX idx_fan_purchases_fan_id ON public.fan_purchases(fan_id);
CREATE INDEX idx_fan_activities_fan_id ON public.fan_activities(fan_id);
CREATE INDEX idx_fan_notifications_fan_id ON public.fan_notifications(fan_id, is_read);

-- Create unique constraint for fan leaderboards to avoid conflicts
CREATE UNIQUE INDEX idx_fan_leaderboards_unique ON public.fan_leaderboards(fan_id, leaderboard_type) 
WHERE reference_id IS NULL;