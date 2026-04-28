import json
import os
import sys
import time


def get_file_info(path, root_dir):
    """
    Coleta informações de um arquivo individual.
    """
    try:
        stat = os.stat(path)
        rel_path = os.path.relpath(path, root_dir).replace("\\", "/")
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


def generate_structure(assets_dir):
    """
    Escaneia a pasta assets e gera uma estrutura de dicionário.
    """
    structure = {}
    project_root = os.path.dirname(assets_dir)

    for root, dirs, files in os.walk(assets_dir):
        if "sets" in dirs:
            dirs.remove("sets")

        rel_root = os.path.relpath(root, project_root).replace("\\", "/")

        if rel_root == "assets":
            json_key = "root"
        else:
            if rel_root.startswith("assets/"):
                json_key = rel_root.replace("assets/", "", 1)
            elif rel_root == "assets":
                json_key = "root"
            else:
                json_key = rel_root

        current_entry = {"files": [], "folders": []}

        for d in dirs:
            folder_path = os.path.join(root, d)
            rel_folder_path = os.path.relpath(folder_path, assets_dir).replace("\\", "/")
            try:
                current_entry["folders"].append(
                    {
                        "id": rel_folder_path,
                        "name": d,
                        "path": rel_folder_path,
                        "modified": int(os.path.getmtime(folder_path) * 1000),
                    }
                )
            except Exception:
                pass

        for f in files:
            file_path = os.path.join(root, f)
            file_info = get_file_info(file_path, project_root)
            if file_info:
                current_entry["files"].append(file_info)

        structure[json_key] = current_entry

    return structure


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    assets_path = os.path.join(current_dir, "assets")
    output_path = os.path.join(current_dir, "file_structure.json")

    if not os.path.isdir(assets_path):
        sys.exit(1)

    start_time = time.time()

    try:
        structure = generate_structure(assets_path)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(structure, f, indent=4, ensure_ascii=False)

        duration = time.time() - start_time
        sys.exit(0)
    except Exception as e:
        sys.exit(1)
