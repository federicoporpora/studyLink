#!/bin/bash
# Register a user
echo "Registering user..."
REGISTER_RES=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","cognome":"Test","email":"test@studenti.unina.it","password":"Password123!"}')

echo "Register Response: $REGISTER_RES"

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@studenti.unina.it","password":"Password123!"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
echo "Token: $TOKEN"

# Create Event
echo "Creating event..."
FUTURE_DATE=$(date -d "+1 day" +%Y-%m-%d)
CREATE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titolo": "Test Event",
    "materia": "Math",
    "data": "'$FUTURE_DATE'",
    "orario": "14:30:00",
    "indirizzoVia": "Via Roma",
    "indirizzoNomeLuogo": "Library",
    "tipoDiLuogo": 0,
    "numeroPosti": 10
  }')

echo "Create Event Response: $CREATE_RES"
