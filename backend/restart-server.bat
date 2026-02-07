@echo off
echo Stopping any running Node processes on port 5000...
netstat -ano | findstr :5000
echo.
echo Starting backend server...
cd /d %~dp0
npm start

