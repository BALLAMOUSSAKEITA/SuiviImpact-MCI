# Guide de déploiement — SuiviImpact MIPME

## Prérequis production

- Docker & Docker Compose
- Certificat SSL (Let's Encrypt recommandé)
- Variables d'environnement dans `.env.production` (ne jamais commiter)

## Déploiement

```bash
cp .env.example .env.production
# Éditer SECRET_KEY, DB_PASSWORD, SMTP_*, CORS_ORIGINS

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Services

| Service | Rôle |
|---------|------|
| nginx | Reverse proxy HTTPS |
| frontend | Next.js SSR |
| backend | FastAPI |
| celery-worker | Rappels email tâches en retard |
| celery-beat | Planification quotidienne 8h00 |
| postgres | Base de données |
| redis | Broker Celery |

## Backup PostgreSQL

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U suivi suiviimpact > backup_$(date +%Y%m%d).sql
```

## Rollback

1. Restaurer backup PostgreSQL
2. Redémarrer les services
3. Ancienne app Flask en standby 30 jours
