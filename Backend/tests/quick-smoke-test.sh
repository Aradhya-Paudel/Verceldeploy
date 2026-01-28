#!/bin/bash

# Quick smoke test for hospital system
# Run this for fast validation before comprehensive tests

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   HOSPITAL SYSTEM - QUICK SMOKE TEST                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
PASS_COUNT=0
FAIL_COUNT=0

test_endpoint() {
  local NAME="$1"
  local METHOD="$2"
  local ENDPOINT="$3"
  local DATA="$4"
  
  echo -n "Testing: $NAME... "
  
  if [ "$METHOD" = "GET" ]; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ENDPOINT")
  else
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" \
      -H "Content-Type: application/json" \
      -d "$DATA" \
      "$BASE_URL$ENDPOINT")
  fi
  
  if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
    echo "✓ PASS (Status: $RESPONSE)"
    ((PASS_COUNT++))
  else
    echo "✗ FAIL (Status: $RESPONSE)"
    ((FAIL_COUNT++))
  fi
}

# Run tests
test_endpoint "Health Check" "GET" "/health"
test_endpoint "List Hospitals" "GET" "/api/hospitals"
test_endpoint "List Doctors" "GET" "/api/hospitals/1/doctors" 
test_endpoint "Match Request" "POST" "/api/match" '{"latitude": 27.7172, "longitude": 85.3240}'
test_endpoint "Get Hospital Single" "GET" "/api/hospitals/1"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
  echo "⚠ Some tests failed. Run 'node tests/comprehensive-test.js' for details."
  exit 1
else
  echo "✓ All smoke tests passed! System is healthy."
  exit 0
fi
