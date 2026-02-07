#!/bin/bash

# ============================================================================
#  🏥 KAIRO API - RALPH WIGGUM INFINITE TEST LOOP 🏥
#  "Hi Super Nintendo Chalmers!"
# ============================================================================

# Configuration
API_URL="${API_URL:-http://localhost:3001/api}"
DELAY_BETWEEN_LOOPS=5

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
LOOP_COUNT=0

# Ralph Wiggum quotes
RALPH_QUOTES=(
  "I'm learnding!"
  "Hi Super Nintendo Chalmers!"
  "Me fail English? That's unpossible!"
  "I bent my wookie."
  "My cat's breath smells like cat food."
  "I eated the purple berries."
  "It tastes like burning!"
  "When I grow up, I want to be a principal or a caterpillar."
  "I'm a unitard!"
  "The doctor said I wouldn't have so many nosebleeds if I kept my finger outta there."
  "I picked a winner!"
  "That's where I saw the leprechaun. He tells me to burn things."
  "Go banana!"
  "Sleep! That's where I'm a Viking!"
  "I found a moon rock in my nose!"
  "Even my boogers are spicy!"
  "What's a battle?"
  "They taste like grandma!"
  "I'm a healthcare professional!"
  "My doctor says I'm a patient!"
)

# Store tokens
ACCESS_TOKEN=""
PRACTICE_ID=""

# Create temp file for login JSON - use correct credentials from seed
LOGIN_JSON_FILE="/tmp/kairo_login.json"
cat > "$LOGIN_JSON_FILE" << 'EOF'
{"email":"admin@riverside-medical.nhs.uk","password":"Password123!"}
EOF

# Get random Ralph quote
get_ralph_quote() {
  echo "${RALPH_QUOTES[$RANDOM % ${#RALPH_QUOTES[@]}]}"
}

# Print header
print_header() {
  clear
  local quote=$(get_ralph_quote)
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║  🏥 KAIRO API - RALPH WIGGUM INFINITE TEST LOOP 🏥              ║"
  printf "║  Loop #%-4d                                                     ║\n" "$LOOP_COUNT"
  echo "╠══════════════════════════════════════════════════════════════════╣"
  printf "║  🧒 \"%-59s\" ║\n" "${quote:0:59}"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# Print statistics
print_stats() {
  local success_rate=0
  if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc 2>/dev/null || echo "0")
  fi

  echo -e "${PURPLE}╭──────────────────────────────────────────────────────────────────╮"
  echo -e "│  📊 Test Statistics                                              │"
  echo -e "├──────────────────────────────────────────────────────────────────┤"
  printf "│  Total Tests: %-5d   ${GREEN}✅ Passed: %-5d${PURPLE}   ${RED}❌ Failed: %-5d${PURPLE}    │\n" "$TOTAL_TESTS" "$PASSED_TESTS" "$FAILED_TESTS"
  printf "│  Success Rate: ${NC}${BOLD}%5.1f%%${PURPLE}                                            │\n" "$success_rate"
  echo -e "╰──────────────────────────────────────────────────────────────────╯${NC}"
  echo ""
}

# Run a test
run_test() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_code="${4:-200}"
  local auth="${5:-true}"

  printf "${YELLOW}  🧪 %-35s${NC} " "$test_name"

  local http_code
  local start_time=$(date +%s)

  if [ "$method" = "GET" ]; then
    if [ "$auth" = "true" ] && [ -n "$ACCESS_TOKEN" ]; then
      http_code=$(curl -s -o /tmp/kairo_response.json -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "${API_URL}${endpoint}" 2>/dev/null)
    else
      http_code=$(curl -s -o /tmp/kairo_response.json -w "%{http_code}" \
        -H "Content-Type: application/json" \
        "${API_URL}${endpoint}" 2>/dev/null)
    fi
  fi

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [ "$http_code" = "$expected_code" ] || [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    printf "${GREEN}✅ PASS${NC} (HTTP %s) ${BLUE}%ds${NC}\n" "$http_code" "$duration"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    printf "${RED}❌ FAIL${NC} (Expected: %s, Got: %s) ${BLUE}%ds${NC}\n" "$expected_code" "$http_code" "$duration"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Login and get token
do_login() {
  printf "${YELLOW}  🔐 %-35s${NC} " "Login"

  local start_time=$(date +%s)
  local response=$(curl -s -X POST "${API_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d @"$LOGIN_JSON_FILE" 2>/dev/null)
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  ACCESS_TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if [ -n "$ACCESS_TOKEN" ]; then
    printf "${GREEN}✅ PASS${NC} (HTTP 200) ${BLUE}%ds${NC}\n" "$duration"
    PRACTICE_ID=$(echo "$response" | grep -o '"practiceId":"[^"]*' | cut -d'"' -f4)
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    printf "${RED}❌ FAIL${NC} ${BLUE}%ds${NC}\n" "$duration"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Test suite
run_test_suite() {
  echo -e "${BLUE}╭──────────────────────────────────────────────────────────────────╮"
  echo -e "│  🔄 Running Test Suite                                           │"
  echo -e "╰──────────────────────────────────────────────────────────────────╯${NC}"
  echo ""

  # Auth Tests
  echo -e "${CYAN}  ┌─ 🔐 Auth Endpoints${NC}"
  if do_login; then
    run_test "Get Profile" "GET" "/auth/profile" "200" "true"
  fi
  echo ""

  # Patient Tests
  echo -e "${CYAN}  ┌─ 👥 Patient Endpoints${NC}"
  run_test "List Patients" "GET" "/patients" "200" "true"
  run_test "Get Patient Stats" "GET" "/patients/stats" "200" "true"
  run_test "Search Patients" "GET" "/patients?search=John" "200" "true"
  run_test "Filter by Status" "GET" "/patients?status=ACTIVE" "200" "true"
  echo ""

  # Appointment Tests
  echo -e "${CYAN}  ┌─ 📅 Appointment Endpoints${NC}"
  run_test "List Appointments" "GET" "/appointments" "200" "true"
  run_test "Get Appointment Stats" "GET" "/appointments/stats" "200" "true"
  local today=$(date +%Y-%m-%d)
  run_test "Today's Appointments" "GET" "/appointments?startDate=${today}T00:00:00Z&endDate=${today}T23:59:59Z" "200" "true"
  echo ""

  # Staff Tests
  echo -e "${CYAN}  ┌─ 👨‍⚕️ Staff Endpoints${NC}"
  run_test "List Staff" "GET" "/staff" "200" "true"
  run_test "Get Clinicians" "GET" "/staff/clinicians" "200" "true"
  run_test "Filter GPs" "GET" "/staff?role=GP_PARTNER" "200" "true"
  echo ""

  # Practice Tests
  echo -e "${CYAN}  ┌─ 🏢 Practice Endpoints${NC}"
  run_test "Get Current Practice" "GET" "/practices/current" "200" "true"
  run_test "Get Pharmacies" "GET" "/practices/current/pharmacies" "200" "true"
  run_test "Get Rooms" "GET" "/practices/current/rooms" "200" "true"
  run_test "Get Appointment Types" "GET" "/practices/current/appointment-types" "200" "true"
  echo ""
}

# Cleanup on exit
cleanup() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗"
  echo -e "║  🛑 Test Loop Stopped                                            ║"
  echo -e "╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  print_stats
  echo -e "${PURPLE}🧒 Ralph's final words: \"$(get_ralph_quote)\"${NC}"
  echo ""
  rm -f "$LOGIN_JSON_FILE"
  rm -f /tmp/kairo_response.json
  exit 0
}

trap cleanup SIGINT SIGTERM

# Check if API is running
check_api() {
  echo -e "${YELLOW}🔍 Checking if API is running at $API_URL...${NC}"

  # Check if we can reach the auth endpoint (even 401 means API is running)
  local http_code=$(curl -s --connect-timeout 5 -o /dev/null -w "%{http_code}" "${API_URL}/auth/profile" 2>/dev/null)

  if [ "$http_code" = "401" ] || [ "$http_code" = "200" ] || [ "$http_code" = "403" ]; then
    echo -e "${GREEN}✅ API is running!${NC}"
    return 0
  else
    echo -e "${RED}❌ API is not responding! (HTTP: $http_code)${NC}"
    echo ""
    echo -e "${YELLOW}Please start the API first:${NC}"
    echo "  cd /Users/abandiki/kairo"
    echo "  pnpm --filter api dev"
    echo ""
    echo -e "${YELLOW}Waiting for API to become available...${NC}"

    while true; do
      http_code=$(curl -s --connect-timeout 2 -o /dev/null -w "%{http_code}" "${API_URL}/auth/profile" 2>/dev/null)
      if [ "$http_code" = "401" ] || [ "$http_code" = "200" ] || [ "$http_code" = "403" ]; then
        echo -e "${GREEN}✅ API is now available!${NC}"
        return 0
      fi
      sleep 2
      echo -n "."
    done
  fi
}

# Main function
main() {
  echo -e "${CYAN}"
  echo "╔══════════════════════════════════════════════════════════════════╗"
  echo "║                                                                  ║"
  echo "║   🏥  KAIRO - GP PRACTICE MANAGEMENT SYSTEM  🏥                  ║"
  echo "║                                                                  ║"
  echo "║   ╭──────────────────────────────────────────────────────────╮   ║"
  echo "║   │  RALPH WIGGUM INFINITE API TEST LOOP                     │   ║"
  echo "║   ╰──────────────────────────────────────────────────────────╯   ║"
  echo "║                                                                  ║"
  echo "║   🧒 \"I'm learnding!\"                                            ║"
  echo "║                                                                  ║"
  echo "╚══════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""

  # Check if API is running
  check_api

  echo ""
  echo -e "${PURPLE}Press Ctrl+C to stop the test loop${NC}"
  echo ""
  sleep 2

  # Infinite loop
  while true; do
    LOOP_COUNT=$((LOOP_COUNT + 1))

    print_header
    print_stats

    run_test_suite

    print_stats

    echo -e "${CYAN}⏳ Next loop in ${DELAY_BETWEEN_LOOPS} seconds...${NC}"
    echo -e "${PURPLE}   Ralph whispers: \"$(get_ralph_quote)\"${NC}"
    echo ""
    sleep $DELAY_BETWEEN_LOOPS
  done
}

# Run main
main
