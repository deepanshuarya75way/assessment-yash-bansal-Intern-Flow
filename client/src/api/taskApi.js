import axiosInstance from './axiosInstance';

export const taskApi = {
  getProjectTasks: async (projectId,params ={}) => {
    const response = await axiosInstance.get(`/tasks/project/${projectId}`,{params});
    return response.data.data;
  },

  getAllTasks: async (params ={}) => {
    const response = await axiosInstance.get('/tasks/all',{params});
    return response.data.data;
  },

  createTask: async (taskData) => {
    const response = await axiosInstance.post('/tasks', taskData);
    return response.data.data;
  },

  updateTask: async (id, taskData) => {
    const response = await axiosInstance.put(`/tasks/${id}`, taskData);
    return response.data.data;
  },

  deleteTask: async (id) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data.data;
  },

  getUserTasks: async (params = {}) => {
    const response = await axiosInstance.get('/tasks',{params});
    return response.data.data;
  }
};
