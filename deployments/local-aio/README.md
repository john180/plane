# Plane local AIO compose

This compose stack builds the modified source tree and runs all required Plane services plus local middleware.

## Services

- `web`, `admin`, `space`: frontend apps built from this repository.
- `api`, `worker`, `beat-worker`, `migrator`: Django API, Celery worker, Celery beat, migrations.
- `live`: Hocuspocus/Yjs collaboration server.
- `plane-db`: PostgreSQL.
- `plane-redis`: Valkey/Redis.
- `plane-mq`: RabbitMQ.
- `plane-minio`: S3-compatible object storage.
- `proxy`: Caddy reverse proxy.

## Host directories

- `data/postgres`: PostgreSQL data.
- `data/redis`: Valkey appendonly/RDB data.
- `data/rabbitmq`: RabbitMQ durable state.
- `data/minio`: uploaded object data.
- `data/caddy/config` and `data/caddy/data`: Caddy runtime config, certificates, and state.
- `logs/api`, `logs/worker`, `logs/beat-worker`, `logs/migrator`: backend logs.
- `config/*`: mounted service config files.

## Run

```bash
cd deployments/local-aio
cp .env.example .env
# Edit .env: change SECRET_KEY, LIVE_SERVER_SECRET_KEY, passwords, and PUBLIC_ORIGIN/CORS_ALLOWED_ORIGINS.
docker compose up --build -d
```

Then open `http://localhost` unless you changed `LISTEN_HTTP_PORT` or `SITE_ADDRESS`.

## Common operations

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f worker
docker compose down
```

To remove all persisted data, stop the stack and delete `data/` manually.
