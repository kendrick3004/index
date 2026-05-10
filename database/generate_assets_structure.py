import json
import os
import sys
import time


def get_file_info(path, project_root):
    """
    Coleta informações de um arquivo individual.
    O path no JSON deve ser relativo à raiz que o servidor serve.
    """
    try:
        stat = os.stat(path)
        # O rel_path será usado para download/preview no navegador.
        # O Flask serve 'site' como root e também serve '/database' a partir da raiz do projeto.
        
        abs_path = os.path.abspath(path)
        site_dir = os.path.join(project_root, "site")
        database_dir = os.path.join(project_root, "database")
        
        if abs_path.startswith(site_dir):
            rel_path = os.path.relpath(abs_path, site_dir).replace("\\", "/")
        elif abs_path.startswith(database_dir):
            # Para arquivos na pasta database na raiz, o caminho deve ser /database/filename
            rel_path = "database/" + os.path.relpath(abs_path, database_dir).replace("\\", "/")
        else:
            rel_path = os.path.relpath(abs_path, project_root).replace("\\", "/")

        ext = os.path.splitext(path)[1][1:].lower()

        if ext in ["jpg", "jpeg", "png", "gif", "svg", "webp"]:
            type_cat = "image"
        elif ext in ["pdf"]:
            type_cat = "pdf"
        elif ext in ["zip", "rar", "7z", "tar", "gz"]:
            type_cat = "archive"
        elif ext in ["js", "html", "css", "py", "php", "json", "ts"]:
            type_cat = "code"
        elif ext in ["mp4", "webm", "ogg", "mov"]:
            type_cat = "video"
        elif ext in ["mp3", "wav", "flac"]:
            type_cat = "audio"
        elif ext in ["ttf", "otf", "woff", "woff2"]:
            type_cat = "font"
        else:
            type_cat = "file"

        return {
            "id": rel_path,
            "name": os.path.basename(path),
            "path": rel_path,
            "size": stat.st_size,
            "extension": ext,
            "type": type_cat,
            "modified": int(stat.st_mtime * 1000),
            "preview": rel_path if type_cat == "image" else None,
        }
    except Exception as e:
        return None


def generate_structure(target_dir, project_root, is_database=False):
    """
    Escaneia um diretório e gera uma estrutura de dicionário.
    """
    structure = {}
    
    # Define a base para as chaves do JSON
    if is_database:
        root_key_name = "database_root"
        key_prefix = "database/"
    else:
        root_key_name = "root"
        key_prefix = ""

    for root, dirs, files in os.walk(target_dir):
        # Ignora pastas de cache e controle
        if "__pycache__" in dirs:
            dirs.remove("__pycache__")
        if ".git" in dirs:
            dirs.remove(".git")

        rel_from_target = os.path.relpath(root, target_dir).replace("\\", "/")

        if rel_from_target == ".":
            json_key = root_key_name
        else:
            json_key = key_prefix + rel_from_target

        current_entry = {"files": [], "folders": []}

        for d in dirs:
            folder_path = os.path.join(root, d)
            rel_folder_path = os.path.relpath(folder_path, target_dir).replace("\\", "/")
            
            folder_id = key_prefix + rel_folder_path
            try:
                current_entry["folders"].append(
                    {
                        "id": folder_id,
                        "name": d,
                        "path": rel_folder_path,
                        "modified": int(os.path.getmtime(folder_path) * 1000),
                    }
                )
            except Exception:
                pass

        for f in files:
            # Ignora o próprio script e o arquivo de saída se estiverem na pasta sendo escaneada
            if f in ["generate_assets_structure.py", "philistudies.json"]:
                continue
                
            file_path = os.path.join(root, f)
            file_info = get_file_info(file_path, project_root)
            if file_info:
                current_entry["files"].append(file_info)

        structure[json_key] = current_entry

    return structure


if __name__ == "__main__":
    # O script agora está em /database/ na raiz
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_script_dir, ".."))
    site_dir = os.path.join(project_root, "site")
    
    # Caminhos para escanear
    assets_path = os.path.join(site_dir, "assets")
    database_path = current_script_dir # A própria pasta onde o script está (/database/)
    
    # O arquivo philistudies.json fica na mesma pasta do script (/database/)
    output_path = os.path.join(current_script_dir, "philistudies.json")

    start_time = time.time()

    try:
        structure = {}
        
        # 1. Processa a pasta assets do site
        if os.path.isdir(assets_path):
            assets_structure = generate_structure(assets_path, project_root, is_database=False)
            structure.update(assets_structure)
        
        # 2. Processa a pasta database na raiz do projeto
        if os.path.isdir(database_path):
            database_structure = generate_structure(database_path, project_root, is_database=True)
            structure.update(database_structure)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(structure, f, indent=4, ensure_ascii=False)

        print(f"Estrutura gerada com sucesso em: {output_path}")
        sys.exit(0)
    except Exception as e:
        print(f"Erro ao gerar estrutura: {e}")
        sys.exit(1)
