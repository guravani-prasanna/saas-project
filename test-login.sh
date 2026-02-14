#!/bin/bash
echo "=== Testing Login ==="
echo "1. Testing admin@demo.com..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"Demo@123","tenantSubdomain":"demo"}')
echo "Response: $ADMIN_RESPONSE"

echo -e "\n2. Testing user@demo.com..."
USER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@demo.com","password":"User@123","tenantSubdomain":"demo"}')
echo "Response: $USER_RESPONSE"

echo -e "\n3. Checking database state..."
docker exec database psql -U postgres -d saas_db -c "SELECT email, is_active, role, tenant_id IS NOT NULL as has_tenant FROM users;"
