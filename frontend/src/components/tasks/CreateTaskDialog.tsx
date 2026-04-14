import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Grid, CircularProgress, Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { useCreateTask } from '../../hooks/useTasks';
import { getApiError } from '../../utils/error';
import { TaskStatus, TaskPriority } from '../../types';

interface FormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

interface Props { open: boolean; onClose: () => void; projectId: string; }

export default function CreateTaskDialog({ open, onClose, projectId }: Props) {
  const createTask = useCreateTask(projectId);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { status: 'todo', priority: 'medium' },
  });

  const handleClose = () => {
    reset();
    setApiError('');
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await createTask.mutateAsync({
        ...data,
        due_date: data.due_date || undefined,
        assignee_id: data.assignee_id || undefined,
      });
      handleClose();
    } catch (err) {
      setApiError(getApiError(err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Create Task</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {apiError && <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>}

          <TextField
            label="Title"
            fullWidth
            autoFocus
            {...register('title', { required: 'Title is required' })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Status">
                      <MenuItem value="todo">To Do</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="done">Done</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Priority">
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('due_date')}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createTask.isPending}>
            {createTask.isPending ? <CircularProgress size={18} color="inherit" /> : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
