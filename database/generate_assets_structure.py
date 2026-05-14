import json
import os
import sys
import time

def get_file_info(path, project_root):
    """
    Coleta informações de um arquivo individual.
    """
    try:
        stat = os.stat(path)
        abs_path = os.path.abspath(path)
        database_dir = os.path.join(project_root, "database")
        files_dir = os.path.join(database_dir, "files")
        
        # O path no JSON deve ser relativo à pasta 'database' para o Flask servir corretamente
        # Se o arquivo está em database/files/sub/file.txt, o path será database/files/sub/file.txt
        rel_path = "database/" + os.path.relpath(abs_path, database_dir).replace("\\", "/")

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
    except Exception:
        return None

def generate_structure(target_dir, project_root):
    """
    Escaneia a pasta 'files' e gera a estrutura, tratando-a como a raiz do database.
    """
    structure = {}
    database_dir = os.path.join(project_root, "database")
    
    for root, dirs, files in os.walk(target_dir):
        if "__pycache__" in dirs:
            dirs.remove("__pycache__")
        if ".git" in dirs:
            dirs.remove(".git")

        # A chave no JSON para a pasta atual
        # Se root == target_dir (database/files), a chave deve ser 'database_root'
        if os.path.abspath(root) == os.path.abspath(target_dir):
            json_key = "database_root"
        else:
            # Para subpastas, a chave é 'database/files/subpasta'
            json_key = "database/" + os.path.relpath(root, database_dir).replace("\\", "/")

        current_entry = {"files": [], "folders": []}

        for d in dirs:
            folder_path = os.path.join(root, d)
            # O ID da pasta para navegação no frontend
            folder_id = "database/" + os.path.relpath(folder_path, database_dir).replace("\\", "/")
            
            try:
                current_entry["folders"].append(
                    {
                        "id": folder_id,
                        "name": d,
                        "path": folder_id,
                        "modified": int(os.path.getmtime(folder_path) * 1000),
                    }
                )
            except Exception:
                pass

        for f in files:
            if f in ["generate_assets_structure.py", "philistudies.json"]:
                continue
                
            file_path = os.path.join(root, f)
            file_info = get_file_info(file_path, project_root)
            if file_info:
                current_entry["files"].append(file_info)

        structure[json_key] = current_entry

    return structure

if __name__ == "__main__":
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_script_dir, ".."))
    
    # Agora focamos apenas na pasta 'files' dentro de 'database'
    files_path = os.path.join(current_script_dir, "files")
    if not os.path.exists(files_path):
        os.makedirs(files_path, exist_ok=True)
    
    # O arquivo philistudies.json fica na pasta database raiz
    output_path = os.path.join(current_script_dir, "philistudies.json")

    try:
        structure = generate_structure(files_path, project_root)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(structure, f, indent=4, ensure_ascii=False)
        print(f"Estrutura gerada com sucesso em: {output_path}")
        sys.exit(0)
    except Exception as e:
        print(f"Erro ao gerar estrutura: {e}")
        sys.exit(1)
