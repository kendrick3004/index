# Skill: Database: Linguagem de Manipulação de Dados (DML) - INSERT, UPDATE, DELETE

## Introdução

Esta skill aborda a **Linguagem de Manipulação de Dados (DML)**, o subconjunto do SQL utilizado para interagir com os dados armazenados nas tabelas de um banco de dados. Enquanto a DDL define a estrutura, a DML é o que dá vida ao sistema, permitindo a inserção de novas informações, a atualização de registros existentes e a remoção de dados que não são mais necessários. Dominar a DML é fundamental para qualquer desenvolvedor ou IA que precise criar aplicações dinâmicas e interativas.

Exploraremos os comandos fundamentais: `INSERT` (para adicionar novos registros), `UPDATE` (para modificar dados existentes) e `DELETE` (para remover registros). Discutiremos a importância da cláusula `WHERE` para evitar alterações ou exclusões acidentais em massa, além de abordar o uso de subconsultas e transações para garantir a integridade e a consistência das operações de manipulação de dados. Este conhecimento é a base para a lógica de negócios de qualquer aplicação que utilize um banco de dados relacional.

## Glossário Técnico

*   **DML (Data Manipulation Language)**: Conjunto de comandos SQL usados para manipular os dados dentro das tabelas.
*   **`INSERT`**: Comando usado para adicionar uma ou mais novas linhas a uma tabela.
*   **`UPDATE`**: Comando usado para modificar os valores de colunas em uma ou mais linhas existentes.
*   **`DELETE`**: Comando usado para remover uma ou mais linhas de uma tabela.
*   **`WHERE`**: Cláusula essencial usada com `UPDATE` e `DELETE` para especificar quais linhas devem ser afetadas.
*   **`RETURNING` / `OUTPUT`**: Cláusula usada em alguns SGBDs para retornar os dados que foram inseridos, atualizados ou deletados.
*   **`UPSERT` / `MERGE`**: Operação que insere um novo registro ou atualiza um existente se houver um conflito de chave.
*   **Transação**: Uma unidade de trabalho que agrupa um ou mais comandos DML, garantindo que todos sejam executados com sucesso ou nenhum deles seja aplicado.

## Conceitos Fundamentais

### 1. O Comando INSERT: Adicionando Novos Dados

O comando `INSERT` é utilizado para popular as tabelas do banco de dados. Ele pode ser usado para inserir uma única linha, múltiplas linhas de uma vez ou até mesmo o resultado de uma consulta `SELECT`.

| Forma de Uso | Exemplo de Sintaxe | Propósito |
| :--- | :--- | :--- |
| **Inserção Simples** | `INSERT INTO tab (col1, col2) VALUES (val1, val2)` | Adiciona um único registro especificando colunas e valores. |
| **Inserção Múltipla** | `INSERT INTO tab (col) VALUES (val1), (val2)` | Adiciona vários registros em um único comando (mais eficiente). |
| **INSERT de SELECT** | `INSERT INTO tab SELECT ... FROM outra_tab` | Copia dados de uma tabela para outra de forma massiva. |

Ao realizar inserções, é importante respeitar os tipos de dados e as restrições definidas na DDL (como `NOT NULL` e `UNIQUE`). Omitir colunas que possuem valores `DEFAULT` ou são `AUTO_INCREMENT` é uma prática comum e recomendada.

### 2. O Comando UPDATE: Modificando Dados Existentes

O comando `UPDATE` permite alterar os valores de uma ou mais colunas em registros que já estão no banco de dados. A precisão é a chave aqui: sem uma cláusula `WHERE` adequada, o comando afetará **todas** as linhas da tabela, o que é um dos erros mais comuns e perigosos em administração de banco de dados.

As atualizações podem ser baseadas em valores fixos, cálculos matemáticos ou até mesmo em valores de outras tabelas através de subconsultas ou junções (dependendo do SGBD). É uma boa prática sempre executar um `SELECT` com a mesma cláusula `WHERE` antes de um `UPDATE` para confirmar quais registros serão alterados.

### 3. O Comando DELETE: Removendo Dados

O comando `DELETE` remove linhas inteiras de uma tabela. Assim como o `UPDATE`, ele depende criticamente da cláusula `WHERE`. Se omitida, a tabela será esvaziada (embora de forma mais lenta e rastreável que o `TRUNCATE`).

Diferente do `TRUNCATE`, o `DELETE` é uma operação de linha por linha que gera logs de transação para cada exclusão, permitindo o uso de gatilhos (`TRIGGERS`) e a reversão via `ROLLBACK` se estiver dentro de uma transação. Em sistemas com integridade referencial, o `DELETE` pode falhar se houver chaves estrangeiras apontando para o registro, a menos que a regra `ON DELETE CASCADE` esteja configurada.

## Histórico e Evolução

A DML permaneceu relativamente estável desde a criação do SQL, mas os SGBDs modernos adicionaram funcionalidades poderosas para lidar com grandes volumes de dados e concorrência. O surgimento do comando `MERGE` (ou `INSERT ... ON DUPLICATE KEY UPDATE` no MySQL) simplificou a lógica de "upsert", que antes exigia múltiplas verificações no código da aplicação. Além disso, a introdução de cláusulas de retorno de dados (`RETURNING` no PostgreSQL) permitiu que as aplicações obtivessem IDs gerados ou valores calculados imediatamente após a manipulação, reduzindo o número de viagens de ida e volta ao servidor.

## Exemplos Práticos e Casos de Uso

### Cenário: Gerenciamento de um Carrinho de Compras

```sql
-- 1. Inserindo um novo item no carrinho
INSERT INTO ITENS_CARRINHO (id_usuario, id_produto, quantidade)
VALUES (101, 505, 2);

-- 2. Atualizando a quantidade de um item existente
UPDATE ITENS_CARRINHO
SET quantidade = quantidade + 1
WHERE id_usuario = 101 AND id_produto = 505;

-- 3. Removendo um item do carrinho
DELETE FROM ITENS_CARRINHO
WHERE id_usuario = 101 AND id_produto = 505;

-- 4. Esvaziando o carrinho de um usuário específico
DELETE FROM ITENS_CARRINHO
WHERE id_usuario = 101;
```

Este exemplo demonstra as operações básicas de um sistema de e-commerce. Cada comando é direcionado a registros específicos através de chaves primárias ou compostas, garantindo que as ações de um usuário não afetem os dados de outros.

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Execução de um Comando DML

```mermaid
graph TD
    A[Comando DML Enviado] --> B[Verificação de Sintaxe e Permissões]
    B --> C[Início da Transação Implícita ou Explícita]
    C --> D[Localização dos Registros (via WHERE)]
    D --> E{Restrições de Integridade?}
    E -- Falha --> F[Erro e Rollback Automático]
    E -- Sucesso --> G[Aplicação da Mudança no Buffer/Cache]
    G --> H[Escrita no Log de Transação (WAL)]
    H --> I[Confirmação ao Usuário (Commit)]
```

**Explicação**: O fluxo destaca que as operações DML são transacionais. O SGBD primeiro verifica se a mudança viola alguma regra (como uma chave estrangeira ou um valor nulo). Se tudo estiver correto, a mudança é registrada em um log de transação antes de ser confirmada. Isso garante que, mesmo em caso de queda de energia, o banco de dados possa recuperar o estado consistente dos dados.

## Boas Práticas e Padrões de Projeto

*   **Sempre use WHERE**: Nunca execute `UPDATE` ou `DELETE` sem uma cláusula `WHERE` a menos que sua intenção seja realmente alterar a tabela inteira.
*   **Use Transações**: Agrupe comandos relacionados em blocos `BEGIN TRANSACTION` e `COMMIT` para garantir a atomicidade das operações.
*   **Limite o Escopo**: Sempre que possível, use a chave primária na cláusula `WHERE` para garantir que apenas o registro pretendido seja afetado.
*   **Teste com SELECT**: Antes de um `DELETE` ou `UPDATE` complexo, execute um `SELECT *` com o mesmo `WHERE` para validar o conjunto de dados.
*   **Cuidado com Triggers**: Lembre-se que comandos DML podem disparar gatilhos automáticos que realizam outras operações em cascata.
*   **Use Parâmetros**: Nunca concatene valores diretamente no SQL para evitar ataques de SQL Injection. Use "Prepared Statements".

## Comparativos Detalhados

| Comando | Ação | Impacto no Log | Gatilhos (Triggers) |
| :--- | :--- | :--- | :--- |
| **`INSERT`** | Adiciona novas linhas | Alto (por linha) | Dispara `AFTER/BEFORE INSERT` |
| **`UPDATE`** | Modifica linhas existentes | Médio (apenas colunas alteradas) | Dispara `AFTER/BEFORE UPDATE` |
| **`DELETE`** | Remove linhas específicas | Alto (por linha) | Dispara `AFTER/BEFORE DELETE` |
| **`TRUNCATE`** | Esvazia a tabela (DDL) | Mínimo (apenas desalocação) | Geralmente não dispara |

## Ferramentas e Recursos

A maioria das IDEs de banco de dados (como DBeaver ou DataGrip) oferece modos de "Safe Update" que impedem a execução de comandos `UPDATE` ou `DELETE` sem a cláusula `WHERE`. Além disso, ferramentas de ORM (como Hibernate, Sequelize ou Eloquent) abstraem esses comandos em métodos de linguagem de programação, mas entender o SQL gerado por elas é crucial para a depuração e otimização de performance.

## Tópicos Avançados e Pesquisa Futura

O futuro da DML envolve a manipulação de dados em tempo real e em larga escala. Tecnologias como "Stream Processing" permitem que comandos DML sejam aplicados a fluxos contínuos de dados. Outra área de crescimento é a "DML Distribuída", onde o SGBD coordena atualizações em múltiplos nós geográficos, garantindo a consistência global através de protocolos complexos como o "Two-Phase Commit" (2PC). Além disso, a integração de IA permite que o banco de dados sugira otimizações de `UPDATE` ou identifique padrões anômalos de `DELETE` que possam indicar falhas de segurança ou erros de lógica.

## Perguntas Frequentes (FAQ)

*   **P: Posso recuperar dados deletados com o comando `DELETE`?**
    *   R: Apenas se você ainda não tiver executado o `COMMIT` da transação (usando `ROLLBACK`) ou se tiver um backup/log de transações para realizar um "Point-in-Time Recovery". Uma vez confirmado, o dado é removido permanentemente.
*   **P: Qual a diferença entre `INSERT INTO ... VALUES` e `INSERT INTO ... SELECT`?**
    *   R: O primeiro é usado para inserir valores manuais ou vindos de variáveis da aplicação. O segundo é usado para copiar dados de uma tabela existente para outra, sendo muito mais eficiente para migrações de dados.

## Referências Cruzadas

*   `[[06_Linguagem_de_Definicao_de_Dados_DDL_Create_Alter_Drop]]`
*   `[[08_Consultas_Avancadas_com_SELECT_Joins_e_Subqueries]]`
*   `[[13_Transacoes_ACID_Atomicidade_Consistencia_Isolamento_Durabilidade]]`

## Referências

[1] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts*. McGraw-Hill.
[2] Beaulieu, A. (2020). *Learning SQL: Generate, Manipulate, and Retrieve Data*. O'Reilly Media.
[3] Celko, J. (2014). *SQL for Smarties: Advanced SQL Programming*. Morgan Kaufmann.
