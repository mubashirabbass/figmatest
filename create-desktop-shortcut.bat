@echo off
title Create Desktop Shortcut for Shah Je Pizza POS
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║         Creating Desktop Shortcut for POS System...          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Create VBS script to make shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Shah Je Pizza POS.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "E:\project\start-complete-system.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "E:\project" >> CreateShortcut.vbs
echo oLink.Description = "Start Shah Je Pizza POS System" >> CreateShortcut.vbs
echo oLink.IconLocation = "%%SystemRoot%%\System32\shell32.dll,137" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Run the VBS script
cscript CreateShortcut.vbs //nologo

REM Delete the VBS script
del CreateShortcut.vbs

echo.
echo ✅ SUCCESS!
echo.
echo A shortcut has been created on your Desktop:
echo    📌 "Shah Je Pizza POS"
echo.
echo From now on, just double-click that shortcut to start the system!
echo.
echo The shortcut will:
echo   1. Start the backend server (D drive database)
echo   2. Start the frontend (web interface)
echo   3. Open your browser automatically
echo.
echo 💡 TIP: You can also copy this shortcut to your Startup folder
echo          so the system starts automatically when Windows starts!
echo.
pause
