import { useState } from 'react';
import {
  Box, Typography, Chip, IconButton, Menu, MenuItem, Tooltip,
  Avatar, ListItemIcon, Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { Task, TaskStatus } from '../../types';
import { statusColors, priorityColors } from '../../theme';
import { useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import EditTaskDialog from './EditTaskDialog';
import { format, isPast, parseISO } from 'date-fns';

const STATUS_TRANSITIONS: Record<TaskStatus, { next: TaskStatus; label: string }> = {
  todo: { next: 'in_progress', label: 'Start' },
  in_progress: { next: 'done', label: 'Complete' },
  done: { next: 'todo', label: 'Reopen' },
};

interface Props { task: Task; projectId: string; }

export default function TaskCard({ task, projectId }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const handleStatusChange = () => {
    const next = STATUS_TRANSITIONS[task.status].next;
    updateTask.mutate({ taskId: task.id, payload: { status: next } });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    setAnchorEl(null);
  };

  const isOverdue = task.due_date && !['done'].includes(task.status) && isPast(parseISO(task.due_date));
  const statusInfo = statusColors[task.status];
  const priorityInfo = priorityColors[task.priority];

  return (
    <>
      <Box sx={{
        bgcolor: 'white', borderRadius: 2, p: 2, border: '1px solid #E2E8F0',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: 'primary.light', boxShadow: '0 2px 8px rgba(99,102,241,0.12)' },
        opacity: updateTask.isPending ? 0.7 : 1,
      }}>
        {/* Top row: title + menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1, lineHeight: 1.4 }}>
            {task.title}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{ mt: -0.5, mr: -0.5, flexShrink: 0, opacity: 0.5, '&:hover': { opacity: 1 } }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {task.description && (
          <Typography variant="caption" color="text.secondary" sx={{
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', mt: 0.5, lineHeight: 1.5,
          }}>
            {task.description}
          </Typography>
        )}

        {/* Tags row */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
          <Chip
            label={priorityInfo.label}
            size="small"
            onClick={handleStatusChange}
            sx={{
              bgcolor: priorityInfo.bg, color: priorityInfo.color,
              fontSize: '0.68rem', height: 20, cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
          />
          <Chip
            label={statusInfo.label}
            size="small"
            onClick={handleStatusChange}
            sx={{
              bgcolor: statusInfo.bg, color: statusInfo.color,
              fontSize: '0.68rem', height: 20, cursor: 'pointer',
              '&:hover': { opacity: 0.85 },
            }}
          />
        </Box>

        {/* Bottom meta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.due_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarTodayIcon sx={{ fontSize: 12, color: isOverdue ? 'error.main' : 'text.secondary' }} />
                <Typography
                  variant="caption"
                  sx={{ color: isOverdue ? 'error.main' : 'text.secondary', fontWeight: isOverdue ? 600 : 400 }}
                >
                  {format(parseISO(task.due_date), 'MMM d')}
                </Typography>
              </Box>
            )}
          </Box>

          {task.assignee_name && (
            <Tooltip title={task.assignee_name}>
              <Avatar sx={{ width: 22, height: 22, bgcolor: 'primary.light', fontSize: '0.6rem', fontWeight: 700 }}>
                {task.assignee_name.slice(0, 2).toUpperCase()}
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #E2E8F0', minWidth: 160, boxShadow: 3 } }}
      >
        <MenuItem onClick={() => { setEditOpen(true); setAnchorEl(null); }} sx={{ gap: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 'auto' }}><EditIcon fontSize="small" /></ListItemIcon>
          Edit task
        </MenuItem>
        <MenuItem
          onClick={() => {
            const next = STATUS_TRANSITIONS[task.status].next;
            updateTask.mutate({ taskId: task.id, payload: { status: next } });
            setAnchorEl(null);
          }}
          sx={{ gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 'auto' }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: statusColors[STATUS_TRANSITIONS[task.status].next].color }} />
          </ListItemIcon>
          {STATUS_TRANSITIONS[task.status].label}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ gap: 1.5, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 'auto', color: 'error.main' }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <EditTaskDialog open={editOpen} onClose={() => setEditOpen(false)} task={task} projectId={projectId} />
    </>
  );
}
