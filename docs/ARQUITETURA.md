# Arquitetura técnica — ChocaFácil

## Objetivo

Aplicativo Android offline para gerenciamento simples de galinhas e chocagens.

## Fluxos

### Cadastro

Home → Cadastrar Galinha → nome + raça → foto/pai/mãe opcionais → SQLite → Home.

### Chocagem

Detalhe → Iniciar Chocagem → ovos + data → `expected_date = start_date + 21 dias` → cria hatching ACTIVE → agenda notificações locais → detalhe em estado CHOCANDO.

### Nascimento

Detalhe → Encerrar e registrar pintinhos → quantidade opcional → hatching COMPLETED → cancela notificações pendentes → histórico → galinha NORMAL.

### Cancelamento

Detalhe → Cancelar modo de chocagem → hatching CANCELLED → cancela notificações → galinha NORMAL.

## Integridade de dados

- `name` não pode ser vazio.
- `breed` aceita somente valores pré-definidos.
- `custom_breed` é obrigatório quando `breed = OUTRA`.
- `eggs > 0`.
- `chicks >= 0` quando informado.
- `FOREIGN KEY ... ON DELETE CASCADE` remove chocagens/notificações vinculadas ao excluir a galinha.
- índice único parcial impede mais de uma chocagem ACTIVE por galinha.
- todas as entradas de usuário em SQL são passadas como parâmetros, não concatenadas em queries.

## Notificações

No momento em que a chocagem é iniciada, o app calcula o 21º dia e agenda alarmes locais para:

`00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00`.

Se algum horário já passou no momento do agendamento, ele é ignorado.

Cada identificador retornado pelo sistema Android é gravado em `scheduled_notifications`, permitindo cancelar exatamente os alarmes daquela chocagem.

## Offline

Nenhuma operação de negócio depende de rede. EAS/Expo é necessário apenas para desenvolvimento/build caso seja usado o serviço de build em nuvem; depois de instalado, cadastro, fotos, banco, cálculos e notificações são locais.
