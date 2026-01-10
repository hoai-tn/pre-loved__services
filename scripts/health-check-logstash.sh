#!/bin/bash
# Health check script for Logstash

echo "🏥 Checking Logstash health..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Check if container is running
echo "1️⃣  Checking container status..."
if docker ps --filter "name=logstash" --format "{{.Names}}" | grep -q "^logstash$"; then
    print_status 0 "Container is running"
    CONTAINER_STATUS=$(docker inspect -f '{{.State.Status}}' logstash 2>/dev/null)
    echo "   Status: $CONTAINER_STATUS"
else
    print_status 1 "Container is not running"
    exit 1
fi

echo ""

# 2. Check pipeline configuration file exists
echo "2️⃣  Checking pipeline configuration..."
if docker exec logstash test -f /usr/share/logstash/pipeline/logstash.conf 2>/dev/null; then
    print_status 0 "Pipeline configuration file exists"
    echo "   File: /usr/share/logstash/pipeline/logstash.conf"
else
    print_status 1 "Pipeline configuration file not found"
fi

echo ""

# 3. Check JDBC driver exists
echo "3️⃣  Checking JDBC driver..."
if docker exec logstash test -f /usr/share/logstash/drivers/mysql-connector-java-8.0.28.jar 2>/dev/null; then
    print_status 0 "MySQL JDBC driver exists"
    DRIVER_SIZE=$(docker exec logstash ls -lh /usr/share/logstash/drivers/mysql-connector-java-8.0.28.jar 2>/dev/null | awk '{print $5}')
    echo "   Driver size: $DRIVER_SIZE"
else
    print_status 1 "MySQL JDBC driver not found"
fi

echo ""

# 4. Check connection to Elasticsearch
echo "4️⃣  Checking Elasticsearch connection..."
ES_RESPONSE=$(docker exec logstash curl -s -o /dev/null -w "%{http_code}" http://elasticsearch:9200/_cluster/health 2>/dev/null)
if [ "$ES_RESPONSE" = "200" ]; then
    print_status 0 "Can connect to Elasticsearch"
    ES_HEALTH=$(docker exec logstash curl -s http://elasticsearch:9200/_cluster/health 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "   Elasticsearch status: $ES_HEALTH"
else
    print_status 1 "Cannot connect to Elasticsearch (HTTP $ES_RESPONSE)"
fi

echo ""

# 5. Check recent logs for errors
echo "5️⃣  Checking recent logs for errors..."
ERROR_COUNT=$(docker logs logstash --tail 100 2>&1 | grep -i "error" | grep -v "deprecation" | wc -l | tr -d ' ')
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $ERROR_COUNT error(s) in recent logs${NC}"
    echo "   Recent errors:"
    docker logs logstash --tail 50 2>&1 | grep -i "error" | grep -v "deprecation" | tail -3 | sed 's/^/   - /'
else
    print_status 0 "No errors in recent logs"
fi

echo ""

# 6. Check if pipeline is loaded (check for configuration errors)
echo "6️⃣  Checking pipeline configuration validity..."
PIPELINE_ERROR=$(docker logs logstash --tail 200 2>&1 | grep -i "ConfigurationError\|Unable to configure plugins" | tail -1)
if [ -z "$PIPELINE_ERROR" ]; then
    print_status 0 "No pipeline configuration errors detected"
else
    print_status 1 "Pipeline configuration error detected"
    echo "   Error: $PIPELINE_ERROR"
fi

echo ""

# 7. Check Logstash API endpoint (if available)
echo "7️⃣  Checking Logstash API..."
API_RESPONSE=$(docker exec logstash curl -s -o /dev/null -w "%{http_code}" http://localhost:9600/_node/stats 2>/dev/null)
if [ "$API_RESPONSE" = "200" ]; then
    print_status 0 "Logstash API is responding"
    PIPELINE_COUNT=$(docker exec logstash curl -s http://localhost:9600/_node/stats/pipelines 2>/dev/null | grep -o '"pipelines":{[^}]*}' | grep -o '{[^}]*}' | wc -l | tr -d ' ')
    echo "   Active pipelines: $PIPELINE_COUNT"
else
    echo -e "${YELLOW}⚠️  Logstash API not responding (this may be normal)${NC}"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary:"
echo "   Container: $(docker ps --filter 'name=logstash' --format '{{.Status}}')"
echo "   Port: $(docker port logstash 2>/dev/null | grep 5044 || echo 'N/A')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
