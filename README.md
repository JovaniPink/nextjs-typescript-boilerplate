# Next.js TypeScript Boilerplate

A small, production-buildable Next.js 16 starter using the App Router, React 19, TypeScript 6, Jest 30, Testing Library, and flat ESLint configuration.

## Requirements

- Node.js 22.22.1 or newer
- npm 10 or newer

CI validates the committed lockfile on Node 22.22.1 and Node 24.

## Quick start

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Edit `app/page.tsx` to change the home page or `app/api/hello/route.ts` to change the example route handler.

## Validation

Run the same complete gate used by CI:

```bash
npm run test-all
```

The gate runs ESLint, TypeScript, Jest, and a production Next.js build. Formatting and dependency checks are available separately:

```bash
npm run format:check
npm audit --audit-level=high
```

## Commands

| Command              | Purpose                                           |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the Turbopack development server            |
| `npm run build`      | Create the production build                       |
| `npm start`          | Serve an existing production build                |
| `npm run lint`       | Run flat-config ESLint with zero warnings allowed |
| `npm run type-check` | Type-check without emitting files                 |
| `npm test`           | Run the Jest suite once                           |
| `npm run test:watch` | Run Jest in watch mode                            |
| `npm run test-all`   | Run the complete CI gate                          |

## Project structure

```text
app/
  api/hello/route.ts  Example route handler
  layout.tsx          Root metadata and document layout
  page.tsx            Home page
test/
  pages/              Testing Library and snapshot coverage
```

This starter uses the [App Router](https://nextjs.org/docs/app). Next.js maps files under `app/` to routes and uses route handlers under `app/**/route.ts` for HTTP endpoints.

## Commit hooks

Husky runs `lint-staged` before commits and TypeScript before pushes. CI remains authoritative; hooks provide earlier local feedback.

## Deployment

Build and run the production server locally with:

```bash
npm run build
npm start
```

The output can be deployed to Vercel or another platform that supports Next.js. See the [official deployment guide](https://nextjs.org/docs/app/getting-started/deploying).

## Contributing

Create a focused branch, update tests and documentation with behavior changes, and run `npm run test-all` before opening a pull request.

## License

Licensed under the MIT License. See [LICENSE.md](LICENSE.md).
