@echo off
echo 🚀 Verifying Diamond Makers Team Emails via curl.exe
echo =========================================

echo.
echo 📧 Attempting to verify Mikko: mkankkun@gmail.com
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/verify-email" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"force\":true}"

echo.
echo.
echo 📧 Attempting to verify Pete: pete@kurkipotku.com  
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/verify-email" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"force\":true}"

echo.
echo.
echo 📧 Attempting to verify Janne: serveri.suhonen@gmail.com
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/verify-email" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"serveri.suhonen@gmail.com\",\"force\":true}"

echo.
echo.
echo 📧 Attempting to verify Juhani: juhani@diamondmakers.com
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/verify-email" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"juhani@diamondmakers.com\",\"force\":true}"

echo.
echo.
echo 🧪 Testing login for Mikko...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing login for Pete...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing login for Janne...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"serveri.suhonen@gmail.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing login for Juhani...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"juhani@diamondmakers.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo ✅ Email verification attempts complete!
echo 🌐 DiamondManager URL: https://diamondmanager-production.up.railway.app
echo.
pause