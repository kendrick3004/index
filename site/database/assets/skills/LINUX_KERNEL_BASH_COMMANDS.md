# 🐧 Guia Atômico de Linux: O Coração do Sistema Neuralink

Este documento é um neurônio de alta densidade focado no sistema operacional Linux, detalhando comandos, arquitetura e lógica de processamento.

## 1. Fundamentos e Meta-Conhecimento
- **Bash**: A shell padrão. Aprenda via `man bash`. É a interface de conversação primária com o kernel.
- **Explainshell**: Ferramenta externa para decompor comandos complexos.
- **Man Pages**: O oráculo do sistema. `man man` para entender as seções (1: comandos, 5: arquivos, 8: administração).

## 2. Dicionário Atômico de Comandos (Nível Atômico)

### 📂 Gestão de Arquivos e Navegação
- **ls (List)**: Lista o conteúdo.
    - -l: Formato longo (permissões, dono, tamanho, data).
    - -h: Tamanhos legíveis por humanos (KB, MB).
    - -t: Ordena por tempo de modificação.
- **cd (Change Directory)**: Muda a localização.
    - cd -: Volta para o diretório anterior.
- **pwd (Print Working Directory)**: Localização absoluta atual.
- **cp (Copy)**: Duplica dados.
    - -r: Recursivo (para pastas).
    - -p: Preserva atributos (datas, permissões).
- **mv (Move)**: Move ou renomeia.
- **rm (Remove)**: Apaga.
    - -rf: Força a remoção recursiva (CUIDADO).
- **ln (Link)**: Cria atalhos.
    - -s: Soft link (atalho simbólico). Sem -s é um hard link (aponta para o mesmo inode).

### 🔍 Busca e Processamento de Dados
- **grep (Global Regular Expression Print)**: Procura texto.
    - -i: Ignora maiúsculas/minúsculas.
    - -r: Busca recursiva em pastas.
    - -v: Inverte a busca (mostra o que NÃO combina).
- **find**: Localiza arquivos por atributos (nome, tamanho, data).
- **xargs**: Constrói e executa comandos a partir da entrada padrão. Essencial para processamento em cadeia.
- **sed (Stream Editor)**: Transforma texto em fluxo.
- **awk**: Linguagem de processamento de texto baseada em colunas.

### ⚙️ Sistema e Performance
- **top / htop**: Monitor de processos em tempo real.
- **ps (Process Status)**: Instantâneo dos processos.
    - aux: Mostra todos os processos de todos os usuários.
- **kill**: Envia sinais a processos.
    - -9 (SIGKILL): Força o encerramento.
    - -15 (SIGTERM): Solicita encerramento gracioso.
- **df (Disk Free)**: Espaço em disco disponível.
- **du (Disk Usage)**: Espaço ocupado por arquivos/pastas.
    - du -sh *: Resumo legível da pasta atual.

### 🌐 Rede e Conectividade
- **ip addr**: Configurações de interface de rede.
- **ssh (Secure Shell)**: Acesso remoto seguro.
- **scp**: Cópia de arquivos via SSH.
- **curl / wget**: Download de dados via protocolos web.

---
*Conexão Neural: Este guia alimenta o NEURALINK_SYSTEM.md e se conecta ao WINDOWS_ATOMIC_GUIDE.md para comparação de comandos.*