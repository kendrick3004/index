# Skill: Database: Triggers e Automação de Eventos no Banco

## Introdução

Esta skill aborda os **Triggers (Gatilhos)**, os mecanismos de automação reativa que permitem que o banco de dados execute ações automaticamente em resposta a eventos específicos, como inserções, atualizações ou exclusões de dados. Um trigger é essencialmente um bloco de código (geralmente uma procedure ou function) que é "disparado" pelo SGBD quando uma condição pré-definida é atendida. Essa funcionalidade permite que IAs e desenvolvedores implementem regras de integridade complexas, auditoria automática e sincronização de dados de forma transparente para a aplicação.

Exploraremos os diferentes tipos de triggers (`BEFORE`, `AFTER`, `INSTEAD OF`), os eventos que os disparam (`INSERT`, `UPDATE`, `DELETE`) e o escopo de execução (`FOR EACH ROW` vs. `FOR EACH STATEMENT`). Discutiremos os benefícios de centralizar a automação no banco e os riscos de criar "lógica oculta" que pode dificultar a depuração e afetar a performance. Este conhecimento é vital para garantir que o banco de dados seja um sistema ativo e inteligente, capaz de manter sua própria consistência e histórico de forma autônoma.

## Glossário Técnico

*   **Trigger (Gatilho)**: Um objeto de banco de dados que executa automaticamente uma ação em resposta a um evento DML.
*   **Evento Disparador**: A operação SQL (`INSERT`, `UPDATE`, `DELETE`) que ativa o trigger.
*   **`BEFORE Trigger`**: Executado antes da operação DML ser aplicada. Ideal para validação ou modificação de dados de entrada.
*   **`AFTER Trigger`**: Executado após a operação DML ser concluída com sucesso. Ideal para auditoria ou atualizações em outras tabelas.
*   **`INSTEAD OF Trigger`**: Usado principalmente em Views para redirecionar operações DML para as tabelas físicas subjacentes.
*   **`FOR EACH ROW`**: O trigger é executado uma vez para cada linha afetada pela operação SQL.
*   **`FOR EACH STATEMENT`**: O trigger é executado apenas uma vez para o comando SQL inteiro, independentemente de quantas linhas foram afetadas.
*   **`OLD` / `NEW`**: Variáveis especiais que permitem acessar os valores do registro antes e depois da alteração, respectivamente.
*   **Auditoria (Audit Trail)**: O processo de registrar quem alterou o quê e quando no banco de dados.

## Conceitos Fundamentais

### 1. Tipos e Momentos de Disparo

A escolha do momento de disparo é crucial para o sucesso da automação:

| Momento | Uso Comum | Vantagem |
| :--- | :--- | :--- |
| **`BEFORE`** | Validação de dados, preenchimento de valores padrão, prevenção de erros. | Pode cancelar a operação antes que ela ocorra, economizando recursos. |
| **`AFTER`** | Auditoria, atualização de agregados em outras tabelas, sincronização. | Garante que a ação só ocorra se a operação principal for bem-sucedida. |
| **`INSTEAD OF`** | Tornar Views complexas editáveis. | Permite que a aplicação trate uma View como se fosse uma tabela real. |

### 2. Variáveis OLD e NEW: O Coração do Trigger

Dentro de um trigger de linha (`FOR EACH ROW`), você tem acesso a duas versões do registro:
*   **`NEW`**: Contém os dados que estão sendo inseridos ou os novos valores de um `UPDATE`.
*   **`OLD`**: Contém os dados que estão sendo deletados ou os valores originais antes de um `UPDATE`.

Comparar `OLD` e `NEW` permite que o trigger identifique exatamente quais colunas mudaram e tome decisões baseadas nessa diferença (ex: disparar um alerta apenas se o "Status" mudar de "Pendente" para "Cancelado").

### 3. Riscos da Automação Excessiva

Embora poderosos, os triggers podem se tornar um pesadelo se não forem bem gerenciados:
*   **Lógica Oculta**: Desenvolvedores podem ficar confusos quando dados mudam "sozinhos" sem que haja código na aplicação fazendo isso.
*   **Performance**: Triggers complexos em tabelas com muitas inserções podem tornar o banco extremamente lento.
*   **Recursividade**: Um trigger na Tabela A que altera a Tabela B, que por sua vez altera a Tabela A, pode criar um loop infinito e derrubar o servidor.
*   **Dificuldade de Depuração**: Erros dentro de triggers podem ser difíceis de rastrear, pois a mensagem de erro pode ser genérica.

## Histórico e Evolução

Os triggers surgiram nos anos 80 como uma forma de garantir a integridade referencial antes que as chaves estrangeiras (`FOREIGN KEY`) fossem padronizadas e implementadas de forma eficiente em todos os SGBDs. Com o tempo, eles evoluíram de simples verificadores para motores de automação complexos. SGBDs modernos agora suportam **Event Triggers** (que reagem a comandos DDL como `CREATE TABLE`) e integração com sistemas de mensageria (como Kafka ou RabbitMQ), permitindo que um trigger no banco notifique serviços externos em tempo real.

## Exemplos Práticos e Casos de Uso

### Cenário: Auditoria Automática de Alterações de Preço

```sql
-- 1. Criando a tabela de log de auditoria
CREATE TABLE AUDITORIA_PRECOS (
    id_produto INT,
    preco_antigo NUMERIC,
    preco_novo NUMERIC,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(50)
);

-- 2. Criando a função do trigger (PostgreSQL)
CREATE OR REPLACE FUNCTION log_alteracao_preco()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se o preço realmente mudou
    IF OLD.preco <> NEW.preco THEN
        INSERT INTO AUDITORIA_PRECOS (id_produto, preco_antigo, preco_novo, usuario)
        VALUES (OLD.id_produto, OLD.preco, NEW.preco, CURRENT_USER);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criando o trigger na tabela de produtos
CREATE TRIGGER trg_auditoria_preco
AFTER UPDATE ON PRODUTOS
FOR EACH ROW
EXECUTE FUNCTION log_alteracao_preco();
```

Neste exemplo, qualquer alteração de preço na tabela `PRODUTOS` será automaticamente registrada na tabela de auditoria, sem que a aplicação precise fazer nada. Isso garante que o histórico de preços seja mantido de forma inviolável e centralizada.

## Análise de Fluxo e Diagramas (em Texto)

### Fluxo de Execução de um Comando DML com Triggers

```mermaid
graph TD
    A[Comando UPDATE Enviado] --> B[Executar BEFORE Triggers]
    B --> C{Validação OK?}
    C -- Não --> D[Abortar Operação e Erro]
    C -- Sim --> E[Aplicar Mudança na Tabela]
    E --> F[Executar AFTER Triggers]
    F --> G[Atualizar Auditoria/Agregados]
    G --> H[Confirmar Transação (Commit)]
```

**Explicação**: O diagrama mostra que o trigger faz parte da transação original. Se o `AFTER Trigger` falhar (ex: erro ao gravar na tabela de auditoria), toda a operação de `UPDATE` será desfeita (`ROLLBACK`), garantindo que o banco nunca fique em um estado inconsistente onde o preço mudou mas o log não foi gerado.

## Boas Práticas e Padrões de Projeto

*   **Use para Integridade e Auditoria**: Triggers são excelentes para garantir que regras de negócio críticas sejam sempre seguidas e para manter logs de segurança.
*   **Mantenha-os Simples**: Evite lógica complexa ou chamadas externas dentro de triggers. Se precisar de algo pesado, use o trigger apenas para colocar uma mensagem em uma fila de processamento.
*   **Documente Exaustivamente**: Como os triggers são "invisíveis" para quem olha apenas o código da aplicação, eles devem estar muito bem documentados no dicionário de dados.
*   **Evite Triggers em Cascata**: Tente limitar a profundidade de triggers que disparam outros triggers para evitar problemas de performance e recursividade.
*   **Prefira Constraints Nativas**: Se você puder resolver um problema com uma `FOREIGN KEY` ou um `CHECK`, não use um trigger. As constraints nativas são mais rápidas e fáceis de entender.
*   **Desabilite Durante Cargas Massivas**: Ao importar milhões de registros, pode ser necessário desabilitar temporariamente os triggers para acelerar o processo (e reabilitá-los depois).

## Comparativos Detalhados

| Característica | Trigger | Stored Procedure | Constraint (CHECK/FK) |
| :--- | :--- | :--- | :--- |
| **Ativação** | Automática (Reativa) | Manual (Chamada pela App) | Automática (Preventiva) |
| **Complexidade** | Alta (Lógica completa) | Alta (Lógica completa) | Baixa (Regras simples) |
| **Visibilidade** | Baixa (Lógica oculta) | Média (Chamada explícita) | Alta (Parte do esquema) |
| **Performance** | Pode ser lenta | Geralmente rápida | Extremamente rápida |

## Ferramentas e Recursos

A maioria das IDEs de banco de dados (como DBeaver, pgAdmin ou SQL Server Management Studio) possui seções específicas para visualizar e gerenciar triggers. É possível habilitar e desabilitar triggers com comandos simples de `ALTER TABLE`, o que é útil durante manutenções. Ferramentas de monitoramento de performance podem ajudar a identificar se um trigger específico está consumindo muito tempo de CPU durante as operações de escrita.

## Tópicos Avançados e Pesquisa Futura

O futuro dos triggers envolve a **Automação Assíncrona**, onde o banco de dados dispara eventos que são processados fora da transação principal (como AWS Lambda ou Azure Functions), permitindo integrações complexas sem afetar a latência do usuário. Outra área de evolução são os **Triggers Baseados em IA**, que podem analisar padrões de dados em tempo real e disparar alertas de fraude ou anomalias automaticamente. Além disso, a pesquisa em "Active Databases" busca tornar os triggers ainda mais poderosos, permitindo que eles gerenciem fluxos de trabalho inteiros de forma autônoma.

## Perguntas Frequentes (FAQ)

*   **P: Um trigger pode impedir um `DELETE`?**
    *   R: Sim, um `BEFORE DELETE` trigger pode lançar uma exceção ou retornar `NULL` (em alguns SGBDs) para cancelar a operação se certas condições não forem atendidas.
*   **P: Triggers funcionam em tabelas temporárias?**
    *   R: Sim, na maioria dos SGBDs você pode criar triggers em tabelas temporárias, embora isso seja menos comum na prática.

## Referências Cruzadas

*   **`[[07_Linguagem_de_Manipulacao_de_Dados_DML_Insert_Update_Delete]]`**
*   **`[[15_Stored_Procedures_e_Functions_Logica_no_Banco_de_Dados]]`**
*   **`[[33_Integracao_de_Dados_CDC_Change_Data_Capture_e_Kafka]]`**

## Referências

[1] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts*. McGraw-Hill.
[2] Melton, J., & Simon, A. R. (2001). *SQL:1999: Understanding Relational Components*. Morgan Kaufmann.
[3] PostgreSQL Documentation. *Triggers*.
