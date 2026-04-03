'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import { useKanbanStore } from '@/store/useKanbanStore';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { Priority, ColumnId, COLUMN_LABELS } from '@/types/task';

// ============================================================
// TaskDialog — unified create / edit dialog
//
// Create mode: editingTask is null, form is empty
// Edit mode: editingTask is set, form is pre-filled
// ============================================================

export default function TaskDialog() {
  const {
    isTaskDialogOpen,
    editingTask,
    targetColumn,
    closeTaskDialog,
  } = useKanbanStore();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const isEdit = editingTask !== null;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // ---- Form State ----
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [column, setColumn] = useState<ColumnId>(targetColumn);
  const [titleError, setTitleError] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isTaskDialogOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setPriority(editingTask.priority);
        setColumn(editingTask.column);
      } else {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setColumn(targetColumn);
      }
      setTitleError(false);
    }
  }, [isTaskDialogOpen, editingTask, targetColumn]);

  const handleSubmit = () => {
    // Validate
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    if (isEdit && editingTask) {
      updateMutation.mutate(
        {
          id: editingTask.id,
          updates: { title: title.trim(), description: description.trim(), priority, column },
          previousColumn: editingTask.column,
        },
        { onSuccess: () => closeTaskDialog() }
      );
    } else {
      createMutation.mutate(
        {
          title: title.trim(),
          description: description.trim(),
          priority,
          column,
        },
        { onSuccess: () => closeTaskDialog() }
      );
    }
  };

  return (
    <Dialog
      open={isTaskDialogOpen}
      onClose={closeTaskDialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(false);
            }}
            error={titleError}
            helperText={titleError ? 'Title is required' : ''}
            fullWidth
            autoFocus
            required
          />

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Priority */}
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <MenuItem value="HIGH">🔴 High</MenuItem>
              <MenuItem value="MEDIUM">🟠 Medium</MenuItem>
              <MenuItem value="LOW">⚪ Low</MenuItem>
            </Select>
          </FormControl>

          {/* Column (visible in edit mode for moving tasks) */}
          <FormControl fullWidth>
            <InputLabel>Column</InputLabel>
            <Select
              value={column}
              label="Column"
              onChange={(e) => setColumn(e.target.value as ColumnId)}
            >
              {Object.entries(COLUMN_LABELS).map(([id, label]) => (
                <MenuItem key={id} value={id}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={closeTaskDialog} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save Changes'
              : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
