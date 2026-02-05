-- =====================================================
-- FRIEND & MESSAGING ECOSYSTEM TABLES
-- =====================================================

-- 1. FRIENDSHIPS TABLE
-- Stores accepted friend relationships (bidirectional pair stored once)
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT friendships_user_friend_unique UNIQUE (user_id, friend_id),
  CONSTRAINT friendships_different_users CHECK (user_id <> friend_id)
);

-- 2. FRIEND REQUESTS TABLE
CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT friend_requests_unique UNIQUE (sender_id, receiver_id),
  CONSTRAINT friend_requests_different_users CHECK (sender_id <> receiver_id)
);

-- 3. CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL,
  participant_2 uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_participants_unique UNIQUE (participant_1, participant_2),
  CONSTRAINT conversations_different_users CHECK (participant_1 <> participant_2)
);

-- 4. DIRECT MESSAGES TABLE
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'contact_card')),
  contact_card_data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friend_requests_sender_id ON public.friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON public.friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);
CREATE INDEX idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX idx_direct_messages_conversation_id ON public.direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(_user1_id uuid, _user2_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_id = _user1_id AND friend_id = _user2_id)
       OR (user_id = _user2_id AND friend_id = _user1_id)
  )
$$;

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(_user1_id uuid, _user2_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conversation_id uuid;
  _p1 uuid;
  _p2 uuid;
BEGIN
  -- Ensure users are friends
  IF NOT public.are_friends(_user1_id, _user2_id) THEN
    RAISE EXCEPTION 'Users must be friends to start a conversation';
  END IF;
  
  -- Order participants consistently (lower UUID first)
  IF _user1_id < _user2_id THEN
    _p1 := _user1_id;
    _p2 := _user2_id;
  ELSE
    _p1 := _user2_id;
    _p2 := _user1_id;
  END IF;
  
  -- Try to find existing conversation
  SELECT id INTO _conversation_id
  FROM public.conversations
  WHERE participant_1 = _p1 AND participant_2 = _p2;
  
  -- If not found, create new one
  IF _conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, participant_2)
    VALUES (_p1, _p2)
    RETURNING id INTO _conversation_id;
  END IF;
  
  RETURN _conversation_id;
END;
$$;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION public.get_unread_message_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.direct_messages dm
  JOIN public.conversations c ON c.id = dm.conversation_id
  WHERE dm.is_read = false
    AND dm.sender_id <> _user_id
    AND (c.participant_1 = _user_id OR c.participant_2 = _user_id)
$$;

-- Function to get pending friend request count for a user
CREATE OR REPLACE FUNCTION public.get_pending_friend_request_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.friend_requests
  WHERE receiver_id = _user_id AND status = 'pending'
$$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- FRIENDSHIPS POLICIES
CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Enrolled students can create friendships"
ON public.friendships FOR INSERT
WITH CHECK (
  is_enrolled_student(auth.uid()) AND
  (auth.uid() = user_id OR auth.uid() = friend_id)
);

CREATE POLICY "Users can delete their own friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- FRIEND REQUESTS POLICIES
CREATE POLICY "Users can view their own requests"
ON public.friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Enrolled students can send friend requests"
ON public.friend_requests FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  is_enrolled_student(auth.uid())
);

CREATE POLICY "Receivers can update request status"
ON public.friend_requests FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Senders can cancel their requests"
ON public.friend_requests FOR DELETE
USING (auth.uid() = sender_id);

-- CONVERSATIONS POLICIES
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations with friends"
ON public.conversations FOR INSERT
WITH CHECK (
  (auth.uid() = participant_1 OR auth.uid() = participant_2) AND
  is_enrolled_student(auth.uid())
);

CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- DIRECT MESSAGES POLICIES
CREATE POLICY "Users can view messages in their conversations"
ON public.direct_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.direct_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  is_enrolled_student(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Recipients can mark messages as read"
ON public.direct_messages FOR UPDATE
USING (
  sender_id <> auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = direct_messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

-- =====================================================
-- REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;