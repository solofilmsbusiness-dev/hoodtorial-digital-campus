

## Fix: Post Save Button Not Giving Feedback

### What's Actually Happening
The save button DOES work -- posts are being saved to the database successfully (the `post_follows` table has records). But the user experience makes it feel broken because:

1. **No instant visual feedback** -- The bookmark icon doesn't fill immediately when clicked. The mutation waits for a full data refetch before updating, which can take a moment and feels unresponsive
2. **The "Following" tab is confusing** -- Saved posts appear under a "Following" tab with a people icon, which doesn't connect to the "Save" action. Users don't know where their saved posts went
3. **Toast notifications may be inconsistent** -- The success message fires inside the mutation function rather than in the `onSuccess` callback

### The Fix

**File: `src/hooks/useCommunityPosts.ts`**
- Add **optimistic UI updates** to the `toggleFollow` mutation so the bookmark icon fills/unfills immediately when clicked
- Move toast calls to `onSuccess`/`onError` callbacks for reliability
- Use `queryClient.setQueryData` to instantly toggle `user_is_following` on the cached post data before the server responds
- Add `onError` rollback to revert the optimistic update if the server request fails

**File: `src/components/community/ViewToggle.tsx`**
- Rename "Following" tab to "Saved"
- Change icon from Users to Bookmark so it matches the save button on posts
- This makes it clear where saved posts can be found

### Technical Details

The optimistic update in `toggleFollow` will:
1. Cancel any outgoing refetches to avoid overwriting
2. Snapshot the previous posts data
3. Optimistically toggle `user_is_following` on the target post
4. Return the snapshot for rollback on error

```
onMutate: (postId) => {
  // Cancel refetches, snapshot current data, toggle user_is_following
}
onError: (err, postId, context) => {
  // Restore snapshot
}
onSettled: () => {
  // Invalidate to sync with server
}
```

### Files Affected
- `src/hooks/useCommunityPosts.ts` -- optimistic updates for toggleFollow
- `src/components/community/ViewToggle.tsx` -- rename "Following" to "Saved" with Bookmark icon
