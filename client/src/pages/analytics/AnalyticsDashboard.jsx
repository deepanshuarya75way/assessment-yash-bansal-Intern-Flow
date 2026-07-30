import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Divider, IconButton, CircularProgress, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, PictureAsPdf, Dashboard, GitHub } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { analyticsApi } from '../../api/analyticsApi';
import { exportApi } from '../../api/exportApi';
import { githubApi } from '../../api/githubApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSnackbar } from 'notistack';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [internProgress, setInternProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubStats, setGithubStats] = useState(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const role = user?.role || user?.role_name || '';
      const isStaff = ['admin', 'super_admin', 'mentor', 'placement_coordinator', 'team_lead'].includes(role.toLowerCase().replace(' ', '_'));
      
      let stats;
      if (isStaff) {
          stats = await analyticsApi.getSystemOverview();
          // For staff, we show global skills distribution instead of personal skills
          setData({ 
              tasks_distribution: stats.tasks_distribution, 
              skills_distribution: stats.skills_distribution 
          }); 
          
          const progress = await analyticsApi.getInternProgress();
          setInternProgress(progress);
      } else {
          stats = await analyticsApi.getUserAnalytics();
          setData(stats);
          
          if (user?.github_username) {
              setGithubLoading(true);
              try {
                  const ghStats = await githubApi.getMyStats();
                  setGithubStats(ghStats);
              } catch (e) {
                  console.error('Failed to fetch github stats', e);
              } finally {
                  setGithubLoading(false);
              }
          }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
      try {
          await exportApi.downloadCsv();
          enqueueSnackbar('CSV exported successfully', { variant: 'success' });
      } catch (err) {
          enqueueSnackbar('Failed to export CSV', { variant: 'error' });
      }
  };
  const handleDownloadPdf = async () => {
      try {
          await exportApi.downloadPdf();
          enqueueSnackbar('PDF exported successfully', { variant: 'success' });
      } catch (err) {
          enqueueSnackbar('Failed to export PDF', { variant: 'error' });
      }
  };

  if (loading) return <LoadingSpinner />;

  // Transform data for charts
  const taskChartData = data?.tasks_distribution?.map(t => ({
    name: (t.status || 'unknown').replace('_', ' ').toUpperCase(),
    value: Number(t.count || t.value || 0)
  })).filter(t => t.value > 0) || [];
  
  const role = user?.role || user?.role_name || '';
  const isStaff = ['admin', 'super_admin', 'mentor', 'placement_coordinator', 'team_lead'].includes(role.toLowerCase().replace(' ', '_'));

  let skillChartData = [];
  if (isStaff && data?.skills_distribution) {
      skillChartData = data.skills_distribution.map(s => ({
        name: s.name,
        value: Number(s.count || s.value || 0)
      })).filter(s => s.value > 0);
  } else if (!isStaff && data?.skills) {
      skillChartData = data.skills.map(s => ({ 
          name: s.name, 
          value: s.current_level === 'expert' ? 100 : s.current_level === 'advanced' ? 75 : s.current_level === 'intermediate' ? 50 : 25 
      }));
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">Analytics & Reports</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadCsv}>Export CSV</Button>
              <Button variant="contained" startIcon={<PictureAsPdf />} color="error" onClick={handleDownloadPdf}>Export PDF</Button>
          </Box>
      </Box>

      <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Task Distribution</Typography>
                  {taskChartData.length > 0 ? (
                      <Box sx={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={taskChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                                  {taskChartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                  ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                          <Typography color="text.secondary">No task distribution data available.</Typography>
                      </Box>
                  )}
              </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                      {isStaff ? 'Top Intern Skills' : 'Skill Proficiency'}
                  </Typography>
                  {skillChartData.length > 0 ? (
                      <Box sx={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={skillChartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                              <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 11 }} />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} name={isStaff ? 'Number of Interns' : 'Proficiency (%)'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                  ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                          <Typography color="text.secondary">No skill proficiency data available.</Typography>
                      </Box>
                  )}
              </Paper>
          </Grid>
          
          {internProgress.length > 0 && (
          <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 3, minHeight: 420 }}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Intern Task Completion Progress</Typography>
                  <Box sx={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={internProgress} margin={{ top: 20, right: 30, left: 10, bottom: 50 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="progressScore" fill="#34D399" radius={[6, 6, 0, 0]} name="Progress (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
              </Paper>
          </Grid>
          )}

          {!isStaff && (
          <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <GitHub sx={{ fontSize: 36, color: '#F1F5F9' }} />
                          <Box>
                              <Typography variant="h5" fontWeight="bold">GitHub Profile Integration</Typography>
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>Real-time contribution stats & activity tracking</Typography>
                          </Box>
                      </Box>
                      {user?.github_username ? (
                          <Chip label={`@${user.github_username}`} color="primary" sx={{ fontWeight: 'bold' }} />
                      ) : (
                          <Button variant="outlined" color="primary" href="/profile" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                              Link GitHub Profile
                          </Button>
                      )}
                  </Box>

                  {user?.github_username ? (
                      githubLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress color="inherit" /></Box>
                      ) : githubStats ? (
                          <Grid container spacing={3}>
                              <Grid item xs={6} sm={3}>
                                  <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <Typography variant="h4" fontWeight="bold" color="#60A5FA">{githubStats.publicRepos}</Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Public Repos</Typography>
                                  </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                  <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <Typography variant="h4" fontWeight="bold" color="#34D399">{githubStats.commitCount}</Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Recent Commits</Typography>
                                  </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                  <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <Typography variant="h4" fontWeight="bold" color="#FBBF24">{githubStats.prCount}</Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Pull Requests</Typography>
                                  </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                  <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <Typography variant="h6" fontWeight="bold" color="#A78BFA" sx={{ minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          {githubStats.topLanguages?.join(', ') || 'N/A'}
                                      </Typography>
                                      <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>Top Languages</Typography>
                                  </Box>
                              </Grid>
                          </Grid>
                      ) : (
                          <Typography variant="body2" color="error">Failed to load statistics from GitHub. Please check if your username is correct.</Typography>
                      )
                  ) : (
                      <Box sx={{ py: 2, textAlign: 'center' }}>
                          <Typography variant="body1" sx={{ opacity: 0.8 }}>Link your GitHub account in profile settings to display your coding activities.</Typography>
                      </Box>
                  )}
              </Paper>
          </Grid>
          )}

          <Grid item xs={12}>
              <Paper sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Dashboard sx={{ mr: 2, color: '#38BDF8' }} />
                      <Typography variant="h5" fontWeight="bold">Global System Overview</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
                      Socket.IO is actively monitoring global events. Real-time updates for notifications are enabled.
                  </Typography>
                  <Grid container spacing={3}>
                      <Grid item xs={4}>
                          <Typography variant="h3" fontWeight="bold" color="#4ADE80">Active</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>WebSockets Status</Typography>
                      </Grid>
                      <Grid item xs={4}>
                          <Typography variant="h3" fontWeight="bold" color="#FACC15">Configured</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>Email Services (Nodemailer)</Typography>
                      </Grid>
                  </Grid>
              </Paper>
          </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
