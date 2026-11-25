## 1.0-r.2（2026-11-25）

- 改为在原版世界更新重置开关后执行禁蔓延，省去地表与地下的逐瓦片写入。
- 保留原作者 jopojelly 和原移植者 Mantovani 的署名。柠版泰拉启动器维护本次移动版优化。

# Novidades

## 1.0 - 2026-10-04

**Release estável atual.**

- Bloqueio de propagação aplicado diretamente nos caminhos de atualização de tiles usados pelo Bunny Loader.
- Teste real de propagação validado: com a proteção ativa, nenhum bloco foi convertido; com o spread liberado, a propagação voltou a acontecer normalmente.
- `/spread` preservado para alternar o estado por mundo.
- Persistência por mundo e sincronização multiplayer preservadas.
- Aviso ao entrar em um mundo com propagação liberada preservado.

## 0.1 - 2026-10-04

**Primeira build do port para Bunny Loader.**

- Propagação natural de Corruption, Crimson e Hallow desativada por padrão.
- `/spread` implementado para liberar ou bloquear a propagação.
- Estado salvo separadamente por mundo.
- Sincronização multiplayer adicionada.
- Aviso original ao entrar em um mundo com propagação habilitada.
