#!/usr/bin/env python3
"""
Script para corrigir todas as páginas de erro adicionando links de fontes do Google
"""

import os
import re

# Diretório de manutenção
MAINTENANCE_DIR = os.path.dirname(os.path.abspath(__file__)) + "/maintenance"

# Link das fontes do Google
FONTS_LINK = '''    <!-- Fontes do Google -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;700&family=Righteous&family=Montserrat:wght@400;700&family=Dancing+Script&family=Lora&display=swap" rel="stylesheet">
    '''

# Padrão para encontrar o local onde inserir o link
pattern = r'(<link rel="icon"[^>]*>)\n    \n    \n    \n    (<link rel="stylesheet" href="/maintenance/error-pages\.css">)'

def fix_error_page(filepath):
    """Corrige uma página de erro adicionando os links de fontes"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Se já tem o link de fontes, pula
    if 'fonts.googleapis.com' in content:
        print(f"✓ {os.path.basename(filepath)} já tem os links de fontes")
        return
    
    # Substitui o padrão
    new_content = re.sub(
        pattern,
        r'\1\n' + FONTS_LINK + r'\2',
        content
    )
    
    # Se não encontrou o padrão, tenta um padrão alternativo
    if new_content == content:
        # Tenta encontrar apenas o link do favicon e inserir após ele
        pattern2 = r'(<link rel="icon"[^>]*>)\n    <link rel="stylesheet"'
        new_content = re.sub(
            pattern2,
            r'\1\n' + FONTS_LINK + '    <link rel="stylesheet"',
            content
        )
    
    # Se ainda não funcionou, tenta outro padrão
    if new_content == content:
        # Tenta encontrar o favicon e inserir após ele com espaço em branco
        pattern3 = r'(<link rel="icon"[^>]*>)\n\n    <link rel="stylesheet"'
        new_content = re.sub(
            pattern3,
            r'\1\n' + FONTS_LINK + '    <link rel="stylesheet"',
            content
        )
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ {os.path.basename(filepath)} corrigido com sucesso")
    else:
        print(f"⚠ {os.path.basename(filepath)} - padrão não encontrado")

# Processa todas as páginas de erro
if os.path.exists(MAINTENANCE_DIR):
    for filename in os.listdir(MAINTENANCE_DIR):
        if filename.endswith('.html') and filename[0].isdigit():
            filepath = os.path.join(MAINTENANCE_DIR, filename)
            fix_error_page(filepath)
    print("\n✅ Todas as páginas de erro foram processadas!")
else:
    print(f"❌ Diretório {MAINTENANCE_DIR} não encontrado")
