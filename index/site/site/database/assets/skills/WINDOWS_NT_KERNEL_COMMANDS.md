# 🪟 Guia Atômico de Windows: Arquitetura e Terminal

Este documento é um neurônio especializado no sistema operacional Windows, detalhando desde o kernel NT até a execução de comandos granulares no terminal.

## 1. Arquitetura do Sistema (O Esqueleto)

O Windows opera sobre o **Kernel NT (New Technology)**, um kernel híbrido que gerencia a comunicação entre o hardware e o software.

- **HAL (Hardware Abstraction Layer)**: A camada que esconde as complexidades do hardware do restante do sistema.
- **Registro do Windows (Registry)**: O banco de dados central que armazena todas as configurações do sistema e aplicativos.
- **Win32 API**: A interface principal para desenvolvedores criarem aplicativos que interagem com o Windows.

## 2. Dicionário Atômico do Terminal (CMD & PowerShell)

Aqui, cada comando é uma ferramenta de precisão para manipular o sistema.

### 📂 Manipulação de Arquivos e Pastas
- **`dir` (Directory)**: Lista o conteúdo de um diretório.
    - `/a`: Mostra arquivos com atributos específicos (ex: ocultos).
    - `/s`: Lista arquivos em subpastas recursivamente.
- **`cd` (Change Directory)**: Altera o foco do terminal para outra pasta.
    - `cd ..`: Sobe um nível na hierarquia.
- **`mkdir` (Make Directory)**: Cria uma nova célula (pasta) no sistema de arquivos.
- **`type`**: Exibe o conteúdo de um arquivo de texto diretamente no terminal.
- **`copy`**: Duplica um arquivo de uma origem para um destino.
- **`move`**: Move ou renomeia arquivos e pastas.
- **`del` (Delete)**: Remove arquivos permanentemente do disco.

### ⚙️ Gestão de Sistema e Processos
- **`tasklist`**: Exibe uma tabela de todos os processos (neurônios ativos) no sistema.
- **`taskkill`**: Encerra um processo.
    - `/f`: Força o encerramento imediato.
    - `/im`: Encerra pelo nome da imagem (ex: `taskkill /f /im notepad.exe`).
- **`systeminfo`**: Gera um relatório completo sobre a saúde e configuração do hardware/OS.
- **`sfc /scannow`**: System File Checker. Verifica e repara arquivos corrompidos do sistema.

### 🌐 Rede e Conectividade
- **`ipconfig`**: Revela o endereço IP, máscara de sub-rede e gateway padrão.
    - `/flushdns`: Limpa o cache de nomes de domínio, resolvendo problemas de conexão.
- **`ping`**: Testa a conectividade com outro host enviando pacotes de dados.
- **`netstat`**: Mostra todas as conexões de rede ativas e portas abertas.

---
*Conexão Neural: Este conhecimento se integra ao [OS_EXHAUSTIVE_GUIDE.md](./OS_EXHAUSTIVE_GUIDE.md) e permite automação via [JAVASCRIPT_EXHAUSTIVE_GUIDE.md](./JAVASCRIPT_EXHAUSTIVE_GUIDE.md) usando Node.js.*
