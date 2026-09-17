import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Chip, Avatar, IconButton, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, Menu
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { useParams } from 'react-router-dom';
import { MoreVert, CalendarToday, Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { setLoading } from '../../store/authSlice';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

const getPriorityColor = (priority) => {
    switch(priority) {
        case 'low': return 'info';
        case 'medium': return 'warning';
        case 'high': return 'error';
        case 'critical': return 'error';
        default: return 'default';
    }
};

const KanbanBoard = ({ projectId: propProjectId }) => {
  const { projectId: routeProjectId, id: routeId } = useParams();
  const isGlobalTasks = !propProjectId && !routeProjectId && !routeId;
  const projectId = propProjectId || routeProjectId || routeId;
  const { enqueueSnackbar } = useSnackbar();
  const authUser = useSelector((state) => state.auth.user);
  const userRole = authUser?.role || authUser?.role_name || '';
  const roleNormalized = userRole.toLowerCase().replace(' ', '_');
  const isStaff = ['admin', 'super_admin', 'mentor', 'placement_coordinator', 'team_lead', 'hr'].includes(roleNormalized);
  
  const  PAGE_SIZE = 5;
  const [tasks, setTasks] = useState({
    todo:[],in_inprogress:[],in_review:[],done:[]
  });
  const [columnPages, setColumnPages]= usestate({
    todo: 1,in_inprogress: 1,in_review:1,done:1
  });
   const [hasMore, setHasMore]= usestate({
    todo: true,in_inprogress: true,in_review: true,done:true
  });
   const [LoadingMore, setLoadingMore]= use.state({
    todo: false,in_inprogress: false,in_review:false,done:false
  });

  const[initialLoading, setInitialLoading]= useState(true);
  const [members, setMembers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  
  // Dialog State
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'feature',
    priority: 'medium',
    status: 'todo',
    assignee_id: '',
    story_points: 0,
    due_date: '',
    project_id: ''
  });

  // Details Modal State
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  // Card Menu State
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState(null);

  useEffect(() => {
    const loadInitialTasks = async ()=>{
      setInitialLoading(true);
      
      await Promise.all(
        COLUMNS.map(column=> fetchColumnTasks(column.id,1))
      );
      setInitialLoading(false);
    };
      if (!isGlobalTasks) {
        fetchProjectMembers(projectId);
      } else if (isStaff) {
        fetchAllProjects();
      }
  }, [projectId, isGlobalTasks]);

  const handleColumnScroll = (event,columnId)=>{
    const element = event.currentTarget;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

    if(
      distanceFromBottom < 150 && hasMore[columnID] && !loadingMore[columnId]){
        const nextPage = columnPages[columnId]+ 1;
        fetchColumnTasks(columnId,nextPage);
      }
  };

  overflowY:'auto';

  const fetchTasks = async (columnId , page = 1) => {
      try {
          setLoadingMore(prev =>({
          ...prev,[columnId]:true
          }));
          const params ={
            status:columnId,page,limit:PAGE_SIZE};
            let results;
          if (isGlobalTasks) {
              results = isStaff ? await taskApi.getAllTasks(params) : await taskApi.getUserTasks(params);
          } else {
              result = await taskApi.getProjectTasks(projectId,params);
          }
          const newTasks = result?.tasks || [];
          const pagination = result?.pagination;
          setTasks(prev=>({
            ...prev,[columnId]:page ===1 ? newTasks: [...prev[columnId],...newTasks]
          }));
          setColumnPages(prev=>({
            ...prev,
            columnId:page
          }));
          setHasMore(prev =({
            ...prev,[columnId] : pagination?.hasMore ?? (newTasks.length === PAGE_SIZE) }));
      } catch (err) {
          console.error(err);
      }
  };

  const fetchProjectMembers = async (pId) => {
      try {
          const data = await projectApi.getProjectMembers(pId);
          setMembers(data || []);
      } catch (err) {
          console.error('Failed to load project members', err);
      }
  };

  const fetchAllProjects = async () => {
      try {
          const res = await projectApi.getAllProjects({ limit: 50 });
          setAllProjects(res.projects || (Array.isArray(res) ? res : []));
      } catch (err) {
          console.error('Failed to load projects', err);
      }
  };

  const handleOpenCreate = (initialStatus = 'todo') => {
      setEditingTask(null);
      setFormData({
          title: '',
          description: '',
          type: 'feature',
          priority: 'medium',
          status: initialStatus,
          assignee_id: '',
          story_points: 0,
          due_date: '',
          project_id: allProjects.length > 0 ? allProjects[0].id : ''
      });
      setOpen(true);
  };

  const handleOpenEdit = (task) => {
      setEditingTask(task);
      setFormData({
          title: task.title,
          description: task.description || '',
          type: task.task_type || task.type || 'feature',
          priority: task.priority || 'medium',
          status: task.status,
          assignee_id: task.assignee_id || '',
          story_points: task.story_points || 0,
          due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
      });
      setOpen(true);
      handleMenuClose();
  };

  const handleClose = () => {
      setOpen(false);
  };

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title.trim()) {
          enqueueSnackbar('Task title is required', { variant: 'warning' });
          return;
      }

      setSubmitting(true);
      try {
          const basePayload = {
              title: formData.title,
              description: formData.description,
              type: formData.type,
              priority: formData.priority,
              status: formData.status,
              assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
              story_points: formData.story_points ? parseInt(formData.story_points) : 0,
              due_date: formData.due_date || null
          };

          if (editingTask) {
              await taskApi.updateTask(editingTask.id, basePayload);
              enqueueSnackbar('Task updated successfully', { variant: 'success' });
          } else {
              const pid = isGlobalTasks ? parseInt(formData.project_id) : parseInt(projectId);
              if (!pid) {
                  enqueueSnackbar('Please select a project', { variant: 'warning' });
                  setSubmitting(false);
                  return;
              }
              const createPayload = { ...basePayload, project_id: pid };
              await taskApi.createTask(createPayload);
              enqueueSnackbar('Task created successfully', { variant: 'success' });
          }
          handleClose();
          fetchTasks();
      } catch (err) {
          enqueueSnackbar(err.response?.data?.message || 'Failed to save task', { variant: 'error' });
      } finally {
          setSubmitting(false);
      }
  };

  const handleDeleteTask = async (taskId) => {
      if (window.confirm('Are you sure you want to delete this task?')) {
          try {
              await taskApi.deleteTask(taskId);
              enqueueSnackbar('Task deleted successfully', { variant: 'success' });
              fetchTasks(projectId);
          } catch (err) {
              enqueueSnackbar('Failed to delete task', { variant: 'error' });
          }
      }
      handleMenuClose();
  };

  const handleMenuClick = (e, task) => {
      e.stopPropagation();
      setMenuAnchor(e.currentTarget);
      setSelectedTaskForMenu(task);
  };

  const handleMenuClose = () => {
      setMenuAnchor(null);
      setSelectedTaskForMenu(null);
  };

  const handleOpenDetails = (task) => {
      setSelectedTaskDetails(task);
      setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
      setDetailsOpen(false);
      setSelectedTaskDetails(null);
  };
  const handleColumnScroll1 = (event,columnId)=>{
    const element = event.currentTarget;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if(distanceFromBottom < 150 && hasMore[columnId] ){
      const nextPage = columnPages[columnId] +1;
      fetchColumnTasks(columnId,nextPage);
  }
};
const[columnTotals,setColumnTotals]= useState({
  todo:0,inprogress:0,in_review:0,done:0});

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    let targetColumnId = destination.droppableId;
    if (!isStaff && targetColumnId === 'done') {
        enqueueSnackbar('Requires lead/coordinator approval. Moved to In Review instead.', { variant: 'info' });
        targetColumnId = 'in_review';
    }

    if (source.droppableId !== targetColumnId) {
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[targetColumnId];
      const sourceItems = [...sourceColumn];
      const destItems = destColumn ? [...destColumn] : [];
      
      const [removed] = sourceItems.splice(source.index, 1);
      removed.status = targetColumnId;
      destItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: sourceItems,
        [targetColumnId]: destItems
      });

      // API Call to update status
      try {
          await taskApi.updateTask(removed.id, { status: targetColumnId });
      } catch (e) {
          enqueueSnackbar('Failed to update task status on server', { variant: 'error' });
          fetchTasks(projectId); // rollback
      }
    } else {
      const column = tasks[source.droppableId];
      const copiedItems = [...column];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: copiedItems
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Board Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" fontWeight="bold">{isGlobalTasks && isStaff ? 'All Tasks Kanban' : 'Tasks Kanban'}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenCreate('todo')}>
          Create Task
        </Button>
      </Box>

      {/* Kanban Drag Area */}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', flexGrow: 1, pb: 2 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map(column => (
            <Box key={column.id} sx={{ minWidth: 320, width: 320, display: 'flex', flexDirection: 'column' }}>
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">{column.title}</Typography>
                  <Chip size="small" label={tasks[column.id]?.length || 0} />
              </Paper>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    onScroll={(event)=> handleColumnScroll1(event,columnId)}
                    sx={{
                      flexGrow: 1,
                      minHeight: 300,
                      p: 1.5,
                      bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'background.default',
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'divider',
                      overflowY: 'auto',
                      maxHeight: 'calc(100vh - 280px)'
                    }}
                  >
                    {tasks[column.id]?.map((item, index) => (
                      <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={snapshot.isDragging ? 4 : 1}
                            sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'background.paper', position: 'relative' }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleOpenDetails(item)}>
                                <Chip 
                                  size="small" 
                                  label={item.task_type || item.type || 'feature'} 
                                  sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }} 
                                />
                              </Box>
                              <IconButton size="small" onClick={(e) => handleMenuClick(e, item)}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box sx={{ cursor: 'pointer' }} onClick={() => handleOpenDetails(item)}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, pr: 2 }}>
                                {item.title}
                              </Typography>
                              {item.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {item.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                 <Chip size="small" color={getPriorityColor(item.priority)} label={item.priority} sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.7rem' }} />
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                   {item.due_date && (
                                     <Chip 
                                       size="small" 
                                       icon={<CalendarToday sx={{ fontSize: '0.8rem !important' }} />} 
                                       label={new Date(item.due_date).toLocaleDateString()} 
                                       variant="outlined"
                                       sx={{ height: 20, fontSize: '0.65rem' }} 
                                     />
                                   )}
                                   {item.assignee_avatar ? (
                                     <Avatar src={item.assignee_avatar} sx={{ width: 24, height: 24 }} />
                                   ) : (
                                     item.assignee_first_name && <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{item.assignee_first_name[0]}</Avatar>
                                   )}
                                 </Box>
                              </Box>
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </DragDropContext>
      </Box>

      {/* Task Card Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpenEdit(selectedTaskForMenu)}>
          <Edit sx={{ mr: 1, fontSize: '1rem' }} /> Edit Task
        </MenuItem>
        <MenuItem onClick={() => handleDeleteTask(selectedTaskForMenu.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: '1rem' }} /> Delete Task
        </MenuItem>
      </Menu>

      {/* Create / Edit Task Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight="bold">{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Project selector only shown on global tasks page when creating */}
            {isGlobalTasks && !editingTask && (
              <FormControl fullWidth required>
                <InputLabel>Project</InputLabel>
                <Select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleChange}
                  label="Project"
                >
                  {allProjects.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              autoFocus
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="feature">Feature</MenuItem>
                  <MenuItem value="bug">Bug</MenuItem>
                  <MenuItem value="learning">Learning</MenuItem>
                  <MenuItem value="infrastructure">Infrastructure</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="in_review">In Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select
                  name="assignee_id"
                  value={formData.assignee_id}
                  onChange={handleChange}
                  label="Assignee"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {members.map(m => (
                    <MenuItem key={m.id} value={m.user_id}>
                      {m.first_name} {m.last_name} ({m.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="story_points"
                label="Story Points"
                type="number"
                value={formData.story_points}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="due_date"
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Task'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedTaskDetails && (
          <>
            <DialogTitle fontWeight="bold">
              {selectedTaskDetails.title}
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip size="small" label={selectedTaskDetails.status.replace('_', ' ').toUpperCase()} />
                <Chip size="small" color={getPriorityColor(selectedTaskDetails.priority)} label={selectedTaskDetails.priority} sx={{ textTransform: 'capitalize' }} />
                <Chip size="small" variant="outlined" label={selectedTaskDetails.task_type || selectedTaskDetails.type || 'Feature'} sx={{ textTransform: 'capitalize' }} />
              </Box>

              <Typography variant="subtitle2" color="text.secondary">Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
                {selectedTaskDetails.description || 'No description provided.'}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assignee</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar src={selectedTaskDetails.assignee_avatar} sx={{ width: 24, height: 24 }}>
                      {selectedTaskDetails.assignee_first_name?.[0] || '?'}
                    </Avatar>
                    <Typography variant="body2">
                      {selectedTaskDetails.assignee_first_name ? `${selectedTaskDetails.assignee_first_name} ${selectedTaskDetails.assignee_last_name}` : 'Unassigned'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Reporter</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar src={selectedTaskDetails.creator_avatar} sx={{ width: 24, height: 24 }}>
                      {selectedTaskDetails.creator_first_name?.[0] || '?'}
                    </Avatar>
                    <Typography variant="body2">
                      {selectedTaskDetails.creator_first_name ? `${selectedTaskDetails.creator_first_name} ${selectedTaskDetails.creator_last_name}` : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {selectedTaskDetails.due_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2">{new Date(selectedTaskDetails.due_date).toLocaleDateString()}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Story Points</Typography>
                  <Typography variant="body2">{selectedTaskDetails.story_points || 0}</Typography>
                </Box>
              </Box>

            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;
