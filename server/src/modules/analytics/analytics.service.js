import pool from '../../config/database.js';

export const getSystemOverview = async () => {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM projects');
    const [internshipCount] = await pool.query('SELECT COUNT(*) as count FROM internships');
    
    // Task completion rate
    const [tasks] = await pool.query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
    
    // Global skills distribution
    const [globalSkills] = await pool.query(`
        SELECT s.name, COUNT(us.id) as count 
        FROM user_skills us 
        JOIN skills s ON us.skill_id = s.id 
        JOIN users u ON us.user_id = u.id
        WHERE u.role_id = 3
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 10
    `);

    return {
        users: Number(userCount[0]?.count || 0),
        projects: Number(projectCount[0]?.count || 0),
        internships: Number(internshipCount[0]?.count || 0),
        tasks_distribution: tasks.map(t => ({ status: t.status, count: Number(t.count) })),
        skills_distribution: globalSkills.map(s => ({ name: s.name, count: Number(s.count) }))
    };
};

export const getUserAnalytics = async (userId) => {
    // Skills
    const [skills] = await pool.query(`
        SELECT s.name, us.current_level 
        FROM user_skills us JOIN skills s ON us.skill_id = s.id 
        WHERE us.user_id = ?`, [userId]);
    
    // Tasks
    const [tasks] = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM tasks WHERE assignee_id = ? GROUP BY status`, [userId]);

    // Mock Interviews
    const [interviews] = await pool.query(`
        SELECT score, status, type, interview_date FROM mock_interviews WHERE user_id = ?`, [userId]);

    return {
        skills,
        tasks_distribution: tasks.map(t => ({ status: t.status, count: Number(t.count) })),
        mock_interviews: interviews
    };
};

export const getInternProgress = async (userId, role) => {
    let interns = [];
    if (role === 'admin' || role === 'super_admin' || role === 'placement_coordinator' || role === 'mentor' || role === 'team_lead') {
        const [rows] = await pool.query(`SELECT id, first_name, last_name, department FROM users WHERE role_id = 3`);
        interns = rows;
    } else {
        const [rows] = await pool.query(`SELECT id, first_name, last_name, department FROM users WHERE id = ?`, [userId]);
        interns = rows;
    }

    const progressData = [];
    for (const intern of interns) {
        const [tasks] = await pool.query(`SELECT status, COUNT(*) as count FROM tasks WHERE assignee_id = ? GROUP BY status`, [intern.id]);
        let total = 0, completed = 0;
        tasks.forEach(t => {
            const cnt = Number(t.count);
            total += cnt;
            if (t.status === 'done') completed += cnt;
        });
        
        const progressScore = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        progressData.push({
            id: intern.id,
            name: `${intern.first_name} ${intern.last_name}`,
            department: intern.department,
            tasksCompleted: completed,
            tasksTotal: total,
            progressScore
        });
    }
    return progressData;
};
