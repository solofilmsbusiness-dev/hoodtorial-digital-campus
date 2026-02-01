-- Fix overly permissive INSERT policy - restrict to sender_id matching auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications as sender"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);