# Verificação realizada

Antes da entrega foram feitos os seguintes testes estáticos/smoke tests no código-fonte:

- JSON de `package.json`, `app.json`, `eas.json` e `tsconfig.json` validado.
- Camada local de backend (`database`, `repositories`, `services`, `types`, `utils`) verificada pelo TypeScript com stubs das bibliotecas nativas.
- Todas as telas/TSX passaram em verificação sintática TypeScript.
- Funções de data testadas: `21/08/2026 + 21 dias = 11/09/2026`.
- Geração de horários testada: 12 slots no dia previsto, de 00:00 a 22:00, de 2 em 2 horas.
- Schema SQLite testado: impede duas chocagens ACTIVE para a mesma galinha.
- Cascade SQLite testado: excluir galinha remove chocagens e registros de notificações vinculados.
- Busca por referências de rede confirmou que o código de runtime não usa HTTP, Axios, Firebase, Spring ou PostgreSQL.
- Nenhum seed/dado falso é inserido no banco.

## Limitação do ambiente de entrega

As dependências npm não foram instaladas neste ambiente, portanto não foi possível executar `expo-doctor`, compilar o APK ou abrir um emulador Android aqui. O projeto foi preparado para Expo SDK 57 e contém `eas.json` para geração de APK. Após `npm install`, recomenda-se executar `npx expo-doctor` antes do build final.
