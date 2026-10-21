# AREA LRMQ

Web de reformas y catálogo público con selección de productos, solicitudes de presupuesto y asistente.

## Desarrollo

Requisitos: Node.js 24 y pnpm 10.34.5, según package.json.

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Configurar los upstreams y secretos exclusivamente en el entorno del servidor. No subir .env ni usar VITE_* para secretos.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

src contiene la interfaz y pruebas; api y server, los proxies y SEO; n8n, los contratos sanitizados y lógica del presupuesto; openspec, las especificaciones y tareas. Las herramientas de OpenCode y sus habilidades se conservan.

Leer [AGENTS.md](AGENTS.md) y la [política del repositorio](docs/repository-policy.md) antes de cambiar el proyecto. La instalación de Vercel queda fijada a la versión de pnpm declarada.
