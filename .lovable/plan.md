

# Plan: Improve @Mention Autocomplete Experience

## Overview
Enhance the @username mention feature to show suggested names immediately when the user types `@`, including showing all available users before filtering begins.

## Current Behavior
- Autocomplete only appears after typing `@` + at least one character
- If no character is typed after `@`, no suggestions appear
- Users need to know the exact username to start typing

## Proposed Changes

### 1. Show All Users When @ Is Typed (No Filter Yet)

**File: `src/hooks/useMentions.ts`**

Update the `filteredUsers` logic to show initial suggestions when just `@` is typed:

```typescript
// Current (line 64-73):
const filteredUsers = useMemo(() => {
  if (!searchQuery) return [];
  const query = searchQuery.toLowerCase();
  return allUsers
    .filter(...)
    .slice(0, 5);
}, [...]);

// Updated:
const filteredUsers = useMemo(() => {
  // Show top 5 users when @ is typed with no query yet
  if (searchQuery === "") {
    return allUsers
      .filter(u => u.id !== user?.id)
      .slice(0, 5);
  }
  // Filter by search query
  const query = searchQuery.toLowerCase();
  return allUsers
    .filter(u => 
      u.id !== user?.id &&
      u.display_name?.toLowerCase().includes(query)
    )
    .slice(0, 5);
}, [allUsers, searchQuery, user?.id]);
```

### 2. Update MentionInput to Trigger on @ Character

**File: `src/components/community/MentionInput.tsx`**

Update the `getCurrentMention` function to recognize when just `@` is typed (even without characters after):

```typescript
// Current regex (line 34):
const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
return mentionMatch ? mentionMatch[1] : null;

// Updated to return empty string when @ is typed alone:
const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
if (mentionMatch) {
  return mentionMatch[1]; // Returns "" for just "@", "s" for "@s"
}
return null; // No @ found
```

The current regex already captures this, but the issue is in the effect (lines 39-51):

```typescript
// Current:
if (mention !== null) { // This is already correct

// Issue: The filteredUsers returns [] when searchQuery=""
// So the dropdown never shows
```

### 3. Improve the Effect Logic

**File: `src/components/community/MentionInput.tsx`**

The effect at lines 39-51 needs to properly handle the case where `@` is typed but no characters follow:

```typescript
useEffect(() => {
  const mention = getCurrentMention();
  // Show suggestions when @ is detected (even with empty string)
  if (mention !== null) {
    setSearchQuery(mention);
    setIsSearching(true);
    setShowSuggestions(true);
    setSelectedIndex(0);
  } else {
    setSearchQuery("");
    setIsSearching(false);
    setShowSuggestions(false);
  }
}, [getCurrentMention, setSearchQuery, setIsSearching]);
```

This logic is correct; the fix is in the `useMentions` hook to not return empty when searchQuery is empty.

## Technical Details

### Files to Modify
1. **`src/hooks/useMentions.ts`** - Update `filteredUsers` to return top users when search is empty string
2. **`src/components/community/MentionInput.tsx`** - Minor adjustment to ensure suggestions show

### User Experience Flow

```text
1. User types in comment/post field
2. User types "@" character
3. Immediately shows top 5 users (alphabetically)
4. User types "so" 
5. List filters to show users matching "so" (e.g., "Solo Admin")
6. User clicks or presses Enter/Tab
7. Username is inserted as @SoloAdmin
```

### Edge Cases Handled
- Empty user list: Shows "No users found" or nothing
- Current user excluded: You cannot mention yourself  
- Spaces in names: Converted to camelCase (e.g., "Solo Admin" becomes "@SoloAdmin")
- Keyboard navigation: Arrow keys, Enter, Tab, Escape all work

## Summary

The autocomplete is already fully implemented - we just need to change one condition in `useMentions.ts` to show users when the search query is empty (when just `@` is typed). This is a minimal 2-line change.

