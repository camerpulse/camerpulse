-- Create rewards and points system for CamerPulse

-- Create points transactions table
CREATE TABLE public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points_balance INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create points transactions log
CREATE TABLE public.points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'converted')),
    points_amount INTEGER NOT NULL,
    activity_type TEXT NOT NULL, -- 'poll_created', 'poll_voted', 'badge_purchased', 'wallet_conversion'
    activity_reference_id UUID, -- poll_id, badge_id, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create digital badges table
CREATE TABLE public.digital_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    badge_type TEXT NOT NULL DEFAULT 'achievement', -- 'achievement', 'purchasable', 'special'
    points_cost INTEGER, -- cost in points if purchasable
    rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    unlock_criteria JSONB, -- criteria for earning the badge
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user badges table (badges owned by users)
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.digital_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_equipped BOOLEAN DEFAULT false,
    UNIQUE(user_id, badge_id)
);

-- Create wallet credits table
CREATE TABLE public.wallet_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_earned NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_spent NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'points_conversion')),
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- points_transaction_id or other reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_activity ON public.points_transactions(activity_type, activity_reference_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_wallet_credits_user_id ON public.wallet_credits(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_points
CREATE POLICY "Users can view their own points" ON public.user_points
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user points" ON public.user_points
    FOR ALL USING (true);

-- RLS policies for points_transactions
CREATE POLICY "Users can view their own transactions" ON public.points_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.points_transactions
    FOR INSERT WITH CHECK (true);

-- RLS policies for digital_badges
CREATE POLICY "Anyone can view active badges" ON public.digital_badges
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage badges" ON public.digital_badges
    FOR ALL TO authenticated 
    USING (EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award badges" ON public.user_badges
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can equip/unequip their badges" ON public.user_badges
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS policies for wallet_credits
CREATE POLICY "Users can view their own wallet" ON public.wallet_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage wallet credits" ON public.wallet_credits
    FOR ALL USING (true);

-- RLS policies for wallet_transactions
CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create wallet transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (true);

-- Function to award points for activities
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    points_to_award INTEGER := 0;
    current_balance INTEGER := 0;
BEGIN
    -- Determine points based on activity type
    CASE p_activity_type
        WHEN 'poll_created' THEN points_to_award := 50;
        WHEN 'poll_voted' THEN points_to_award := 10;
        WHEN 'poll_shared' THEN points_to_award := 15;
        WHEN 'daily_login' THEN points_to_award := 5;
        WHEN 'profile_complete' THEN points_to_award := 25;
        ELSE points_to_award := 0;
    END CASE;
    
    -- Insert or update user points
    INSERT INTO public.user_points (user_id, points_balance, total_earned)
    VALUES (p_user_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) DO UPDATE SET
        points_balance = user_points.points_balance + points_to_award,
        total_earned = user_points.total_earned + points_to_award,
        updated_at = now();
    
    -- Log the transaction
    INSERT INTO public.points_transactions (
        user_id, transaction_type, points_amount, activity_type, 
        activity_reference_id, description
    ) VALUES (
        p_user_id, 'earned', points_to_award, p_activity_type,
        p_activity_reference_id, COALESCE(p_description, 'Points earned for ' || p_activity_type)
    );
    
    RETURN points_to_award;
END;
$$;

-- Function to convert points to wallet credit
CREATE OR REPLACE FUNCTION convert_points_to_credit(
    p_user_id UUID,
    p_points_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_points INTEGER;
    credit_amount NUMERIC(10,2);
    conversion_rate NUMERIC := 0.01; -- 100 points = 1 FCFA
    transaction_id UUID;
BEGIN
    -- Check if user has enough points
    SELECT points_balance INTO current_points
    FROM public.user_points
    WHERE user_id = p_user_id;
    
    IF current_points IS NULL OR current_points < p_points_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Insufficient points balance'
        );
    END IF;
    
    -- Calculate credit amount
    credit_amount := p_points_amount * conversion_rate;
    
    -- Deduct points
    UPDATE public.user_points
    SET 
        points_balance = points_balance - p_points_amount,
        total_spent = total_spent + p_points_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Log points transaction
    INSERT INTO public.points_transactions (
        user_id, transaction_type, points_amount, activity_type, description
    ) VALUES (
        p_user_id, 'converted', p_points_amount, 'wallet_conversion',
        'Converted ' || p_points_amount || ' points to ' || credit_amount || ' FCFA'
    ) RETURNING id INTO transaction_id;
    
    -- Add wallet credit
    INSERT INTO public.wallet_credits (user_id, credit_balance, total_earned)
    VALUES (p_user_id, credit_amount, credit_amount)
    ON CONFLICT (user_id) DO UPDATE SET
        credit_balance = wallet_credits.credit_balance + credit_amount,
        total_earned = wallet_credits.total_earned + credit_amount,
        updated_at = now();
    
    -- Log wallet transaction
    INSERT INTO public.wallet_transactions (
        user_id, transaction_type, amount, description, reference_id
    ) VALUES (
        p_user_id, 'credit', credit_amount,
        'Points conversion: ' || p_points_amount || ' points', transaction_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'points_converted', p_points_amount,
        'credit_received', credit_amount,
        'message', 'Successfully converted ' || p_points_amount || ' points to ' || credit_amount || ' FCFA'
    );
END;
$$;

-- Function to purchase digital badge
CREATE OR REPLACE FUNCTION purchase_badge(
    p_user_id UUID,
    p_badge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    badge_cost INTEGER;
    current_points INTEGER;
    badge_name TEXT;
BEGIN
    -- Get badge details
    SELECT points_cost, name INTO badge_cost, badge_name
    FROM public.digital_badges
    WHERE id = p_badge_id AND is_active = true AND badge_type = 'purchasable';
    
    IF badge_cost IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Badge not found or not purchasable'
        );
    END IF;
    
    -- Check if user already owns the badge
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = p_badge_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Badge already owned'
        );
    END IF;
    
    -- Check if user has enough points
    SELECT points_balance INTO current_points
    FROM public.user_points
    WHERE user_id = p_user_id;
    
    IF current_points IS NULL OR current_points < badge_cost THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Insufficient points balance'
        );
    END IF;
    
    -- Deduct points
    UPDATE public.user_points
    SET 
        points_balance = points_balance - badge_cost,
        total_spent = total_spent + badge_cost,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Award badge
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, p_badge_id);
    
    -- Log transaction
    INSERT INTO public.points_transactions (
        user_id, transaction_type, points_amount, activity_type, 
        activity_reference_id, description
    ) VALUES (
        p_user_id, 'spent', badge_cost, 'badge_purchased',
        p_badge_id, 'Purchased badge: ' || badge_name
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'badge_name', badge_name,
        'points_spent', badge_cost,
        'message', 'Successfully purchased ' || badge_name
    );
END;
$$;

-- Insert some default badges
INSERT INTO public.digital_badges (name, description, badge_type, points_cost, rarity) VALUES
('Poll Pioneer', 'Create your first poll', 'achievement', NULL, 'common'),
('Civic Engager', 'Vote in 10 polls', 'achievement', NULL, 'common'),
('Opinion Leader', 'Create 5 polls', 'achievement', NULL, 'rare'),
('Democratic Voice', 'Vote in 50 polls', 'achievement', NULL, 'rare'),
('Golden Citizen', 'Premium civic participation badge', 'purchasable', 500, 'epic'),
('Platinum Patriot', 'Elite civic engagement badge', 'purchasable', 1000, 'legendary'),
('CamerPulse Supporter', 'Show your support for CamerPulse', 'purchasable', 200, 'common'),
('Regional Champion', 'Active in regional discussions', 'purchasable', 300, 'rare');

-- Trigger to update user_points updated_at
CREATE OR REPLACE FUNCTION update_user_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_points_updated_at
    BEFORE UPDATE ON public.user_points
    FOR EACH ROW EXECUTE FUNCTION update_user_points_updated_at();

-- Trigger to update wallet_credits updated_at
CREATE TRIGGER update_wallet_credits_updated_at
    BEFORE UPDATE ON public.wallet_credits
    FOR EACH ROW EXECUTE FUNCTION update_user_points_updated_at();