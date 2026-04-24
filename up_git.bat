@echo off
cd /d %~dp0

echo ============================
echo Atualizando repositorio...
echo ============================

git add -A

git diff --cached --quiet
IF %ERRORLEVEL%==0 (
    echo Nada para commitar.
) ELSE (
    git commit -m "Auto update"
    git push
)

echo ============================
echo FINALIZADO
echo ============================
pause