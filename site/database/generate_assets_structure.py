import os
import json
import time

def get_file_info(path, root_dir):
    """
    Coleta informações de um arquivo individual.
    """
    try:
        stat = os.stat(path)
        # Caminho relativo em relação à raiz do projeto (ex: assets/colors/file.ext)
        rel_path = os.path.relpath(path, root_dir).replace("\\", "/")
        
        # Obtém a extensão sem o ponto
        ext = os.path.splitext(path)[1][1:].lower()
        
        # Categorização baseada na extensão para facilitar o uso no front-end
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']:
            type_cat = 'image'
        elif ext in ['pdf']:
            type_cat = 'pdf'
        elif ext in ['zip', 'rar', '7z', 'tar', 'gz']:
            type_cat = 'archive'
        elif ext in ['js', 'html', 'css', 'py', 'php', 'json', 'ts']:
            type_cat = 'code'
        elif ext in ['mp4', 'webm', 'ogg', 'mov']:
            type_cat = 'video'
        elif ext in ['mp3', 'wav', 'flac']:
            type_cat = 'audio'
        elif ext in ['ttf', 'otf', 'woff', 'woff2']:
            type_cat = 'font'
        else:
            type_cat = 'file'

        return {
            "id": rel_path,
            "name": os.path.basename(path),
            "path": rel_path,
            "size": stat.st_size,
            "extension": ext,
            "type": type_cat,
            "modified": int(stat.st_mtime * 1000),
            "preview": rel_path if type_cat == 'image' else None
        }
    except Exception as e:
        print(f"Erro ao processar arquivo {path}: {e}")
        return None

def generate_structure(assets_dir):
    """
    Escaneia a pasta assets e gera uma estrutura de dicionário.
    """
    structure = {}
    # O root do projeto é o pai da pasta assets
    project_root = os.path.dirname(assets_dir)
    
    for root, dirs, files in os.walk(assets_dir):
        # Ignora a pasta 'sets' se ela existir dentro de assets (conforme pedido)
        if 'sets' in dirs:
            dirs.remove('sets')
            
        # rel_root em relação ao project_root (ex: assets/colors)
        rel_root = os.path.relpath(root, project_root).replace("\\", "/")
        
        # Chave para o JSON: se for a pasta assets, usamos "root", caso contrário removemos o prefixo "assets/"
        if rel_root == "assets":
            json_key = "root"
        else:
            # Remove o prefixo "assets/" ou "assets"
            if rel_root.startswith("assets/"):
                json_key = rel_root.replace("assets/", "", 1)
            elif rel_root == "assets":
                json_key = "root"
            else:
                json_key = rel_root
        
        current_entry = {
            "files": [],
            "folders": []
        }
        
        # Processar subpastas
        for d in dirs:
            folder_path = os.path.join(root, d)
            # Caminho relativo em relação a assets_dir para navegação interna
            rel_folder_path = os.path.relpath(folder_path, assets_dir).replace("\\", "/")
            
            try:
                current_entry["folders"].append({
                    "id": rel_folder_path,
                    "name": d,
                    "path": rel_folder_path,
                    "modified": int(os.path.getmtime(folder_path) * 1000)
                })
            except:
                pass
            
        # Processar arquivos
        for f in files:
            file_path = os.path.join(root, f)
            file_info = get_file_info(file_path, project_root)
            if file_info:
                current_entry["files"].append(file_info)
            
        structure[json_key] = current_entry
        
    return structure

if __name__ == "__main__":
    # Obtém o diretório onde o script está localizado
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Define o caminho da pasta assets (mesmo nível do script)
    assets_path = os.path.join(current_dir, "assets")
    
    if not os.path.exists(assets_path):
        print(f"Erro: Pasta 'assets' não encontrada em: {current_dir}")
    else:
        print(f"Escaneando arquivos em: {assets_path}...")
        start_time = time.time()
        structure = generate_structure(assets_path)
        
        # Salva o JSON na raiz do projeto (mesmo diretório do script)
        output_path = os.path.join(current_dir, "file_structure.json")
        
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(structure, f, indent=4, ensure_ascii=False)
            
            end_time = time.time()
            duration = end_time - start_time
            
            print(f"Sucesso! 'file_structure.json' gerado com {len(structure)} categorias.")
            print(f"Tempo de execução: {duration:.2f} segundos.")
            print(f"Caminho do arquivo: {output_path}")
        except Exception as e:
            print(f"Erro ao salvar o arquivo JSON: {e}")
