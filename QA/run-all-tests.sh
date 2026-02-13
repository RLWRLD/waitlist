#!/bin/bash
# ============================================
# RLDX Waitlist QA — Run All Tests
# ============================================
# Usage: bash QA/run-all-tests.sh [--headed] [--filter PATTERN]
#
# Options:
#   --headed     Run tests in headed browser mode
#   --filter     Only run tests matching PATTERN
#
# Output:
#   QA/logs/test-results.json    — JSON test results
#   QA/logs/html-report/         — HTML report
#   QA/logs/run-TIMESTAMP.log    — Console output log
# ============================================

set -euo pipefail

# Resolve paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TESTS_DIR="$SCRIPT_DIR/tests"
LOGS_DIR="$SCRIPT_DIR/logs"

# Parse arguments
HEADED=""
FILTER=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --headed) HEADED="--headed"; shift ;;
        --filter) FILTER="--grep $2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Create logs directory
mkdir -p "$LOGS_DIR"

# Timestamp for log file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOGS_DIR/run-${TIMESTAMP}.log"

echo "============================================"
echo "RLDX Waitlist QA — Test Runner"
echo "============================================"
echo "Time:      $(date)"
echo "Log file:  $LOG_FILE"
echo "Tests dir: $TESTS_DIR"
echo "============================================"

# Function to log and print
log() {
    echo "$@" | tee -a "$LOG_FILE"
}

log ""
log "Starting test run at $(date)"
log ""

# Check if dependencies are installed
if [ ! -d "$TESTS_DIR/node_modules" ]; then
    log "Installing dependencies..."
    cd "$TESTS_DIR" && npm install 2>&1 | tee -a "$LOG_FILE"
fi

# Check if Playwright browsers are installed
if ! npx playwright install --dry-run chromium >/dev/null 2>&1; then
    log "Installing Playwright browsers..."
    npx playwright install chromium 2>&1 | tee -a "$LOG_FILE"
fi

# Run tests
log ""
log "============================================"
log "Running all test suites..."
log "============================================"
log ""

cd "$TESTS_DIR"

# Run with Playwright Test
set +e  # Don't exit on test failure
npx playwright test \
    --config=playwright.config.js \
    $HEADED \
    $FILTER \
    2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}
set -e

log ""
log "============================================"
log "Test Run Complete"
log "============================================"
log "Exit code: $EXIT_CODE"
log "Finished:  $(date)"
log ""

# Summary
if [ -f "$LOGS_DIR/test-results.json" ]; then
    log "Results:"
    # Extract summary from JSON results
    TOTAL=$(python3 -c "
import json
with open('$LOGS_DIR/test-results.json') as f:
    data = json.load(f)
suites = data.get('suites', [])
passed = 0
failed = 0
skipped = 0
def count_specs(suite):
    global passed, failed, skipped
    for spec in suite.get('specs', []):
        for test in spec.get('tests', []):
            status = test.get('status', '')
            if status == 'expected':
                passed += 1
            elif status == 'unexpected':
                failed += 1
            elif status == 'skipped':
                skipped += 1
    for child in suite.get('suites', []):
        count_specs(child)
for s in suites:
    count_specs(s)
print(f'  Passed:  {passed}')
print(f'  Failed:  {failed}')
print(f'  Skipped: {skipped}')
print(f'  Total:   {passed + failed + skipped}')
" 2>/dev/null || echo "  (Could not parse results JSON)")
    log "$TOTAL"
fi

log ""
log "Logs:     $LOG_FILE"
log "JSON:     $LOGS_DIR/test-results.json"
log "HTML:     $LOGS_DIR/html-report/index.html"
log ""

# List failed tests if any
if [ $EXIT_CODE -ne 0 ] && [ -f "$LOGS_DIR/test-results.json" ]; then
    log "============================================"
    log "FAILED TESTS:"
    log "============================================"
    python3 -c "
import json
with open('$LOGS_DIR/test-results.json') as f:
    data = json.load(f)
def find_failures(suite, path=''):
    current = path + ' > ' + suite.get('title', '') if path else suite.get('title', '')
    for spec in suite.get('specs', []):
        for test in spec.get('tests', []):
            if test.get('status') == 'unexpected':
                title = spec.get('title', 'unknown')
                results = test.get('results', [{}])
                error = ''
                if results:
                    error = results[0].get('error', {}).get('message', '')[:200]
                print(f'  FAIL: {current} > {title}')
                if error:
                    print(f'        {error}')
    for child in suite.get('suites', []):
        find_failures(child, current)
for s in data.get('suites', []):
    find_failures(s)
" 2>/dev/null | tee -a "$LOG_FILE"
    log ""
fi

exit $EXIT_CODE
