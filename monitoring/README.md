# Observability for Mawaqit Masjid

This folder ships a minimum-viable monitoring stack:

- `prometheus.yml` — scrape config for app + backend + postgres-exporter.
- `grafana/dashboards/service-overview.json` — global error rate, p95
  latency, and a panel per feature (7 feature panels).
- `alert.rules.yml` — baseline 5xx + p95 latency rules and any
  PRD-derived per-feature budget alerts.

The application loads OpenTelemetry instrumentation via
`src/instrumentation.ts` (auto-loaded by Next.js, manually
`register()`-ed for plain Node).

## Run locally

```yaml
# docker-compose.observability.yml (example)
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./alert.rules.yml:/etc/prometheus/alert.rules.yml:ro
    ports: ["9090:9090"]
  grafana:
    image: grafana/grafana
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    ports: ["3001:3000"]
  alertmanager:
    image: prom/alertmanager
    ports: ["9093:9093"]
```

## Required env vars

- `OTEL_EXPORTER_OTLP_ENDPOINT` — collector URL (defaults to
  http://localhost:4318).
- `OTEL_SERVICE_NAME` — overrides the service name; default uses the
  project slug.
