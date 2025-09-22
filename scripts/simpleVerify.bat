@echo off
echo 🚀 Simple Email Verification for DiamondManager Team
echo ==================================================

echo.
echo The backend doesn't have direct email verification endpoints.
echo Let's test if users can login despite email verification:

echo.
echo 🧪 Testing Mikko login (mkankkun@gmail.com)...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing Pete login (pete@kurkipotku.com)...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing Janne login (serveri.suhonen@gmail.com)...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"serveri.suhonen@gmail.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 🧪 Testing Juhani login (juhani@diamondmakers.com)...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"juhani@diamondmakers.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo 💡 SOLUTIONS:
echo 1. If you see successful login tokens above, users can already login!
echo 2. Find the MongoDB collection 'users_diamondmanager' in 'mynewapp' or 'new_app' database
echo 3. Update emailVerified field to true for these 4 users
echo.
echo 🌐 DiamondManager: https://diamondmanager-production.up.railway.app
echo.
pause