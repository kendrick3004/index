# Skill: Database: Views e Views Materializadas - Estratégias de Abstração

## Introdução

Esta skill aborda as **Views (Visões)** e as **Views Materializadas**, ferramentas fundamentais para a abstração de dados e a simplificação de consultas complexas no SQL. Uma View é essencialmente uma "tabela virtual" baseada no resultado de uma consulta `SELECT`. Ela não armazena dados fisicamente, mas atua como uma camada de apresentação que oculta a complexidade das tabelas subjacentes, Joins e agregações. Já as Views Materializadas levam esse conceito um passo adiante, armazenando fisicamente o resultado da consulta para oferecer uma performance de leitura drasticamente superior em cenários de grandes volumes de dados.

Exploraremos a criação e o gerenciamento de Views, os benefícios de segurança e modularidade que elas proporcionam, e as diferenças críticas entre Views simples e materializadas. Discutiremos estratégias de atualização (refresh) para Views Materializadas e como elas são usadas em ambientes de Data Warehousing e Business Intelligence. Este conhecimento é vital para arquitetos de dados e desenvolvedores que precisam projetar sistemas que sejam ao mesmo tempo fáceis de usar e extremamente performáticos.

## Glossário Técnico

*   **View (Visão)**: Uma tabela virtual definida por uma consulta SQL que não armazena dados fisicamente.
*   **View Materializada**: Uma View cujo resultado é armazenado fisicamente em disco, permitindo acesso rápido aos dados pré-calculados.
*   **Abstração de Dados**: O processo de ocultar detalhes complexos da estrutura do banco de dados, apresentando uma interface simplificada aos usuários.
*   **`CREATE VIEW`**: Comando SQL usado para definir uma nova visão.
*   **`REFRESH MATERIALIZED VIEW`**: Comando usado para atualizar os dados armazenados em uma visão materializada.
*   **Segurança de Dados**: O uso de Views para restringir o acesso de usuários a colunas ou linhas específicas de tabelas sensíveis.
*   **Independência Lógica**: A capacidade de alterar a estrutura das tabelas físicas sem afetar as aplicações que consomem os dados através de Views.
*   **Query Rewrite**: Técnica onde o otimizador do SGBD substitui automaticamente uma consulta complexa por uma View Materializada equivalente para melhorar a performance.

## Conceitos Fundamentais

### 1. Views Simples: A Camada de Abstração

As Views são usadas principalmente para simplificar a vida do desenvolvedor e do analista de dados. Em vez de escrever um `SELECT` com cinco Joins e três subconsultas toda vez que precisar de um relatório, você cria uma View que faz esse trabalho e a consulta como se fosse uma tabela comum.

| Benefício | Descrição | Exemplo de Uso |
| :--- | :--- | :--- |
| **Simplificação** | Oculta Joins e lógicas complexas. | `SELECT * FROM v_vendas_detalhadas`. |
| **Segurança** | Restringe acesso a colunas sensíveis. | View que oculta o CPF e salário em uma tabela de funcionários. |
| **Modularidade** | Centraliza a lógica de negócio. | Se a regra de cálculo de imposto mudar, você altera apenas a View. |
| **Independência** | Protege a aplicação de mudanças no esquema. | Renomear uma tabela física e manter o nome antigo na View. |

As Views simples são dinâmicas: toda vez que você as consulta, o SGBD executa a consulta `SELECT` subjacente. Isso garante que os dados estejam sempre atualizados, mas pode ser lento se a consulta for muito pesada.

### 2. Views Materializadas: Performance e Persistência

Diferente das Views simples, as Views Materializadas salvam o resultado da consulta em disco. Elas são ideais para consultas que envolvem agregações massivas (como somas de milhões de registros) que não mudam com frequência ou onde um pequeno atraso na atualização é aceitável.

O principal desafio das Views Materializadas é a **sincronização**. Quando os dados nas tabelas originais mudam, a View Materializada torna-se obsoleta. Existem diferentes estratégias de atualização:
*   **Refresh Completo**: Reconstrói toda a View do zero.
*   **Refresh Incremental**: Atualiza apenas as partes que mudaram (mais eficiente, mas nem todos os SGBDs suportam para todas as consultas).
*   **Refresh on Commit**: Atualiza a View assim que uma transação nas tabelas originais é confirmada (garante dados frescos, mas impacta a performance de escrita).

### 3. Quando Usar Cada Uma?

A escolha entre View simples e materializada depende do equilíbrio entre **frescor dos dados** e **velocidade de resposta**. Se você precisa de dados em tempo real e a consulta é rápida, use uma View simples. Se a consulta leva segundos ou minutos para rodar e você pode tolerar dados de alguns minutos atrás, a View Materializada é a escolha correta.

## Histórico e Evolução

As Views fazem parte do modelo relacional desde sua concepção, servindo como a "Visão Externa" na arquitetura de três níveis (ANSI/SPARC). As Views Materializadas ganharam força nos anos 90 com o crescimento do processamento analítico (OLAP) e do Data Warehousing, onde a necessidade de pré-calcular resultados complexos tornou-se vital para a performance de dashboards. SGBDs modernos como PostgreSQL, Oracle e SQL Server continuam aprimorando suas capacidades de atualização incremental e reescrita automática de consultas para tornar o uso de Views Materializadas quase transparente para o usuário final.

## Exemplos Práticos e Casos de Uso

### Cenário: Dashboard de Vendas Mensais

```sql
-- 1. Criando uma View simples para simplificar Joins
CREATE VIEW v_pedidos_clientes AS
SELECT p.id_pedido, c.nome AS cliente, p.data_pedido, p.valor_total
FROM PEDIDOS p
JOIN CLIENTES c ON p.id_cliente = c.id_cliente;

-- 2. Criando uma View Materializada para performance de relatórios anuais
CREATE MATERIALIZED VIEW mv_resumo_vendas_mensal AS
SELECT EXTRACT(YEAR FROM data_pedido) AS ano,
       EXTRACT(MONTH FROM data_pedido) AS mes,
       SUM(valor_total) AS faturamento_total,
       COUNT(*) AS total_pedidos
FROM PEDIDOS
GROUP BY 1, 2;

-- 3. Atualizando a View Materializada (ex: via script agendado)
REFRESH MATERIALIZED VIEW mv_resumo_vendas_mensal;
```

Neste cenário, a `v_pedidos_clientes` facilita o trabalho diário de busca de pedidos, enquanto a `mv_resumo_vendas_mensal` permite que um dashboard de faturamento histórico carregue instantaneamente, mesmo que a tabela de pedidos tenha milhões de registros.

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Consulta: View vs. View Materializada

```mermaid
graph TD
    A[Usuário consulta View] --> B{É Materializada?}
    B -- Não --> C[SGBD executa SELECT da View nas tabelas originais]
    C --> D[Retorna dados em tempo real]
    B -- Sim --> E[SGBD lê dados pré-calculados do disco]
    E --> F[Retorna dados rapidamente (podem estar obsoletos)]
    G[Mudança nas Tabelas Originais] --> H{Estratégia de Refresh?}
    H -- On Demand --> I[Aguardar comando REFRESH]
    H -- On Commit --> J[Atualizar View Materializada imediatamente]
```

**Explicação**: O diagrama destaca a diferença fundamental no caminho do dado. A View simples (C) sempre volta às fontes originais, garantindo precisão mas consumindo CPU. A View Materializada (E) pula o processamento pesado, lendo um "snapshot" pronto, o que exige uma estratégia de atualização (H) para manter a relevância dos dados.

## Boas Práticas e Padrões de Projeto

*   **Use Views para Segurança**: Crie Views que exponham apenas as colunas necessárias para cada perfil de usuário, protegendo dados sensíveis.
*   **Evite Views sobre Views**: Criar muitas camadas de Views pode tornar a depuração difícil e confundir o otimizador de consultas do SGBD.
*   **Documente a Lógica**: Como as Views centralizam regras de negócio, certifique-se de que o SQL dentro delas esteja bem comentado.
*   **Monitore o Refresh**: Para Views Materializadas, monitore o tempo de atualização para garantir que ele não interfira em outras operações do banco.
*   **Use Nomes Padronizados**: Use prefixos como `v_` para Views e `mv_` para Views Materializadas para facilitar a identificação no dicionário de dados.
*   **Considere a Volatilidade**: Não use Views Materializadas em tabelas que mudam constantemente se você precisar de precisão absoluta em tempo real.

## Comparativos Detalhados

| Característica | View Simples | View Materializada |
| :--- | :--- | :--- |
| **Armazenamento** | Apenas a definição (SQL) | Definição + Dados em disco |
| **Performance de Leitura** | Depende da consulta original | Extremamente rápida |
| **Performance de Escrita** | Sem impacto | Impacto durante o Refresh |
| **Frescor dos Dados** | Sempre em tempo real | Depende da frequência de Refresh |
| **Uso Ideal** | Abstração, Segurança, Joins simples | Agregações pesadas, Data Warehousing |

## Ferramentas e Recursos

A maioria das ferramentas de administração de banco de dados (como DBeaver, pgAdmin ou SQL Server Management Studio) permite visualizar a definição de uma View e gerenciar o agendamento de atualizações para Views Materializadas. Em ambientes de nuvem (como AWS Redshift ou Google BigQuery), o conceito de Views Materializadas é central para a performance de consultas em escala de Petabytes.

## Tópicos Avançados e Pesquisa Futura

O futuro das Views envolve o conceito de **Incremental View Maintenance (IVM)** automático e de alta performance, onde o SGBD consegue atualizar apenas as linhas afetadas de uma View Materializada de forma quase instantânea e com baixo custo. Outra tendência é a integração de Views com sistemas de cache externos (como Redis), criando camadas de abstração que transcendem o banco de dados relacional. Além disso, a "Virtualização de Dados" permite criar Views que unem dados de diferentes bancos de dados (ex: SQL e NoSQL) em uma única interface lógica para o usuário.

## Perguntas Frequentes (FAQ)

*   **P: Posso fazer `INSERT` ou `UPDATE` em uma View?**
    *   R: Em alguns casos, sim (chamadas de Updatable Views). Geralmente, a View deve ser simples, baseada em uma única tabela e conter a chave primária. No entanto, a prática recomendada é usar Views apenas para leitura e realizar alterações diretamente nas tabelas físicas.
*   **P: Uma View Materializada ocupa muito espaço?**
    *   R: Ela ocupa exatamente o espaço necessário para armazenar o resultado da sua consulta. Se a consulta retornar milhões de linhas, o consumo de disco será proporcional.

## Referências Cruzadas

*   **`[[06_Linguagem_de_Definicao_de_Dados_DDL_Create_Alter_Drop]]`**
*   **`[[09_Funcoes_de_Agregacao_e_Agrupamento_GROUP_BY_HAVING]]`**
*   **`[[31_Data_Warehousing_ETL_e_Modelagem_Dimensional_Star_Snowflake]]`**

## Referências

[1] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts*. McGraw-Hill.
[2] Gupta, A., & Mumick, I. S. (1999). *Materialized Views: Techniques, Implementations, and Applications*. MIT Press.
[3] PostgreSQL Documentation. *Materialized Views*.
