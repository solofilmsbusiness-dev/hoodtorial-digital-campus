

# Add Delete Course Action to Course Manager

## Overview

Add a delete button to the Actions column in the Course Manager table, allowing admins to delete courses directly from the main course list. The delete action will include a confirmation dialog to prevent accidental deletions.

## Current State

- **Actions column** has View (Eye icon) and Edit (Pencil icon) buttons
- No delete functionality exists on the Course Manager page
- The page already has mutation patterns for updating courses
- Database has RLS policy allowing admins to delete courses: `"Admins can delete courses"`

## Implementation Plan

### 1. Add Delete Mutation

Create a new `useMutation` hook for deleting courses:

```typescript
const deleteCourse = useMutation({
  mutationFn: async (courseId: string) => {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    toast({ title: "Course deleted successfully" });
  },
  onError: (error) => {
    toast({ 
      title: "Failed to delete course", 
      description: error.message,
      variant: "destructive" 
    });
  },
});
```

### 2. Add Confirmation Dialog State

Add state to track which course is being deleted:

```typescript
const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
```

### 3. Update Imports

Add required imports:

```typescript
import { Plus, Pencil, Eye, Lock, Database, Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
```

### 4. Add Delete Button to Actions Column

Add a delete button next to the existing View and Edit buttons:

```tsx
<Button 
  variant="ghost" 
  size="icon"
  onClick={() => setCourseToDelete(course)}
  disabled={isUsingStaticData}
  className="text-destructive hover:text-destructive hover:bg-destructive/10"
  title="Delete course"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 5. Add Confirmation AlertDialog

Add the confirmation dialog at the end of the component:

```tsx
<AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Course</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{courseToDelete?.title}" ({courseToDelete?.code})?
        This will also delete all modules, lessons, and quizzes associated with this course.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          if (courseToDelete) {
            deleteCourse.mutate(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Visual Layout (Updated Actions Column)

```
+-------+-------+--------+
| View  | Edit  | Delete |
| [Eye] | [Pen] | [Trash]|
+-------+-------+--------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/CourseManager.tsx` | Add imports, delete mutation, state, delete button, and confirmation dialog |

## Technical Considerations

1. **Cascade Deletion**: The database should have ON DELETE CASCADE for modules/lessons/quizzes referencing the course. If not, the deletion might fail.

2. **Static Data Check**: Delete button is disabled when using static data (courses not yet in database), same as other mutations.

3. **User Feedback**: Toast notification confirms successful deletion or shows error.

4. **Safety**: Confirmation dialog prevents accidental deletions and clearly states consequences.

## Summary

This adds a delete action to the Course Manager that:
- Appears as a trash icon button in the Actions column
- Shows a confirmation dialog before deleting
- Warns about cascading deletion of modules, lessons, and quizzes
- Provides success/error feedback via toast notifications
- Is disabled when courses are not yet in the database

