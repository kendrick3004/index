# 🍎 Guia Atômico de macOS: Arquitetura e Terminal

Este documento é um neurônio especializado no sistema operacional macOS, detalhando desde o kernel Darwin até a execução de comandos granulares no terminal.

## 1. Arquitetura do Sistema (O Esqueleto)

O macOS opera sobre o **Kernel Darwin**, um kernel baseado em BSD (Berkeley Software Distribution) e Mach.

- **Mach**: O microkernel que gerencia a comunicação entre processos (IPC) e o hardware.
- **BSD**: A camada que fornece as APIs de rede, sistema de arquivos e o terminal (POSIX).
- **Quartz**: O motor gráfico que renderiza a interface Aqua.
- **APFS (Apple File System)**: O sistema de arquivos moderno, otimizado para SSDs e criptografia.

## 2. Dicionário Atômico do Terminal (Zsh & Bash)

Aqui, cada comando é uma ferramenta de precisão para manipular o sistema.

### 📂 Manipulação de Arquivos e Pastas
- **`ls` (List)**: Lista o conteúdo de um diretório.
    - `-l`: Formato longo (detalhes de permissão e tamanho).
    - `-a`: Mostra arquivos ocultos (que começam com `.`).
- **`cd` (Change Directory)**: Altera o foco do terminal para outra pasta.
    - `cd ~`: Volta para a pasta Home do usuário.
- **`mkdir` (Make Directory)**: Cria uma nova célula (pasta) no sistema de arquivos.
- **`cat` (Concatenate)**: Exibe o conteúdo de um arquivo de texto diretamente no terminal.
- **`cp` (Copy)**: Duplica um arquivo de uma origem para um destino.
- **`mv` (Move)**: Move ou renomeia arquivos e pastas.
- **`rm` (Remove)**: Remove arquivos permanentemente do disco.
    - `-rf`: Remove pastas e seu conteúdo recursivamente e à força.

### ⚙️ Gestão de Sistema e Processos
- **`top`**: Exibe uma tabela de todos os processos (neurônios ativos) no sistema em tempo real.
- **`kill`**: Encerra um processo pelo seu ID (PID).
    - `-9`: Força o encerramento imediato.
- **`open`**: Abre um arquivo, pasta ou aplicativo como se você tivesse clicado duas vezes.
    - `open .`: Abre a pasta atual no Finder.
- **`sw_vers`**: Mostra a versão exata do macOS instalada.
- **`diskutil`**: Ferramenta poderosa para gerenciar discos e partições.

### 🌐 Rede e Conectividade
- **`ifconfig`**: Revela o endereço IP, máscara de sub-rede e gateway padrão.
- **`ping`**: Testa a conectividade com outro host enviando pacotes de dados.
- **`netstat`**: Mostra todas as conexões de rede ativas e portas abertas.
- **`networksetup`**: Configurações avançadas de rede via terminal.

---
*Conexão Neural: Este conhecimento se integra ao [OS_EXHAUSTIVE_GUIDE.md](./OS_EXHAUSTIVE_GUIDE.md) e permite automação via [JAVASCRIPT_EXHAUSTIVE_GUIDE.md](./JAVASCRIPT_EXHAUSTIVE_GUIDE.md) usando Node.js.*
