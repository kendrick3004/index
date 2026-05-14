from flask import render_template, request, send_file, redirect, url_for, send_from_directory, jsonify
import os
import sys
import subprocess
from werkzeug.utils import secure_filename

def register_routes(app, config):
    """
    Registra todas as rotas e redirecionamentos no aplicativo Flask.
    config: dicionário contendo caminhos e funções auxiliares (registrar_log, generate_structure_json, etc.)
    """
    
    BASE_DIR = config['BASE_DIR']
    DATABASE_DIR = config['DATABASE_DIR']
    MAINTENANCE_DIR = config['MAINTENANCE_DIR']
    UPLOAD_FOLDER = config['UPLOAD_FOLDER']
    registrar_log = config['registrar_log']
    generate_structure_json = config['generate_structure_json']
    send_error_file = config['send_error_file']

    # --- Rotas de Páginas Principais ---
    
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/calendar')
    def calendar():
        return render_template('pages/calendar.html')

    @app.route('/login')
    def login():
        return render_template('pages/login.html')

    # --- Rotas do Database ---

    @app.route('/database')
    def database():
        return render_template('database/index.html')

    @app.route('/database/upload', methods=['POST'])
    def upload_file():
        if 'files[]' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400
        
        files = request.files.getlist('files[]')
        uploaded_count = 0
        client_ip = request.remote_addr

        # Determinar pasta de destino a partir do parâmetro 'current_path'
        # O frontend envia o currentPath (ex: 'database/files/Anderson' ou 'database_root')
        current_path_param = request.form.get('current_path', 'database_root')

        # Inicializa com a pasta padrão (database/files)
        dest_folder = UPLOAD_FOLDER

        if current_path_param and current_path_param != 'database_root':
            # Remover prefixo 'database/' para obter o caminho relativo dentro de DATABASE_DIR
            relative = current_path_param
            if relative.startswith('database/'):
                relative = relative[len('database/'):]
            
            # Montar caminho absoluto dentro de DATABASE_DIR
            proposed_dest = os.path.normpath(os.path.join(DATABASE_DIR, relative))
            
            # Segurança: garantir que o destino está dentro de DATABASE_DIR
            # Usar realpath para resolver symlinks e path traversal
            try:
                real_database = os.path.realpath(os.path.normpath(DATABASE_DIR))
                real_proposed = os.path.realpath(proposed_dest)
                
                # Verificar se o caminho proposto está dentro de DATABASE_DIR
                if real_proposed.startswith(real_database):
                    dest_folder = real_proposed
                else:
                    registrar_log(f"⚠️ Tentativa de path traversal bloqueada: {current_path_param}", log_type='database')
                    dest_folder = UPLOAD_FOLDER
            except Exception as e:
                registrar_log(f"⚠️ Erro ao validar caminho: {e}", log_type='database')
                dest_folder = UPLOAD_FOLDER

        os.makedirs(dest_folder, exist_ok=True)
        
        for file in files:
            if file.filename == '':
                continue
            filename = secure_filename(file.filename)
            filepath = os.path.join(dest_folder, filename)
            file.save(filepath)
            uploaded_count += 1
            registrar_log(f"⬆️ Upload: {client_ip} enviou {filename} -> {dest_folder}", log_type='database')
        
        return jsonify({
            "message": f"{uploaded_count} arquivo(s) enviados com sucesso",
            "count": uploaded_count,
            "destination": dest_folder
        }), 200

    @app.route('/database/generate-structure', methods=['POST'])
    def trigger_generate_structure():
        if generate_structure_json():
            return jsonify({"status": "success"})
        return jsonify({"status": "error"}), 500

    @app.route('/database/<path:filename>')
    def serve_database_files(filename):
        site_database_dir = os.path.join(os.path.dirname(__file__), 'database')
        target_path = os.path.join(site_database_dir, filename)
        if os.path.exists(target_path):
            return send_from_directory(site_database_dir, filename)
        return send_from_directory(DATABASE_DIR, filename)

    # --- Rotas de Manutenção e Estáticos ---

    @app.route('/maintenance/<path:filename>')
    def serve_maintenance_files(filename):
        return send_from_directory(MAINTENANCE_DIR, filename)

    # --- Tratamento de Erros ---

    @app.errorhandler(404)
    def error_404(e): 
        return send_error_file(os.path.join(MAINTENANCE_DIR, '404.html'), 404)

    @app.errorhandler(500)
    @app.errorhandler(Exception)
    def error_500(e): 
        registrar_log(f"❌ 500: {str(e)}")
        return send_error_file(os.path.join(MAINTENANCE_DIR, '500.html'), 500)

    # --- Redirecionamentos Personalizados ---
    
    @app.route('/go-calendar')
    def redirect_calendar():
        return redirect(url_for('calendar'))

    @app.route('/go-database')
    def redirect_database():
        return redirect(url_for('database'))

    @app.route('/go-site')
    def redirect_site():
        return redirect(url_for('index'))