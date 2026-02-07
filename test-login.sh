#!/bin/bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@riverside-medical.nhs.uk","password":"Password123!"}'
