@echo off
echo Executing initialization sequence...

echo Running Gura...
call test\add-gura.bat
timeout /t 2

echo Running Alpha...
call test\add-alpha.bat
timeout /t 2

echo Running Beta...
call test\add-beta.bat
timeout /t 2

echo Running Script...
call test\run-script.bat

echo Initialization complete!
pause 