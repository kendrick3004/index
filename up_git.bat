@echo off
echo ================================
echo 🔧 Corrigindo problema do Git...
echo ================================

cd /d %~dp0

echo.
echo 📌 Removendo cache do Git...
git rm -r --cached . >nul 2>&1

echo.
echo 📌 Adicionando tudo novamente...
git add .

echo.
echo 📌 Criando commit...
git commit -m "Fix automatico: reindexa tudo e corrige maintenance"

echo.
echo 📌 Enviando para o GitHub...
git push

echo.
echo ✅ FINALIZADO!
pause