from flask import Flask, send_from_directory, request, send_file
import os
import time
import datetime
from collections import defaultdict

# Garantir caminhos absolutos para o diretório do script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=SCRIPT_DIR, static_url_path='')

# Configurações de Rate Limiting
RATE_LIMIT_COUNT = 10
RATE_LIMIT_PERIOD = 10
request_counts = defaultdict(lambda: {'count': 0, 'timestamp': 0})

# Caminho para a pasta de logs na raiz do projeto (index/logs)
# Como este arquivo está em index/maintenance/main.py, subimos um nível para chegar em index/
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))
LOG_BASE_DIR = os.path.join(PROJECT_DIR, 'logs')

def registrar_log(mensagem):
    """Salva a mensagem no arquivo de log do dia na pasta de manutenção."""
    try:
        hoje_str = datetime.date.today().strftime('%Y-%m-%d')
        dia_dir = os.path.join(LOG_BASE_DIR, hoje_str)
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
        favicon_path = os.path.join(SCRIPT_DIR, 'favicon.png')
        if os.path.exists(favicon_path):
            return send_file(favicon_path)
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
        return send_from_directory(SCRIPT_DIR, '429.html'), 429
    
    registrar_log(f"🚧 Acesso em Manutenção: {client_ip} -> {request.path}")

@app.route('/')
def index():
    return send_from_directory(SCRIPT_DIR, '503.html')

# Mantém as rotas de API ativas (simulando ou redirecionando)
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
    # Aqui você pode implementar um proxy reverso real para o seu backend de API 
    # se ele estiver rodando em outra porta, ou importar as rotas de API do site.
    # Por padrão, retornamos um JSON informando que a API está ativa.
    return {"status": "success", "message": "API está funcionando normalmente durante a manutenção", "path": path}, 200

@app.route('/<path:path>')
def static_files(path):
    file_path = os.path.join(SCRIPT_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(SCRIPT_DIR, path)
    return send_from_directory(SCRIPT_DIR, '503.html')

@app.errorhandler(404)
@app.errorhandler(500)
def handle_maintenance_errors(e):
    return send_from_directory(SCRIPT_DIR, '503.html')

if __name__ == '__main__':
    print("🚧 Modo Manutenção ATIVO na porta 5000")
    registrar_log("--- Modo Manutenção Iniciado ---")
    app.run(host="0.0.0.0", port=5000, debug=False)
