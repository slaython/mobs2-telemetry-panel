## Painel de Telemetria MOBS2

Aplicação full stack (NestJS + Vue 3) para monitorar veículos no mapa em tempo real.

Funcionalidades:
- Mapa com posição atual de cada veículo.
- Velocidade, combustível e timestamp da última atualização.
- Histórico de rota desenhado como polyline.
- Destaque de veículo ao clicar na lista.
- Simulação de telemetria contínua a cada 5s.
- Atualização em tempo real via WebSocket.
- Abastecer veículo manualmente (redefine combustível e o veículo volta a se mover).
- Correção de rota usando Google Roads API (`snapToRoads`).

Toda a stack sobe em Docker via `docker compose up`.

## Backend (`/backend`)
- NestJS
- TypeORM
- PostgreSQL
- WebSocket (Socket.IO)
- Simulação de telemetria (cada veículo recebe coordenadas novas, velocidade e consumo de combustível)
- Endpoint REST:
  - `GET /vehicles` → lista veículos com último estado
  - `GET /vehicles/:plate/history` → histórico bruto
  - `GET /vehicles/:plate/history/snapped` → histórico corrigido na via (Google Roads)
  - `POST /vehicles/:plate/refuel` → abastece (combustível = 100%, volta a andar)
- Testes unitários com `jest`

## Frontend (`/frontend`)
- Vue 3 (Composition API + TypeScript)
- Vite
- Google Maps JS API
- Painel com:
  - lista de veículos com botão "Abastecer"
  - mapa com marcadores e polylines
- Atualização em tempo real por WebSocket
- Testes unitários (Vitest)

## Banco
- PostgreSQL 15 (Docker)

## Requisitos

- Docker e Docker Compose instalados

Você NÃO precisa ter Node, npm etc na máquina para rodar o projeto.

## Variáveis de Ambiente

Existem **duas cópias da chave do Google Maps**:
1. FRONTEND usa a chave para renderizar o mapa. (frontend/index.html)
2. BACKEND usa a MESMA chave para chamar a Roads API (`snapToRoads`) e alinhar o histórico nas ruas. (/.env)
3. ⚠️ IMPORTANTE:
No Google Cloud Console, libere essa chave para uso em localhost e habilite:
- Maps JavaScript API
- Roads API
Sem a Roads API, o histórico “snapado” não funciona.

> Você pode usar uma única key e repetir nos dois lugares.

### 1. Arquivo `.env` do backend

Crie `/.env` com:

```env
# Backend
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_USER=mobs2
DB_PASS=mobs2
DB_NAME=mobs2
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
GOOGLE_MAPS_API_KEY=sua_key
```

## Subindo o projeto

1. Depois de criar os .env:
2. Rode:
docker compose up --build

Isso vai:
- subir o Postgres
- rodar as migrations/entidades via TypeORM (sobe tabelas Vehicle e Telemetry)
- iniciar o backend (NestJS) em `http://localhost:3000`
- iniciar o frontend (Vite dev server) em `http://localhost:5173`

3. Acesse o painel em:
`http://localhost:5173`


## Fluxo esperado na tela

1. Você verá uma barra superior com:
- toggle “Mostrar histórico”

2. Abaixo, uma lista de veículos:
- Placa (ex: ABC-1234)
- Velocidade atual
- Combustível atual
- Timestamp da última leitura
- Botão Abastecer

3. Ao clicar em um veículo da lista:
- ele fica destacado
- o mapa centraliza nele
- o marcador dele fica vermelho
- a rota histórica (corrigida pela Roads API) aparece em azul

4. Se o combustível chega a 0%, o “carro” para de se mover.
- Clicando em Abastecer, o backend seta combustível = 100% e ele volta a andar.

5. A cada ~5 segundos:
- o backend gera nova telemetria
- salva no Postgres
- emite via WebSocket
- o frontend atualiza o marcador e a lista em tempo real

## Endpoints úteis (debug)

1. `GET http://localhost:3000/vehicles`
Lista veículos com última posição/telemetria.

2. `GET http://localhost:3000/vehicles/ABC-1234/history`
Histórico bruto (sem snap).

3. `GET http://localhost:3000/vehicles/ABC-1234/history/snapped`
Histórico já corrigido para as ruas (usa Roads API).

4. `POST http://localhost:3000/vehicles/ABC-1234/refuel`
Abastece o veículo.

## WebSocket:

`ws://localhost:3000/socket.io`
Evento broadcast com nova telemetria para todos os veículos.

## Rodando testes unitários

Você também pode rodar os testes fora do Docker se quiser.

1. Backend (NestJS)

Dentro da pasta `backend/`:
- npm install
- npm run test

2. Frontend (Vue)

Dentro da pasta `frontend/`:
- npm install
- npm run test

## Observações finais

A Google Roads API precisa estar habilitada no Google Cloud.
Se não estiver, o app ainda roda — mas o histórico será bruto (sem alinhar na rua).

A chave do Google Maps deve permitir:
- uso em http://localhost:5173 (Maps JavaScript API)
- requisições server-to-server (para roads.googleapis.com)
