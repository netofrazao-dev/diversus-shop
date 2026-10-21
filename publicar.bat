@echo off
cd /d "%~dp0"
echo Publicando alteracoes da DIVERSUS SHOP...
git add .
git commit -m "desconto na loja toda + frete gratis a partir de R$15 + keep-alive do Supabase"
git push
echo.
echo Pronto! A Vercel atualiza o site em ~1 minuto.
pause
