@echo off
cd /d %~dp0

echo ============================================
echo RESET DE CACHE - REENVIANDO TUDO...
echo ============================================

:: Verifica se existe repo
if not exist ".git" (
    echo ERRO: Pasta nao e um repositorio Git.
    pause
    exit /b
)

:: Adiciona tudo novamente
git add -A

:: Commit forçado
git commit -m "Rebuild completo dos arquivos"

:: Envia pro GitHub
git push

echo ============================================
echo FINALIZADO - CACHE LIMPO E ARQUIVOS REENVIADOS
echo ============================================
pause