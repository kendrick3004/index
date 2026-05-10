# Skill: Database: Controle de Concorrência, Locks e Níveis de Isolamento

## Introdução

Esta skill aborda o **Controle de Concorrência** em bancos de dados, o conjunto de mecanismos que permite que múltiplos usuários e aplicações acessem e modifiquem os mesmos dados simultaneamente sem comprometer a integridade e a consistência das informações. Em sistemas de alta carga, o controle de concorrência é o que evita que uma transação sobrescreva as alterações de outra ou que um usuário veja dados parciais e inconsistentes durante um processo complexo.

Exploraremos os diferentes tipos de **Locks** (travas), desde travas de linha até travas de tabela, e os **Níveis de Isolamento** definidos pelo padrão SQL (`Read Uncommitted`, `Read Committed`, `Repeatable Read` e `Serializable`). Discutiremos fenômenos indesejados como "Dirty Reads", "Non-repeatable Reads" e "Phantom Reads", além de abordar a técnica moderna de **MVCC (Multi-Version Concurrency Control)**, que permite leituras sem bloqueios. Este conhecimento é vital para desenvolvedores e DBAs que precisam equilibrar a consistência absoluta com a alta performance e escalabilidade.

## Glossário Técnico

*   **Concorrência**: A execução simultânea de múltiplas transações que acessam os mesmos dados.
*   **Lock (Trava)**: Um mecanismo que impede que outras transações acessem ou modifiquem um dado enquanto ele está sendo usado.
*   **Shared Lock (S-Lock)**: Trava de leitura; permite que outros leiam, mas impede que escrevam.
*   **Exclusive Lock (X-Lock)**: Trava de escrita; impede que outros leiam ou escrevam.
*   **Deadlock**: Situação onde duas transações esperam uma pela outra para liberar travas, travando o sistema indefinidamente.
*   **MVCC (Multi-Version Concurrency Control)**: Técnica que mantém múltiplas versões de um registro para permitir que leitores não bloqueiem escritores e vice-versa.
*   **Dirty Read (Leitura Suja)**: Quando uma transação lê dados que foram alterados por outra transação que ainda não deu `COMMIT`.
*   **Non-repeatable Read (Leitura Não Repetível)**: Quando uma transação lê o mesmo registro duas vezes e obtém valores diferentes porque outra transação o alterou no meio do caminho.
*   **Phantom Read (Leitura Fantasma)**: Quando uma transação executa a mesma consulta duas vezes e obtém um número diferente de linhas porque outra transação inseriu ou deletou registros.

## Conceitos Fundamentais

### 1. Fenômenos de Concorrência e Níveis de Isolamento

O padrão SQL define quatro níveis de isolamento, cada um protegendo contra diferentes fenômenos indesejados:

| Nível de Isolamento | Dirty Read | Non-repeatable Read | Phantom Read | Performance |
| :--- | :--- | :--- | :--- | :--- |
| **Read Uncommitted** | Possível | Possível | Possível | Máxima |
| **Read Committed** | Protegido | Possível | Possível | Alta |
| **Repeatable Read** | Protegido | Protegido | Possível | Média |
| **Serializable** | Protegido | Protegido | Protegido | Baixa |

A maioria dos SGBDs modernos (como PostgreSQL e Oracle) usa `Read Committed` como padrão, oferecendo um bom equilíbrio entre segurança e velocidade. O nível `Serializable` garante a consistência total, mas pode causar muitos erros de serialização ou lentidão extrema devido ao excesso de travas.

### 2. Mecanismos de Travamento (Locking)

Os SGBDs usam uma hierarquia de travas para gerenciar o acesso:
*   **Row-Level Lock**: Trava apenas a linha específica. É o mais granular e permite alta concorrência.
*   **Page-Level Lock**: Trava um bloco de dados (página) que contém várias linhas.
*   **Table-Level Lock**: Trava a tabela inteira. Comum em operações DDL ou quando o SGBD percebe que travar linha por linha consumiria muita memória (Lock Escalation).

### 3. MVCC: O Segredo da Performance Moderna

O **Multi-Version Concurrency Control (MVCC)** é a técnica que revolucionou a performance de bancos de dados como PostgreSQL e MySQL (InnoDB). Em vez de travar um registro para leitura, o SGBD cria uma nova versão do registro quando ele é alterado. Os leitores continuam vendo a versão antiga (consistente com o início de sua transação) enquanto o escritor trabalha na nova versão. Isso elimina o conflito "leitor vs. escritor", permitindo que o banco escale muito melhor em ambientes de leitura intensiva.

## Histórico e Evolução

Nos primórdios, os bancos de dados usavam o protocolo de **Two-Phase Locking (2PL)**, que era rigoroso mas causava muitos bloqueios e deadlocks. Com o aumento da demanda por sistemas web de alta escala nos anos 90 e 2000, o MVCC tornou-se o padrão de fato. SGBDs modernos também introduziram o **Optimistic Concurrency Control (OCC)**, onde o banco assume que não haverá conflitos e só verifica a integridade no momento do `COMMIT`, o que é extremamente eficiente para sistemas com baixa contenção de dados.

## Exemplos Práticos e Casos de Uso

### Cenário: Reserva de Assentos em um Cinema

```sql
-- Transação 1: Tentando reservar o assento A10
BEGIN TRANSACTION;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- 1. Verifica se o assento está livre
SELECT status FROM ASSENTOS WHERE id_assento = 'A10'; -- Retorna 'Livre'

-- Transação 2: Outro usuário tenta o mesmo assento simultaneamente
-- Se o nível for READ COMMITTED, ele pode ver 'Livre' também.

-- 2. Reserva o assento
UPDATE ASSENTOS SET status = 'Reservado' WHERE id_assento = 'A10';

COMMIT;
```

Neste cenário, se o nível de isolamento for muito baixo, dois usuários podem ver o assento como 'Livre' ao mesmo tempo e ambos tentarem o `UPDATE`. O SGBD usará travas de escrita (X-Locks) para garantir que apenas um `UPDATE` ocorra por vez, mas o nível de isolamento determinará se o segundo usuário receberá um erro ou se ele simplesmente sobrescreverá a reserva do primeiro (Lost Update).

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Detecção de Deadlock

```mermaid
graph TD
    A[Transação A trava Recurso 1] --> B[Transação B trava Recurso 2]
    B --> C[Transação A tenta travar Recurso 2 - Aguarda B]
    C --> D[Transação B tenta travar Recurso 1 - Aguarda A]
    D --> E{Deadlock Detectado pelo SGBD?}
    E -- Sim --> F[SGBD escolhe uma Vítima]
    F --> G[Abortar Transação B e dar Rollback]
    G --> H[Transação A pode prosseguir]
    E -- Não --> I[Sistema Travado (Timeout)]
```

**Explicação**: O diagrama ilustra o "abraço mortal" (Deadlock). O SGBD monitora constantemente o grafo de dependências entre transações. Quando detecta um ciclo, ele sacrifica uma das transações (geralmente a que fez menos trabalho) para permitir que as outras continuem, evitando que o servidor pare de responder.

## Boas Práticas e Padrões de Projeto

*   **Mantenha Transações Curtas**: Quanto menos tempo uma transação durar, menos tempo ela segurará travas e menor será a chance de conflitos.
*   **Acesse Objetos na Mesma Ordem**: Se todas as suas transações acessarem a Tabela A e depois a Tabela B, você evitará a maioria dos deadlocks.
*   **Use o Nível de Isolamento Mínimo Necessário**: Não use `Serializable` se `Read Committed` for suficiente para sua regra de negócio.
*   **Evite Locks de Tabela**: Tente sempre filtrar suas consultas por chaves primárias para garantir que o SGBD use travas de linha.
*   **Trate Erros de Serialização**: Se você usar níveis altos de isolamento, sua aplicação deve estar preparada para receber erros de conflito e tentar a operação novamente (Retry Logic).
*   **Cuidado com o SELECT FOR UPDATE**: Use este comando com cautela, pois ele cria uma trava de escrita mesmo em uma operação de leitura, o que pode derrubar a performance se usado em excesso.

## Comparativos Detalhados

| Técnica | Vantagem | Desvantagem |
| :--- | :--- | :--- |
| **Pessimistic Locking** | Garante integridade total; evita conflitos antes que ocorram. | Pode causar lentidão e deadlocks; escala mal. |
| **Optimistic Locking** | Alta performance; sem travas durante a execução. | Pode falhar no `COMMIT` se houver conflito; exige lógica de retry. |
| **MVCC** | Leitores não bloqueiam escritores; excelente escalabilidade. | Consome mais espaço em disco (múltiplas versões); exige limpeza (Vacuum). |

## Ferramentas e Recursos

A maioria dos SGBDs oferece visões de sistema para monitorar travas e bloqueios em tempo real (ex: `pg_locks` no PostgreSQL ou `sys.dm_os_waiting_tasks` no SQL Server). Ferramentas como o **SQL Profiler** ou o **Query Store** ajudam a identificar consultas que estão causando contenção excessiva e bloqueando outros usuários por longos períodos.

## Tópicos Avançados e Pesquisa Futura

O futuro do controle de concorrência está nos **Bancos de Dados Sem Travas (Lock-Free Databases)**, que usam algoritmos de hardware (como Compare-and-Swap) e estruturas de dados imutáveis para eliminar completamente a necessidade de travas tradicionais. Outra área de evolução é o **Controle de Concorrência Geograficamente Distribuído**, onde o desafio é garantir o isolamento entre data centers separados por milhares de quilômetros, lidando com a latência da luz. Além disso, a pesquisa em "Snapshot Isolation" continua a evoluir para oferecer garantias cada vez mais próximas do `Serializable` com a performance do `Read Committed`.

## Perguntas Frequentes (FAQ)

*   **P: O que é o "Vacuum" no PostgreSQL?**
    *   R: Como o MVCC cria múltiplas versões de registros, as versões antigas (mortas) precisam ser limpas para liberar espaço. O processo de Vacuum faz essa limpeza automática.
*   **P: Como posso evitar deadlocks?**
    *   R: A melhor forma é garantir que todas as transações acessem as tabelas na mesma ordem lógica e manter as transações o mais curtas possível, evitando processamento pesado ou interação com o usuário dentro delas.

## Referências Cruzadas

*   **`[[13_Transacoes_ACID_Atomicidade_Consistencia_Isolamento_Durabilidade]]`**
*   **`[[28_IndexedDB_API_e_Armazenamento_de_Dados_Offline]]`**
*   **`[[36_Monitoramento_de_Banco_de_Dados_Metricas_e_Alertas]]`**

## Referências

[1] Gray, J., & Reuter, A. (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann.
[2] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts*. McGraw-Hill.
[3] Bernstein, P. A., & Newcomer, E. (2009). *Principles of Transaction Processing*. Morgan Kaufmann.
