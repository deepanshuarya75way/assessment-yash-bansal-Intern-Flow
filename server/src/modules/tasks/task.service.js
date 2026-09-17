import pool from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export const createTask = async (taskData, creatorId) => {
    const { 
        project_id, sprint_id, title, description, 
        type, task_type, priority, status, assignee_id, story_points, due_date 
    } = taskData;

    // Check project exists
    const [projects] = await pool.query('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) throw ApiError.notFound('Project not found');

    const resolvedType = task_type || type || 'feature';

    const [result] = await pool.query(
        `INSERT INTO tasks (
            project_id, sprint_id, reporter_id, assignee_id, 
            title, description, task_type, priority, status, 
            story_points, due_date
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            project_id, sprint_id || null, creatorId, assignee_id || null,
            title, description || null, resolvedType, priority || 'medium', status || 'todo',
            story_points || 0, due_date || null
        ]
    );

    return getTaskById(result.insertId);
};

export const getTaskById = async (id) => {
    const [tasks] = await pool.query(
        `SELECT t.*, 
                c.first_name as creator_first_name, c.last_name as creator_last_name, c.profile_picture_url as creator_avatar,
                a.first_name as assignee_first_name, a.last_name as assignee_last_name, a.profile_picture_url as assignee_avatar,
                p.name as project_name, s.name as sprint_name
         FROM tasks t
         LEFT JOIN users c ON t.reporter_id = c.id
         LEFT JOIN users a ON t.assignee_id = a.id
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN sprints s ON t.sprint_id = s.id
         WHERE t.id = ?`, 
        [id]
    );
    
    if (tasks.length === 0) throw ApiError.notFound('Task not found');
    return tasks[0];
};

export const getTasksByProject = async (projectId, sprintId = undefined ,status = undefined,page = 1, limit = 5) => {

     const safePage = Math.max(1, Number(page) || 1);
     const safeLimit = Math.min(5, Math.max(1, Number(limit) || 5));
     const offset = (safePage - 1) * safeLimit;

     let whereClause = `WHERE t.project_id = ?`;
     const params1 = [projectId];

     if(sprintId === null){
        whereClause += `AND t.spring_id IS NULL`;
     }else if(sprintId !== undefined){
        whereClause += `AND t.sprint_id = ?`;
        params1.push(sprintId);
     }
     if(status){
        whereClause += `AND t.status = ?`;
        params1.push(status);
     }

     const [constResult]= await pool.query(
        `SELECT COUNT(*) as total from tasks t ${whereClause},params1`
     );

     const total = Number(countResult[0]?.total || 0);

     const [tasks] = await pool.query(`
        SELECT t.*, 
               c.first_name as creator_first_name, c.last_name as creator_last_name, c.profile_picture_url as creator_avatar,
               a.first_name as assignee_first_name, a.last_name as assignee_last_name, a.profile_picture_url as assignee_avatar
        FROM tasks t
        LEFT JOIN users c ON t.reporter_id = c.id
        LEFT JOIN users a ON t.assignee_id = a.id${whereClause}ORDERED BY t.created_at DESC LIMIT ? OFFSET ?`,[...params1,safeLimit,offset]);
    

   
    return {
        tasks,pagination:{
            page:safePage,
            limit:safeLimit,
            total,
            hasMore:offset +tasks.length<total
        }
    };
};

export const updateTask = async (id, updateData) => {
    const fields = [];
    const values = [];

    // Map frontend keys to backend database column names if necessary
    if (updateData.type !== undefined) {
        updateData.task_type = updateData.type;
        delete updateData.type;
    }
    if (updateData.creator_id !== undefined) {
        updateData.reporter_id = updateData.creator_id;
        delete updateData.creator_id;
    }

    Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
    });

    if (fields.length === 0) return getTaskById(id);

    values.push(id);
    await pool.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return getTaskById(id);
};

export const deleteTask = async (id) => {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) throw ApiError.notFound('Task not found');
};

export const assignTask = async (taskId, assigneeId) => {
    await pool.query('UPDATE tasks SET assignee_id = ? WHERE id = ?', [assigneeId, taskId]);
    return getTaskById(taskId);
};

export const getTasksByUser = async (userId,status= undefined,page = 1,limit = 5) => {
    const safePage = Math.max(1, Number(page) || 1);
     const safeLimit = Math.min(5, Math.max(1, Number(limit) || 5));
     const offset = (safePage - 1) * safeLimit;

     let whereClause = `WHERE t.assignee_id = ?`;
     const baseParams = [userId];

     if(status){
        whereClause += `AND t.status = ?`;
        baseParams.push(status);
     }

     const [countResult] = await pool.query(
        `SELECT COUNT(*)   as total form task t ${whereClause}`,baseParams);
    const total = Number(countResult[0]?.total || 0);
    const [tasks] = await pool.query(
        `SELECT t.*, 
                c.first_name as creator_first_name, c.last_name as creator_last_name, c.profile_picture_url as creator_avatar,
                a.first_name as assignee_first_name, a.last_name as assignee_last_name, a.profile_picture_url as assignee_avatar,
                p.name as project_name
         FROM tasks t
         LEFT JOIN users c ON t.reporter_id = c.id
         LEFT JOIN users a ON t.assignee_id = a.id
         LEFT JOIN projects p ON t.project_id = p.id
         WHERE t.assignee_id = ?
         ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,[...baseParams,safeLimit,offset]);
    return {tasks,pagination:{
        page: safePage,limit: safeLimit,total,hasMore: offset +tasks.length < total
    }};
};

export const getAllTasks = async () => {
    const [tasks] = await pool.query(
        `SELECT t.*, 
                c.first_name as creator_first_name, c.last_name as creator_last_name, c.profile_picture_url as creator_avatar,
                a.first_name as assignee_first_name, a.last_name as assignee_last_name, a.profile_picture_url as assignee_avatar,
                p.name as project_name
         FROM tasks t
         LEFT JOIN users c ON t.reporter_id = c.id
         LEFT JOIN users a ON t.assignee_id = a.id
         LEFT JOIN projects p ON t.project_id = p.id
         ORDER BY t.created_at DESC`
    );
    return tasks;
};
