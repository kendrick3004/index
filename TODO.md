# TODO - Correção Modo Manutenção

## ✅ Plano Aprovado

### Fase 1 - Corrigir start.sh (PRIORITÁRIO)
- [ ] 1. Adicionar verificação de porta 5000 antes de iniciar manutenção
- [ ] 2. Usar `pkill` + `kill -9` fallback para garantir que processo morreu
- [ ] 3. Adicionar health check após iniciar manutenção (curl na porta 5000)
- [ ] 4. Usar `python3 -u` para logs unbuffered
- [ ] 5. Garantir caminhos absolutos em todos os `cd`
- [ ] 6. Abortar deploy se manutenção não subir

### Fase 2 - Melhorar maintenance/main.py (SECUNDÁRIO)
- [ ] 7. Adicionar try/except no `app.run()` para logar erros fatais (ex: porta em uso)

### Fase 3 - Atualizar documentação
- [ ] 8. Atualizar TODO.md com status

---

## Diagnóstico do Problema
**Causa raiz**: O `start.sh` inicia o servidor de manutenção mas NÃO VERIFICA se ele realmente subiu na porta 5000. Se a porta estiver ocupada por um processo zumbi, ou se houver erro de importação, o servidor morre silenciosamente mas o script continua como se estivesse tudo OK.
