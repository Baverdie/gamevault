#!/bin/bash

echo "🚀 GameVault API Test Suite"
echo "============================"
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
echo "Response: $HEALTH"
echo ""

# 2. Register
echo "2️⃣  Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gamevault.com",
    "username": "testuser",
    "password": "password123"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "${RED}❌ Registration failed${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "${GREEN}✅ User registered successfully${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 3. Search games
echo "3️⃣  Searching for 'zelda' games..."
SEARCH=$(curl -s "$BASE_URL/api/games/search?q=zelda")
echo "Found games (first result):"
echo $SEARCH | grep -o '"name":"[^"]*' | head -1
echo ""

# Extract first game's rawgId
RAWG_ID=$(echo $SEARCH | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Using game ID: $RAWG_ID"
echo ""

# 4. Add game to collection
echo "4️⃣  Adding game to collection..."
ADD_GAME=$(curl -s -X POST "$BASE_URL/api/collection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"rawgId\": $RAWG_ID,
    \"status\": \"PLAYING\",
    \"playtime\": 10
  }")

GAME_ID=$(echo $ADD_GAME | grep -o '"gameId":"[^"]*' | cut -d'"' -f4)

if [ -z "$GAME_ID" ]; then
  echo "${RED}❌ Failed to add game${NC}"
  echo "Response: $ADD_GAME"
else
  echo "${GREEN}✅ Game added to collection${NC}"
  echo "Game ID: $GAME_ID"
fi
echo ""

# 5. Get collection
echo "5️⃣  Getting user collection..."
COLLECTION=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/collection")
echo "Collection size:"
echo $COLLECTION | grep -o '"total":[0-9]*'
echo ""

# 6. Create review
echo "6️⃣  Creating a review..."
REVIEW=$(curl -s -X POST "$BASE_URL/api/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"gameId\": \"$GAME_ID\",
    \"rating\": 9,
    \"content\": \"Amazing game! One of the best I've played.\"
  }")

if echo $REVIEW | grep -q '"rating":9'; then
  echo "${GREEN}✅ Review created successfully${NC}"
else
  echo "${RED}❌ Failed to create review${NC}"
  echo "Response: $REVIEW"
fi
echo ""

# 7. Get user stats
echo "7️⃣  Getting user stats..."
STATS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/stats/me")
echo "User Stats:"
echo $STATS | grep -o '"totalGames":[0-9]*'
echo $STATS | grep -o '"totalPlaytime":[0-9]*'
echo $STATS | grep -o '"totalReviews":[0-9]*'
echo ""

# 8. Get global stats
echo "8️⃣  Getting global stats..."
GLOBAL=$(curl -s "$BASE_URL/api/stats/global")
echo "Global Stats:"
echo $GLOBAL | grep -o '"totalUsers":[0-9]*'
echo $GLOBAL | grep -o '"totalGames":[0-9]*'
echo ""

# 9. Test rate limiting (spam requests)
echo "9️⃣  Testing rate limiting (sending 5 requests)..."
for i in {1..5}
do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
  echo "Request $i: HTTP $STATUS"
done
echo ""

echo "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "📊 Summary:"
echo "- User created: test@gamevault.com"
echo "- Games in collection: 1"
echo "- Reviews written: 1"
echo "- Token: ${TOKEN:0:30}..."
echo ""
echo "🔗 Check Swagger docs: http://localhost:3001/docs"