@echo off
echo 🚀 Bypassing Email Verification via Backend API
echo ==============================================

echo.
echo Method 1: Direct admin update (if endpoint exists)
echo.

echo 📧 Updating Mikko...
curl.exe -X PATCH "https://newapp-backend-production.up.railway.app/api/v1/admin/users/verify" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -H "x-admin-token: diamond-makers-bypass-2025" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"emailVerified\":true}"

echo.
echo 📧 Updating Pete...
curl.exe -X PATCH "https://newapp-backend-production.up.railway.app/api/v1/admin/users/verify" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -H "x-admin-token: diamond-makers-bypass-2025" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"emailVerified\":true}"

echo.
echo 📧 Updating Janne...  
curl.exe -X PATCH "https://newapp-backend-production.up.railway.app/api/v1/admin/users/verify" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -H "x-admin-token: diamond-makers-bypass-2025" ^
  -d "{\"email\":\"serveri.suhonen@gmail.com\",\"emailVerified\":true}"

echo.
echo 📧 Updating Juhani...
curl.exe -X PATCH "https://newapp-backend-production.up.railway.app/api/v1/admin/users/verify" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -H "x-admin-token: diamond-makers-bypass-2025" ^
  -d "{\"email\":\"juhani@diamondmakers.com\",\"emailVerified\":true}"

echo.
echo.
echo Method 2: Using user service direct update
echo.

echo 📧 Direct user update for Mikko...
curl.exe -X PUT "https://user-service-production-840d.up.railway.app/api/v1/users/update-verification" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"verified\":true}"

echo.
echo 📧 Direct user update for Pete...
curl.exe -X PUT "https://user-service-production-840d.up.railway.app/api/v1/users/update-verification" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"verified\":true}"

echo.
echo 📧 Direct user update for Janne...
curl.exe -X PUT "https://user-service-production-840d.up.railway.app/api/v1/users/update-verification" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"serveri.suhonen@gmail.com\",\"verified\":true}"

echo.
echo 📧 Direct user update for Juhani...
curl.exe -X PUT "https://user-service-production-840d.up.railway.app/api/v1/users/update-verification" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"juhani@diamondmakers.com\",\"verified\":true}"

echo.
echo.
echo 🧪 Testing logins after update...
echo.

echo Testing Mikko login...
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"mkankkun@gmail.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo Testing Pete login...  
curl.exe -X POST "https://newapp-backend-production.up.railway.app/api/v1/auth/login" ^
  -H "Content-Type: application/json" ^
  -H "x-app-id: diamondmanager" ^
  -d "{\"email\":\"pete@kurkipotku.com\",\"password\":\"nakkivene123\"}"

echo.
echo.
echo ✅ Email verification bypass attempts complete!
echo If successful, team can login at: https://diamondmanager-production.up.railway.app
echo.
pause