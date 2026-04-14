import { useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActionArea,
  Skeleton, Alert, Chip, Avatar, Tooltip, Pagination, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import { useNavigate } from 'react-router-dom';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { useAuthStore } from '../store/authStore';
import CreateProjectDialog from '../components/projects/CreateProjectDialog';
import { formatDistanceToNow } from 'date-fns';
import { Project } from '../types';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Menu, MenuItem, IconButton, ListItemIcon } from '@mui/material';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const { data, isLoading, error } = useProjects(page, 12);
  const deleteProject = useDeleteProject();
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);

  const projects = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.025em">Projects</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {meta?.total ?? 0} project{meta?.total !== 1 ? 's' : ''} accessible to you
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ flexShrink: 0 }}
        >
          New Project
        </Button>
      </Box>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>Failed to load projects. Please refresh.</Alert>}

      {/* Loading skeletons */}
      {isLoading && (
        <Grid container spacing={2.5}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={170} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <Box sx={{
          textAlign: 'center', py: 10, px: 2,
          bgcolor: 'white', borderRadius: 3, border: '2px dashed #E2E8F0',
        }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: 3, mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Typography variant="h6" fontWeight={700} mb={1}>No projects yet</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project to start organizing tasks.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Create Project
          </Button>
        </Box>
      )}

      {/* Project grid */}
      {!isLoading && projects.length > 0 && (
        <>
          <Grid container spacing={2.5}>
            {projects.map((project: Project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card elevation={0} sx={{ height: '100%', position: 'relative' }}>
                  <CardActionArea
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ height: '100%', p: 0 }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{
                          width: 42, height: 42, borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <FolderIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        </Box>
                        {project.owner_id === user?.id && (
                          <Chip label="Owner" size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.dark', fontWeight: 600, fontSize: '0.68rem' }} />
                        )}
                      </Box>

                      <Typography variant="subtitle1" fontWeight={700} mb={0.5} noWrap>
                        {project.name}
                      </Typography>
                      {project.description && (
                        <Typography variant="body2" color="text.secondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, flex: 1,
                        }}>
                          {project.description}
                        </Typography>
                      )}

                      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <TaskAltIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {project.task_count} task{project.task_count !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>

                  {/* Project menu (owner only) */}
                  {project.owner_id === user?.id && (
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 12, right: 12, opacity: 0, '.MuiCard-root:hover &': { opacity: 1 }, transition: 'opacity 0.15s' }}
                      onClick={(e) => { e.stopPropagation(); setMenuAnchor({ el: e.currentTarget, id: project.id }); }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Stack alignItems="center" mt={4}>
              <Pagination
                count={meta.totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          )}
        </>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid #E2E8F0', minWidth: 160 } }}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) deleteProject.mutate(menuAnchor.id);
            setMenuAnchor(null);
          }}
          sx={{ color: 'error.main', gap: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 'auto', color: 'error.main' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          Delete project
        </MenuItem>
      </Menu>

      <CreateProjectDialog open={openCreate} onClose={() => setOpenCreate(false)} />
    </Box>
  );
}
