@echo off
cd /d %~dp0

echo ============================================
echo Atualizacao de arquivos em andamento...
echo ============================================

git add -A

git diff --cached --quiet
IF %ERRORLEVEL%==0 (
    echo Tudo atualizado e na ultima versão.
) ELSE (
    git commit -m "Auto update"
    git push
)

echo ============================================
echo FINALIZADO - Atualizacao de arquivos concluida.
echo ============================================
pause