const getPlanLimits = (plan) => {
  const limits = {
    free: { maxUsers: 5, maxProjects: 3 },
    pro: { maxUsers: 25, maxProjects: 15 },
    enterprise: { maxUsers: 100, maxProjects: 50 }
  };
  
  return limits[plan] || limits.free;
};

const checkUserLimit = async (tenantId, pool) => {
  const [usersCount, tenant] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]),
    pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId])
  ]);
  
  const currentUsers = parseInt(usersCount.rows[0].count);
  const maxUsers = parseInt(tenant.rows[0]?.max_users || 5);
  
  return { canAdd: currentUsers < maxUsers, current: currentUsers, max: maxUsers };
};

const checkProjectLimit = async (tenantId, pool) => {
  const [projectsCount, tenant] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]),
    pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId])
  ]);
  
  const currentProjects = parseInt(projectsCount.rows[0].count);
  const maxProjects = parseInt(tenant.rows[0]?.max_projects || 3);
  
  return { canAdd: currentProjects < maxProjects, current: currentProjects, max: maxProjects };
};

module.exports = { getPlanLimits, checkUserLimit, checkProjectLimit };