import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, CircularProgress, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useCreateProject } from '../../hooks/useProjects';
import { getApiError } from '../../utils/error';

interface FormData { name: string; description?: string; }
interface Props { open: boolean; onClose: () => void; }

export default function CreateProjectDialog({ open, onClose }: Props) {
  const createProject = useCreateProject();
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const handleClose = () => { reset(); setApiError(''); onClose(); };

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await createProject.mutateAsync(data);
      handleClose();
    } catch (err) {
      setApiError(getApiError(err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>New Project</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {apiError && <Alert severity="error" sx={{ borderRadius: 2 }}>{apiError}</Alert>}
          <TextField
            label="Project name"
            fullWidth
            autoFocus
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            placeholder="What is this project about?"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={createProject.isPending}>
            {createProject.isPending ? <CircularProgress size={18} color="inherit" /> : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
