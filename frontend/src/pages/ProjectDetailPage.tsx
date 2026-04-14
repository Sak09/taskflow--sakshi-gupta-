import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Skeleton, Alert, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Stack, Tooltip,
  IconButton, LinearProgress, Grid, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useProject, useProjectStats } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskDialog from '../components/tasks/CreateTaskDialog';
import { statusColors } from '../theme';
import { Task, TaskStatus } from '../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [openCreate, setOpenCreate] = useState(false);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id!);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(id!, {
    status: statusFilter || undefined,
    limit: 100,
  });
  const { data: stats } = useProjectStats(id!);

  const tasks = tasksData?.data ?? [];

  const groupedByStatus = {
    todo: tasks.filter((t: Task) => t.status === 'todo'),
    in_progress: tasks.filter((t: Task) => t.status === 'in_progress'),
    done: tasks.filter((t: Task) => t.status === 'done'),
  };

  if (projectError) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
        <Alert severity="error">Project not found or you don't have access.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2, color: 'text.secondary', px: 1 }}
      >
        All Projects
      </Button>

      {/* Project header */}
      {projectLoading ? (
        <Box sx={{ mb: 4 }}>
          <Skeleton width={300} height={40} />
          <Skeleton width={500} height={24} sx={{ mt: 1 }} />
        </Box>
      ) : project && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} letterSpacing="-0.025em">{project.name}</Typography>
              {project.description && (
                <Typography variant="body1" color="text.secondary" mt={0.5}>{project.description}</Typography>
              )}
              <Typography variant="caption" color="text.secondary" mt={1} display="block">
                Created by {project.owner_name}
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)} sx={{ flexShrink: 0 }}>
              Add Task
            </Button>
          </Box>

          {/* Stats bar */}
          {stats && (
            <Box sx={{ mt: 3, p: 2.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Grid container spacing={2}>
                {Object.entries(statusColors).map(([status, { label, color, bg }]) => {
                  const count = stats.by_status[status as keyof typeof stats.by_status] || 0;
                  const total = Object.values(stats.by_status).reduce((a, b) => a + b, 0) || 1;
                  return (
                    <Grid item xs={4} key={status}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={800} sx={{ color }}>{count}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(count / total) * 100}
                          sx={{ mt: 1, bgcolor: bg, '& .MuiLinearProgress-bar': { bgcolor: color } }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Box>
      )}

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <FilterListIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {statusFilter && (
          <Button size="small" onClick={() => setStatusFilter('')} sx={{ color: 'text.secondary' }}>
            Clear filters
          </Button>
        )}
      </Box>

      {/* Task columns */}
      {tasksLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />)}
        </Stack>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 3, border: '2px dashed #E2E8F0' }}>
          <Typography variant="h6" fontWeight={700} mb={1}>No tasks yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {statusFilter ? 'No tasks match the current filter.' : 'Add your first task to get started.'}
          </Typography>
          {!statusFilter && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Add Task
            </Button>
          )}
        </Box>
      ) : statusFilter ? (
        // Flat list when filtered
        <Stack spacing={1.5}>
          {tasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} projectId={id!} />
          ))}
        </Stack>
      ) : (
        // Kanban-style grouped view
        <Grid container spacing={2.5}>
          {(Object.entries(groupedByStatus) as [TaskStatus, Task[]][]).map(([status, statusTasks]) => (
            <Grid item xs={12} md={4} key={status}>
              <Box sx={{ bgcolor: statusColors[status].bg, borderRadius: 2, p: 2, minHeight: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColors[status].color }} />
                    <Typography variant="overline" sx={{ color: statusColors[status].color, lineHeight: 1 }}>
                      {statusColors[status].label}
                    </Typography>
                  </Box>
                  <Chip label={statusTasks.length} size="small" sx={{ bgcolor: 'white', fontWeight: 700, height: 20, fontSize: '0.72rem' }} />
                </Box>
                <Stack spacing={1.5}>
                  {statusTasks.map((task) => (
                    <TaskCard key={task.id} task={task} projectId={id!} />
                  ))}
                  {statusTasks.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, opacity: 0.6 }}>
                      No tasks
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateTaskDialog open={openCreate} onClose={() => setOpenCreate(false)} projectId={id!} />
    </Box>
  );
}
