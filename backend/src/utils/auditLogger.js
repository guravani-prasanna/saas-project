// backend/src/utils/auditLogger.js
const pool = require('../config/db');

const logAudit = async ({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  ipAddress,
}) => {
  const query = `
    INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
  `;
  const values = [tenantId || null, userId || null, action, entityType || null, entityId || null, ipAddress || null];
  await pool.query(query, values);
};

module.exports = { logAudit };
