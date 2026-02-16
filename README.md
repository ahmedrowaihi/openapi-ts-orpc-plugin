# @ahmedrowaihi/openapi-ts-orpc

**Status: Beta** - Production-ready, API may evolve

Generates type-safe [oRPC](https://orpc.unnoq.com/) contracts, routers, and clients from OpenAPI specifications.

## Installation

```bash
npm install @ahmedrowaihi/openapi-ts-orpc @hey-api/openapi-ts
npm install @orpc/contract @orpc/server @orpc/client @orpc/tanstack-query zod
```

## What it does

Transforms your OpenAPI spec into:

- **Contracts** - Type-safe oRPC contracts with input/output schemas
- **Router** - Organized router structure (by tags, paths, or flat)
- **Server** - Implementation skeleton with `implement()` (server/fullstack presets)
- **Clients** - Ready-to-use client creation functions
- **TanStack Query utilities** - React Query integration (optional)

## Basic Usage

**Simplest (Default - Fullstack):**

```typescript
import { defineConfig } from '@hey-api/openapi-ts';
import { defineConfig as defineORPCConfig } from '@ahmedrowaihi/openapi-ts-orpc';

export default defineConfig({
  input: 'https://api.example.com/openapi.json',
  output: { path: './generated' },
  plugins: [
    '@hey-api/typescript',
    'zod',
    defineORPCConfig(), // Generates everything (fullstack preset by default)
  ],
});
```

**Backend Only:**

```typescript
import { defineConfig } from '@hey-api/openapi-ts';
import { defineConfig as defineORPCConfig } from '@ahmedrowaihi/openapi-ts-orpc';

export default defineConfig({
  input: 'https://api.example.com/openapi.json',
  output: { path: './generated' },
  plugins: [
    '@hey-api/typescript',
    'zod',
    defineORPCConfig({ preset: 'server' }), // Backend only
  ],
});
```

**Frontend Only:**

```typescript
import { defineConfig } from '@hey-api/openapi-ts';
import { defineConfig as defineORPCConfig } from '@ahmedrowaihi/openapi-ts-orpc';

export default defineConfig({
  input: 'https://api.example.com/openapi.json',
  output: { path: './generated' },
  plugins: [
    '@hey-api/typescript',
    'zod',
    defineORPCConfig({ preset: 'client' }), // Frontend only
  ],
});
```

## Presets

Use presets for common scenarios. **Default: `fullstack`**

### `preset: 'fullstack'` (Default - Monorepo/Complete)

**Generates everything you need for both frontend and backend:**

- ✅ Contracts + Router (always included)
- ✅ Server implementation skeleton (`server.gen.ts`)
- ✅ RPC clients (`rpcLink`)
- ✅ TanStack Query utilities (`tanstack`)

**Files:** `contract.gen.ts`, `router.gen.ts`, `server.gen.ts`, `client.gen.ts`, `tanstack.gen.ts`

### `preset: 'client'` (Frontend Only)

**Optimized for frontend applications:**

- ✅ Contracts + Router (for types)
- ✅ RPC clients (`rpcLink`)
- ✅ TanStack Query utilities (`tanstack`)
- ❌ No server implementation skeleton

**Files:** `contract.gen.ts`, `router.gen.ts`, `client.gen.ts`, `tanstack.gen.ts`

### `preset: 'server'` (Backend Only)

**Optimized for backend services:**

- ✅ Contracts + Router
- ✅ Server implementation skeleton (`server.gen.ts`)
- ❌ No client generation

**Files:** `contract.gen.ts`, `router.gen.ts`, `server.gen.ts`

## Advanced Configuration

Override preset defaults or configure manually:

```typescript
import { defineConfig as defineORPCConfig } from '@ahmedrowaihi/openapi-ts-orpc';

defineORPCConfig({
  preset: 'client', // Start with client preset

  // Override preset defaults
  clients: ['openApiLink'], // Use REST client instead

  // Additional options
  group: 'tags', // 'tags' | 'paths' | 'flat'
  mode: 'compact', // 'compact' | 'detailed'

  // Transform operation names
  transformOperationName: (operation) => {
    return operation.id.replace(/Controller_/i, '');
  }
})
```

### Manual Configuration (without preset)

```typescript
import { defineConfig as defineORPCConfig } from '@ahmedrowaihi/openapi-ts-orpc';

defineORPCConfig({
  clients: ['rpcLink', 'tanstack'], // Which clients to generate
  group: 'tags',
  mode: 'compact',
})
```

### Client Types

- **`rpcLink`** - HTTP/Fetch client (native RPC protocol)
- **`rpcWebSocket`** - WebSocket client (native RPC protocol)
- **`rpcMessagePort`** - MessagePort client (native RPC protocol)
- **`openApiLink`** - REST client (OpenAPI/REST protocol)
- **`tanstack`** - TanStack Query utilities

### Grouping Strategies

**`tags`** (default) - Group by OpenAPI tags:

```typescript
router.authentication.sendOtp();
router.users.getById();
```

**`paths`** - Group by URL path structure:

```typescript
router.auth.phone.sendOtp();
router.users.getById();
```

**`flat`** - No grouping:

```typescript
router.authSendOtp();
router.usersGetById();
```

### Input Modes

**`compact`** (default) - Flat input schema:

```typescript
// POST/PUT/PATCH: body + path params
{ username: string, id: number }

// GET/DELETE: query + path params
{ search: string, id: number }
```

**`detailed`** - Structured input:

```typescript
{
  path: { id: number },
  query: { search: string },
  headers: { authorization: string },
  body: { username: string }
}
```

## Generated Files

```
generated/orpc/
├── contract.gen.ts   # oRPC contracts
├── router.gen.ts     # Router structure
├── server.gen.ts     # Server implementation skeleton (server/fullstack)
├── client.gen.ts     # Client functions (client/fullstack)
└── tanstack.gen.ts   # TanStack utilities (client/fullstack)
```

## Usage Examples

### Client (Frontend)

```typescript
import { createRpcLinkClient } from './generated/orpc/client.gen';
import { router } from './generated/orpc/router.gen';

// Create client
const client = createRpcLinkClient({
  url: 'https://api.example.com/rpc',
});

// Call endpoints
const user = await client.users.getById({ id: 123 });

// With TanStack Query
import { createOrpcUtils } from './generated/orpc/tanstack.gen';

const utils = createOrpcUtils(client);
const { data } = utils.users.getById.useQuery({ id: 123 });
```

### Server (Backend)

```typescript
import { os } from './generated/orpc/server.gen';

// Implement handlers with full type safety
export const getUserById = os.users.getById.handler(async ({ input, context }) => {
  // input is fully typed based on your OpenAPI spec
  const { id } = input;

  // Return type is validated against your OpenAPI response schema
  return {
    id,
    username: 'john_doe',
    email: 'john@example.com',
  };
});

export const sendPhoneOtp = os.authentication.sendPhoneOtp.handler(async ({ input }) => {
  const { phoneNumber } = input;

  // Implementation here...
  return { success: true };
});
```

## Requirements

The oRPC plugin requires:

- `@hey-api/typescript` plugin
- `zod` plugin

These are automatically included as dependencies.
