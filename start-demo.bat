@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo 本地演示服务启动后，在浏览器打开：
echo   http://localhost:5500/home.html
echo   http://localhost:5500/learn.html
echo.
echo 按 Ctrl+C 可停止服务；不要关闭本窗口。
echo.
npx --yes serve -l 5500
pause
