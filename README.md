# ChocaFácil — aplicativo Android offline

Aplicativo mobile simples para cadastrar galinhas e acompanhar chocagens. O projeto foi convertido do protótipo React/Vite enviado para um aplicativo **React Native + Expo + TypeScript**, sem backend remoto e sem necessidade de internet para funcionar.

## O que já está implementado

- Cadastro de galinha com nome e raça obrigatórios.
- Raças: **Comum, GSB, Mestiça, Índia e Outra raça**.
- Campo de raça personalizada quando "Outra raça" é selecionada.
- Foto opcional pela câmera ou galeria.
- Nome do pai e da mãe opcionais.
- Edição e exclusão de galinhas.
- Banco de dados SQLite local e persistente.
- Sem dados falsos/seed: a primeira abertura começa vazia.
- Início de chocagem com quantidade de ovos e data de início.
- Cálculo automático da previsão em **21 dias**.
- Status de chocagem, contagem regressiva e barra de progresso.
- Notificações locais agendadas a cada 2 horas no dia previsto (00:00, 02:00, ..., 22:00; horários que já passaram são ignorados).
- Encerramento da chocagem com quantidade opcional de pintinhos nascidos.
- Cancelamento do modo de chocagem sem registrar nascimento.
- Cancelamento automático das notificações ao encerrar/cancelar/excluir.
- Histórico simples das chocagens finalizadas.
- Fotos copiadas para o diretório privado de documentos do aplicativo.
- Funcionamento offline após a instalação.

## Arquitetura

Não existe Spring Boot, API HTTP, PostgreSQL, Firebase ou servidor. Para um aplicativo individual e offline, isso adicionaria complexidade sem benefício e impediria o requisito de independência de internet.

O "backend" deste projeto é local e está separado em camadas:

- `src/database/` — abertura do SQLite e schema.
- `src/repositories/` — CRUD e consultas SQL parametrizadas.
- `src/services/` — regras de negócio, fotos e notificações.
- `src/screens/` — telas React Native.
- `src/components/` — componentes visuais reutilizáveis.
- `src/utils/` — datas, cálculo dos 21 dias e labels.

## Banco de dados

Arquivo local: `chocafacil.db`.

Tabelas:

1. `chickens`
2. `hatchings`
3. `scheduled_notifications`

O SQLite usa `PRAGMA foreign_keys = ON` e `WAL`. Existe um índice parcial que impede uma mesma galinha de possuir duas chocagens ativas ao mesmo tempo.

## Instalação para desenvolvimento

Requisitos:

- Node.js LTS
- npm
- Android Studio/Emulador ou aparelho Android

Dentro da pasta do projeto:

```bash
npm install
npx expo start
```

Para validar dependências:

```bash
npx expo-doctor
```

## Gerar APK instalável

O arquivo `eas.json` já possui o perfil `preview` configurado para gerar APK.

Instale/use o EAS CLI e autentique-se:

```bash
npm install --global eas-cli
eas login
```

Depois:

```bash
eas build --platform android --profile preview
```

O perfil de produção gera o formato adequado à Play Store:

```bash
eas build --platform android --profile production
```

## Notificações Android

O projeto configura:

- canal Android de alta importância `hatching-alerts`;
- permissão `POST_NOTIFICATIONS`;
- permissão `SCHEDULE_EXACT_ALARM` para melhorar a precisão dos horários em Android compatível;
- agendamento local, sem push, token ou servidor.

O usuário ainda precisa aceitar as notificações quando o Android solicitar. Em alguns aparelhos, configurações de bateria/alarmes do fabricante podem interferir na precisão de alarmes em segundo plano.

## Fotos

A foto é opcional. Quando escolhida, é copiada para uma pasta privada do app (`chocafacil-chickens`) para não depender do arquivo temporário retornado pela câmera/galeria.

## Observação sobre o ZIP original

O ZIP enviado era um protótipo React + Vite para navegador e usava `localStorage` e dados demonstrativos. Esta pasta é a versão Android real, usando componentes React Native e armazenamento local nativo.
