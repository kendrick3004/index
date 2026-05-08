# 🖥️ Guia Exaustivo de Sistemas Operacionais: Windows, Mac e Linux

Este documento é a base de conhecimento sobre como os sistemas operacionais gerenciam hardware e software, conectando-se diretamente com a [Arquitetura de Sistemas](./BRAIN_CORE.md).

## 1. Windows: O Ecossistema de Produtividade

O Windows utiliza o kernel NT e é focado em compatibilidade e interface gráfica.

### 🐚 Terminal (CMD e PowerShell)
- **`dir`**: Lista arquivos e pastas (equivalente ao `ls` no Linux).
- **`cd`**: Muda o diretório de trabalho.
- **`mkdir`**: Cria uma nova pasta.
- **`rmdir`**: Remove uma pasta vazia.
- **`del`**: Apaga arquivos.
- **`cls`**: Limpa a tela do terminal.
- **`ipconfig`**: Mostra as configurações de rede (IP, Gateway).
- **`tasklist`**: Lista todos os processos em execução.
- **`taskkill`**: Encerra um processo pelo ID ou nome.

---

## 2. Linux: O Coração do Servidor e do Desenvolvimento

O Linux é um kernel Unix-like, conhecido por sua estabilidade e poder no terminal.

### 🐚 Terminal (Bash/Zsh)
- **`ls`**: Lista o conteúdo do diretório.
    - `-la`: Mostra arquivos ocultos e detalhes de permissão.
- **`pwd`**: Mostra o caminho completo do diretório atual.
- **`sudo`**: Executa comandos com privilégios de superusuário (root).
- **`apt-get / yum / pacman`**: Gerenciadores de pacotes para instalar software.
- **`grep`**: Procura por texto dentro de arquivos.
- **`chmod`**: Altera as permissões de um arquivo (leitura, escrita, execução).
- **`chown`**: Altera o dono do arquivo.
- **`top / htop`**: Monitora o uso de CPU e Memória em tempo real.

---

## 3. macOS: A Elegância do Unix

O macOS é baseado no kernel Darwin (BSD), unindo a robustez do Unix com uma interface refinada.

### 🐚 Terminal (Zsh por padrão)
- **`open`**: Abre um arquivo ou pasta como se você tivesse clicado duas vezes.
- **`brew`**: O gerenciador de pacotes (Homebrew) essencial para desenvolvedores.
- **`pbcopy / pbpaste`**: Copia e cola texto diretamente do terminal para o clipboard do sistema.
- **`mdfind`**: Versão de terminal do Spotlight para busca ultra-rápida de arquivos.

---

## 4. Interconectividade de Comandos

| Função | Windows (CMD) | Linux/Mac (Bash/Zsh) |
| :--- | :--- | :--- |
| Listar Arquivos | `dir` | `ls` |
| Limpar Tela | `cls` | `clear` |
| Ver IP | `ipconfig` | `ifconfig` ou `ip a` |
| Copiar Arquivo | `copy` | `cp` |
| Mover Arquivo | `move` | `mv` |
| Criar Pasta | `mkdir` | `mkdir` |

---
*Este arquivo é parte do [BRAIN_CORE.md](./BRAIN_CORE.md). Conecte este conhecimento com [JAVASCRIPT_EXHAUSTIVE_GUIDE.md](./JAVASCRIPT_EXHAUSTIVE_GUIDE.md) para automação de scripts.*
