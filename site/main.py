from flask import Flask, send_file, request, jsonify
import sys
import datetime
import os
import time
import subprocess
from collections import defaultdict

# Importar o registrador de rotas
from routes import register_routes

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload

# Configurações de Rate Limiting
RATE_LIMIT_COUNT = 30
RATE_LIMIT_PERIOD = 10
request_counts = defaultdict(lambda: {'count': 0, 'timestamp': 0})

visitas_total = 0
visitas_hoje = 0
data_atual = datetime.date.today()

# Caminhos
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_BASE_DIR = os.path.join(BASE_DIR, 'logs')
MAINTENANCE_DIR = os.path.join(BASE_DIR, 'maintenance')
DATABASE_DIR = os.path.join(BASE_DIR, 'database')
UPLOAD_FOLDER = os.path.join(DATABASE_DIR, 'files')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_log_file(log_type='site'):
    hoje_str = datetime.date.today().strftime('%Y-%m-%d')
    dia_dir = os.path.join(LOG_BASE_DIR, hoje_str)
    os.makedirs(dia_dir, exist_ok=True)
    if log_type == 'database':
        return os.path.join(dia_dir, 'database_access.log')
    return os.path.join(dia_dir, 'site_access.log')

def registrar_log(mensagem, log_type='site'):
    try:
        with open(get_log_file(log_type), 'a', encoding='utf-8') as f:
            timestamp = datetime.datetime.now().strftime('%H:%M:%S')
            f.write(f"[{timestamp}] {mensagem}\n")
    except Exception as e:
        print(f"Erro ao salvar log: {e}")

def atualizar_linha():
    log_msg = f"📊 Visitas Total: {visitas_total} | Hoje: {visitas_hoje}"
    sys.stdout.write(f"\r{log_msg}")
    sys.stdout.flush()
    registrar_log(log_msg)

def generate_structure_json():
    try:
        script_path = os.path.join(DATABASE_DIR, 'generate_assets_structure.py')
        subprocess.run([sys.executable, script_path], check=True)
        registrar_log("✅ Estrutura JSON atualizada com sucesso.", log_type='database')
        return True
    except Exception as e:
        registrar_log(f"❌ Erro ao atualizar estrutura JSON: {e}", log_type='database')
        return False

def send_error_file(path, code):
    try:
        return send_file(path), code
    except:
        return f"Erro {code}", code

@app.before_request
def security_and_tracking():
    global visitas_total, visitas_hoje, data_atual
    
    if request.path.endswith(('favicon.ico', 'favicon.png')):
        return '', 204
    
    extensoes_ignoradas = (
        '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', 
        '.woff', '.woff2', '.ttf', '.otf', '.json', '.map', '.ico'
    )
    pastas_ignoradas = ('/assets/', '/css/', '/js/', '/img/', '/src/', '/maintenance/')
    
    if request.path.endswith(extensoes_ignoradas) or any(p in request.path for p in pastas_ignoradas):
        return

    client_ip = request.remote_addr
    current_time = time.time()
    if current_time - request_counts[client_ip]['timestamp'] > RATE_LIMIT_PERIOD:
        request_counts[client_ip] = {'count': 1, 'timestamp': current_time}
    else:
        request_counts[client_ip]['count'] += 1
    
    if request_counts[client_ip]['count'] > RATE_LIMIT_COUNT:
        return send_error_file(os.path.join(MAINTENANCE_DIR, '429.html'), 429)
    
    hoje = datetime.date.today()
    if hoje != data_atual:
        visitas_hoje = 0
        data_atual = hoje
    
    visitas_total += 1
    visitas_hoje += 1
    
    if request.path.startswith('/database'):
        registrar_log(f"👤 Acesso Database: {client_ip} -> {request.path}", log_type='database')
        registrar_log(f"📊 Visitas Total: {visitas_total} | Hoje: {visitas_hoje}", log_type='database')
    else:
        registrar_log(f"👤 Acesso: {client_ip} -> {request.path}")
        atualizar_linha()

# Configuração para passar para o routes.py
config = {
    'BASE_DIR': BASE_DIR,
    'DATABASE_DIR': DATABASE_DIR,
    'MAINTENANCE_DIR': MAINTENANCE_DIR,
    'UPLOAD_FOLDER': UPLOAD_FOLDER,
    'registrar_log': registrar_log,
    'generate_structure_json': generate_structure_json,
    'send_error_file': send_error_file
}

# Registrar as rotas a partir do arquivo separado
register_routes(app, config)

if __name__ == '__main__':
    # Removido generate_structure_json() daqui para acelerar o boot
    # A estrutura ja e gerada pelo start.sh antes de iniciar o servidor
    print("\n🚀 Servidor ONLINE na porta 5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
