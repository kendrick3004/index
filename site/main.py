from flask import Flask, render_template, request, send_file, redirect, url_for, send_from_directory
import sys
import datetime
import os
import time
from collections import defaultdict

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

# Configurações de Rate Limiting (30 requisições por 10 segundos)
RATE_LIMIT_COUNT = 30
RATE_LIMIT_PERIOD = 10
request_counts = defaultdict(lambda: {'count': 0, 'timestamp': 0})

visitas_total = 0
visitas_hoje = 0
data_atual = datetime.date.today()

# Caminho para a pasta de logs na raiz do projeto (index/logs)
# Como este arquivo está em index/site/main.py, subimos um nível para chegar em index/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOG_BASE_DIR = os.path.join(BASE_DIR, 'logs')
MAINTENANCE_DIR = os.path.join(BASE_DIR, 'maintenance')

def get_log_file():
    """Garante a criação da pasta do dia e retorna o caminho do arquivo de log."""
    hoje_str = datetime.date.today().strftime('%Y-%m-%d')
    dia_dir = os.path.join(LOG_BASE_DIR, hoje_str)
    if not os.path.exists(dia_dir):
        os.makedirs(dia_dir, exist_ok=True)
    return os.path.join(dia_dir, 'site_access.log')

def registrar_log(mensagem):
    """Salva a mensagem no arquivo de log do dia."""
    try:
        with open(get_log_file(), 'a', encoding='utf-8') as f:
            timestamp = datetime.datetime.now().strftime('%H:%M:%S')
            f.write(f"[{timestamp}] {mensagem}\n")
    except Exception as e:
        print(f"Erro ao salvar log: {e}")

def atualizar_linha():
    log_msg = f"📊 Visitas Total: {visitas_total} | Hoje: {visitas_hoje}"
    sys.stdout.write(f"\r{log_msg}")
    sys.stdout.flush()
    registrar_log(log_msg)

@app.before_request
def security_and_tracking():
    global visitas_total, visitas_hoje, data_atual
    
    # 1. Lógica de Favicon
    if request.path.endswith(('favicon.ico', 'favicon.png')):
        fav_path = os.path.join(os.path.dirname(__file__), 'assets/dev/favicon/Favicon.ico')
        if os.path.exists(fav_path):
            return send_file(fav_path)
        return '', 204

    # 2. Ignora arquivos estáticos (NÃO registra no log, exceto para debug temporário)
    extensoes_estaticas = ('.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.otf')
    if (request.path.startswith(('/assets', '/css', '/js', '/img', '/src')) or request.path.endswith(extensoes_estaticas)) and not request.path.startswith('/maintenance'):
        return

    # 3. Proteção contra ataques
    client_ip = request.remote_addr
    current_time = time.time()
    if current_time - request_counts[client_ip]['timestamp'] > RATE_LIMIT_PERIOD:
        request_counts[client_ip] = {'count': 1, 'timestamp': current_time}
    else:
        request_counts[client_ip]['count'] += 1

    if request_counts[client_ip]['count'] > RATE_LIMIT_COUNT:
        registrar_log(f"⚠️ BLOQUEIO: IP {client_ip} excedeu o limite.")
        return send_error_file(os.path.join(MAINTENANCE_DIR, '429.html'), 429)

    # 4. Contagem de visitas (apenas para páginas reais, não arquivos estáticos)
    hoje = datetime.date.today()
    if hoje != data_atual:
        visitas_hoje = 0
        data_atual = hoje
    
    visitas_total += 1
    visitas_hoje += 1
    registrar_log(f"👤 Acesso: {client_ip} -> {request.path}")
    atualizar_linha()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calendar')
def calendar():
    return render_template('pages/calendar.html')

@app.route('/pages/calendar')
def calendar_old():
    return redirect(url_for('calendar'))

@app.route('/login')
def login():
    return render_template('pages/login.html')

@app.route('/database')
def database():
    # Login obrigatório para acessar o database
    # O app.js do database verifica a autenticação Firebase
    # Se não estiver logado, redireciona para o login
    return render_template('database/index.html')

@app.route('/database/<path:filename>')
def serve_database_files(filename):
    """Serve arquivos da pasta database na raiz do projeto e também arquivos estáticos do site/database"""
    registrar_log(f"📂 Tentando servir arquivo do database: {filename}")
    
    # 1. Se for o arquivo philistudies.json, serve obrigatoriamente da pasta database na raiz
    if filename == 'philistudies.json':
        database_dir = os.path.join(BASE_DIR, 'database')
        registrar_log(f"✅ Servindo philistudies.json de: {database_dir}")
        return send_from_directory(database_dir, filename)

    # 2. Tenta servir da pasta 'site/database' (onde estão index.html, styles.css, app.js)
    site_database_dir = os.path.join(os.path.dirname(__file__), 'database')
    target_path = os.path.join(site_database_dir, filename)
    if os.path.exists(target_path):
        registrar_log(f"✅ Servindo arquivo estático de: {site_database_dir}")
        return send_from_directory(site_database_dir, filename)
    
    # 3. Se não encontrar, serve da pasta 'database' na raiz do projeto (files, etc)
    database_dir = os.path.join(BASE_DIR, 'database')
    registrar_log(f"🔍 Buscando na pasta database raiz: {database_dir}")
    return send_from_directory(database_dir, filename)

@app.route('/maintenance/<path:filename>')
def serve_maintenance_files(filename):
    """Serve arquivos da pasta maintenance na raiz do projeto"""
    registrar_log(f"🛠️ Servindo arquivo de manutenção: {filename}")
    return send_from_directory(MAINTENANCE_DIR, filename)

# Removido redirecionamento antigo para evitar conflito com arquivos estáticos na nova pasta database

# 🔥 Mapeamento de Erros para a pasta maintenance
def send_error_file(path, code):
    """Envia arquivo de erro com caminho corrigido"""
    try:
        return send_file(path), code
    except:
        return f"Erro {code}", code

@app.errorhandler(400)
def error_400(e): 
    registrar_log(f"❌ 400: Requisição inválida (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '400.html'), 400)

@app.errorhandler(401)
def error_401(e): 
    registrar_log(f"❌ 401: Não autorizado (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '401.html'), 401)

@app.errorhandler(403)
def error_403(e): 
    registrar_log(f"❌ 403: Acesso proibido (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '403.html'), 403)

@app.errorhandler(404)
def error_404(e): 
    registrar_log(f"❓ 404: {request.path} (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '404.html'), 404)

@app.errorhandler(405)
def error_405(e): 
    registrar_log(f"❌ 405: Método não permitido (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '405.html'), 405)

@app.errorhandler(429)
def error_429(e): 
    registrar_log(f"⚠️ 429: Muitas requisições (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '429.html'), 429)

@app.errorhandler(500)
@app.errorhandler(Exception)
def error_500(e): 
    registrar_log(f"❌ 500: {str(e)}")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '500.html'), 500)

@app.errorhandler(502)
def error_502(e): 
    registrar_log(f"❌ 502: Bad Gateway (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '502.html'), 502)

@app.errorhandler(503)
def error_503(e): 
    registrar_log(f"❌ 503: Serviço indisponível (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '503.html'), 503)

@app.errorhandler(504)
def error_504(e): 
    registrar_log(f"❌ 504: Gateway Timeout (IP: {request.remote_addr})")
    return send_error_file(os.path.join(MAINTENANCE_DIR, '504.html'), 504)

if __name__ == '__main__':
    print("\n🚀 Servidor ONLINE na porta 5000")
    registrar_log("--- Servidor Iniciado ---")
    atualizar_linha()
    app.run(host="0.0.0.0", port=5000, debug=False)
