#!/bin/bash

echo "=========================================================="
echo "Running Backend Tests (Pytest) in Docker..."
echo "=========================================================="
docker exec -e PYTHONPATH=. laboratorio-backend-1 pytest
backendExitCode=$?

echo ""
echo "=========================================================="
echo "Running Frontend Tests (Jest) in Docker..."
echo "=========================================================="
docker exec laboratorio-frontend-1 npm run test
frontendExitCode=$?

echo ""
echo "=========================================================="
if [ $backendExitCode -eq 0 ] && [ $frontendExitCode -eq 0 ]; then
    echo "All tests completed successfully! (Pytest: PASS, Jest: PASS)"
    exit 0
else
    echo "Test failures detected! (Pytest Exit Code: $backendExitCode, Jest Exit Code: $frontendExitCode)"
    exit 1
fi
