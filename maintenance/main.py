from flask import Flask, send_from_directory, request, send_file
import os
import time
import datetime
from collections import defaultdict

app = Flask(__name__, static_folder='.', static_url_path='')

# Configurações de Rate Limiting
RATE_LIMIT_COUNT = 10
RATE_LIMIT_PERIOD = 10
request_counts = defaultdict(lambda: {'count': 0, 'timestamp': 0})

# Caminho para a pasta de logs na raiz do projeto (index/logs)
# Como este arquivo está em index/maintenance/main.py, subimos um nível para chegar em index/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LOG_BASE_DIR = os.path.join(BASE_DIR, 'logs')

def registrar_log(mensagem):
    """Salva a mensagem no arquivo de log do dia na pasta de manutenção."""
    try:
        hoje_str = datetime.date.today().strftime('%Y-%m-%d')
        dia_dir = os.path.join(LOG_BASE_DIR, hoje_str)
        if not os.path.exists(dia_dir):
            os.makedirs(dia_dir, exist_ok=True)
        
        log_file = os.path.join(dia_dir, 'maintenance.log')
        with open(log_file, 'a', encoding='utf-8') as f:
            timestamp = datetime.datetime.now().strftime('%H:%M:%S')
            f.write(f"[{timestamp}] {mensagem}\n")
    except Exception as e:
        print(f"Erro ao salvar log de manutenção: {e}")

@app.before_request
def maintenance_logic():
    # Lógica de Favicon
    if request.path.endswith(('favicon.ico', 'favicon.png')):
        if os.path.exists('favicon.png'):
            return send_file('favicon.png')
        return '', 204

    # Ignora arquivos estáticos
    if request.path.endswith(('.css', '.js', '.png', '.jpg')):
        return

    # Proteção contra ataques
    client_ip = request.remote_addr
    current_time = time.time()
    if current_time - request_counts[client_ip]['timestamp'] > RATE_LIMIT_PERIOD:
        request_counts[client_ip] = {'count': 1, 'timestamp': current_time}
    else:
        request_counts[client_ip]['count'] += 1

    if request_counts[client_ip]['count'] > RATE_LIMIT_COUNT:
        registrar_log(f"⚠️ BLOQUEIO (Manutenção): IP {client_ip}")
        return send_file('429.html'), 429
    
    registrar_log(f"🚧 Acesso em Manutenção: {client_ip} -> {request.path}")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.errorhandler(404)
@app.errorhandler(500)
def handle_maintenance_errors(e):
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    print("🚧 Modo Manutenção ATIVO na porta 5000")
    registrar_log("--- Modo Manutenção Iniciado ---")
    app.run(host="0.0.0.0", port=5000, debug=False)
