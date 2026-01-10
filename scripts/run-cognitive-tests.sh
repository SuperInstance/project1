#!/bin/bash

# Automated Cognitive AI Integration Tests

echo "🚀 COGNITIVE AI INTEGRATION TESTS"
echo ""

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

print_result() {
    local test_name="$1"
    local result="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo "PASS: $test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "FAIL: $test_name"
    fi
}

# Test 1: Check Frontend Components Exist
echo "Test 1: Frontend Components Exist"
echo ""

FRONTEND_FILES=(
    "/home/z/my-project/src/app/api/cognitive/dashboard-data/route.ts"
    "/home/z/my-project/src/components/cognitive-dashboard-widget.tsx"
    "/home/z/my-project/src/app/cognitive/page.tsx"
    "/home/z/my-project/src/components/cognitive-quick-access.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_result "Frontend component: $(basename $file)" "PASS"
    else
        print_result "Frontend component: $(basename $file)" "FAIL"
    fi
done

echo ""
echo "Frontend Components: $PASSED_TESTS/$TOTAL_TESTS passed"
echo ""

# Test 2: Check Backend Components Exist
echo "Test 2: Backend Components Exist"
echo ""

BACKEND_FILES=(
    "/home/z/my-project/memory_system.ts"
    "/home/z/my-project/self_improving_system.ts"
    "/home/z/my-project/deep_content_analyzer.ts"
    "/home/z/my-project/cognitive_api_integration.ts"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_result "Backend component: $(basename $file)" "PASS"
    else
        print_result "Backend component: $(basename $file)" "FAIL"
    fi
done

echo ""
echo "Backend Components: $PASSED_TESTS/$TOTAL_TESTS passed"
echo ""

# Test 3: Check API Route Exists
echo "Test 3: Dashboard API Route Exists"
echo ""

API_ROUTE="/home/z/my-project/src/app/api/cognitive/dashboard-data/route.ts"
if [ -f "$API_ROUTE" ]; then
    print_result "Dashboard API route" "PASS"
else
    print_result "Dashboard API route" "FAIL"
fi

echo ""

# Print Summary
echo "Test Summary"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo ""
echo "Success Rate: $(echo "scale=2; $PASSED_TESTS / $TOTAL_TESTS * 100" | bc)%"

echo ""
if [ "$FAILED_TESTS" -gt 0 ]; then
    echo "WARNING: Some tests failed. Please review above."
    exit 1
else
    echo "All tests passed! Integration is ready."
    exit 0
fi
