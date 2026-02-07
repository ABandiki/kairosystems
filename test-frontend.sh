#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3001/api"
WEB_URL="http://localhost:3000"

# Counters
PASS=0
FAIL=0
TOTAL=0

# Ralph Wiggum quotes
QUOTES=(
  "Me fail English? That's unpossible!"
  "I'm learnding!"
  "My cat's breath smells like cat food."
  "I bent my wookiee."
  "I found a moonrock in my nose!"
  "I'm a unitard!"
  "That's where I saw the Leprechaun!"
  "The doctor said I wouldn't have so many nose bleeds if I kept my finger outta there."
)

random_quote() {
  echo "${QUOTES[$RANDOM % ${#QUOTES[@]}]}"
}

# Test function
test_endpoint() {
  local name="$1"
  local method="$2"
  local url="$3"
  local expected_status="$4"
  local auth="$5"
  local data="$6"

  TOTAL=$((TOTAL + 1))

  local curl_cmd="curl -s -o /dev/null -w '%{http_code}' -X $method"

  if [ -n "$auth" ]; then
    curl_cmd="$curl_cmd -H 'Authorization: Bearer $auth'"
  fi

  curl_cmd="$curl_cmd -H 'Content-Type: application/json'"

  if [ -n "$data" ]; then
    curl_cmd="$curl_cmd -d '$data'"
  fi

  curl_cmd="$curl_cmd '$url'"

  local status=$(eval $curl_cmd)

  if [ "$status" == "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $name (HTTP $status)"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $name (Expected: $expected_status, Got: $status)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# Check if services are running
echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      KAIRO FRONTEND TEST SUITE                             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Checking services...${NC}\n"

# Check API
if curl -s "$API_URL/health" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} API is running on port 3001"
else
  echo -e "${RED}✗${NC} API is NOT running on port 3001"
  echo -e "${YELLOW}Please start the API: npx pnpm --filter api dev${NC}"
  exit 1
fi

# Check Web
if curl -s "$WEB_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Web frontend is running on port 3000"
else
  echo -e "${YELLOW}!${NC} Web frontend may not be running on port 3000"
fi

echo ""

# Login and get token
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Authentication Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@riverside-medical.nhs.uk","password":"Password123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓${NC} Login successful - token obtained"
  PASS=$((PASS + 1))
  TOTAL=$((TOTAL + 1))
else
  echo -e "${RED}✗${NC} Login failed - no token"
  echo "Response: $LOGIN_RESPONSE"
  FAIL=$((FAIL + 1))
  TOTAL=$((TOTAL + 1))
  exit 1
fi

# Test unauthenticated access
echo ""
test_endpoint "Unauthenticated /staff returns 401" "GET" "$API_URL/staff" "401" "" ""
test_endpoint "Unauthenticated /patients returns 401" "GET" "$API_URL/patients" "401" "" ""
test_endpoint "Unauthenticated /practices/current returns 401" "GET" "$API_URL/practices/current" "401" "" ""

# Test authenticated endpoints
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  API Endpoint Tests (Authenticated)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET /auth/profile" "GET" "$API_URL/auth/profile" "200" "$TOKEN" ""
test_endpoint "GET /staff" "GET" "$API_URL/staff" "200" "$TOKEN" ""
test_endpoint "GET /staff/clinicians" "GET" "$API_URL/staff/clinicians" "200" "$TOKEN" ""
test_endpoint "GET /patients" "GET" "$API_URL/patients" "200" "$TOKEN" ""
test_endpoint "GET /patients/stats" "GET" "$API_URL/patients/stats" "200" "$TOKEN" ""
test_endpoint "GET /practices/current" "GET" "$API_URL/practices/current" "200" "$TOKEN" ""
test_endpoint "GET /practices/current/rooms" "GET" "$API_URL/practices/current/rooms" "200" "$TOKEN" ""
test_endpoint "GET /practices/current/pharmacies" "GET" "$API_URL/practices/current/pharmacies" "200" "$TOKEN" ""
test_endpoint "GET /practices/current/appointment-types" "GET" "$API_URL/practices/current/appointment-types" "200" "$TOKEN" ""
test_endpoint "GET /appointments" "GET" "$API_URL/appointments" "200" "$TOKEN" ""
test_endpoint "GET /appointments/stats" "GET" "$API_URL/appointments/stats" "200" "$TOKEN" ""

# Test frontend pages
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Frontend Page Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

test_endpoint "GET /login page" "GET" "$WEB_URL/login" "200" "" ""
test_endpoint "GET /dashboard page" "GET" "$WEB_URL/dashboard" "200" "" ""
test_endpoint "GET /appointments page" "GET" "$WEB_URL/appointments" "200" "" ""
test_endpoint "GET /patients page" "GET" "$WEB_URL/patients" "200" "" ""
test_endpoint "GET /staff page" "GET" "$WEB_URL/staff" "200" "" ""
test_endpoint "GET /settings page" "GET" "$WEB_URL/settings" "200" "" ""
test_endpoint "GET /profile page" "GET" "$WEB_URL/profile" "200" "" ""

# Summary
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     TEST SUMMARY                           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}\n"

PERCENT=$((PASS * 100 / TOTAL))

echo -e "  Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "  Passed:      ${GREEN}$PASS${NC}"
echo -e "  Failed:      ${RED}$FAIL${NC}"
echo -e "  Success:     ${YELLOW}$PERCENT%${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  echo -e "\n${CYAN}Ralph says: \"$(random_quote)\"${NC}\n"
else
  echo -e "${RED}Some tests failed.${NC}"
  echo -e "\n${CYAN}Ralph says: \"$(random_quote)\"${NC}\n"
fi

exit $FAIL
