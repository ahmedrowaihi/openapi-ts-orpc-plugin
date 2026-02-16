import type { DefinePlugin, IR, Plugin } from "@hey-api/shared";

export type TransformOperationNameFn = (
  operation: IR.OperationObject,
) => string;

export type ClientType =
  | "rpcMessagePort"
  | "rpcWebSocket"
  | "openApiLink"
  | "tanstack"
  | "rpcLink";

export type Preset = "fullstack" | "client" | "server";

export type UserConfig = Plugin.Hooks &
  Plugin.UserExports & {
    name: "@ahmedrowaihi/openapi-ts-orpc";
    /**
     * Client types to generate.
     * Specify which client utilities to generate.
     * @default ['rpcLink']
     * @example ['rpcLink', 'tanstack']
     * @example ['openApiLink', 'rpcWebSocket', 'tanstack']
     */
    clients?: ReadonlyArray<ClientType>;
    /**
     * Router grouping strategy.
     * - 'tags' (default): Group by OpenAPI tags (e.g., { authentication: {...}, users: {...} })
     * - 'paths': Group by REST path structure (e.g., { auth: { phone: {...} }, users: {...} })
     * - 'flat': Flat structure with no grouping (e.g., { authPhoneSendOtp: ..., usersById: ... })
     * @default 'tags'
     */
    group?: "paths" | "flat" | "tags";
    /**
     * Contract input structure mode.
     * - 'compact' (default): Flat schema with path + body (POST/PUT/PATCH) or path + query (GET/DELETE), excludes headers
     * - 'detailed': Explicit structure with params, query, headers, and body properties
     * @default 'compact'
     */
    mode?: "detailed" | "compact";
    /**
     * Preset configuration for common use cases.
     * - 'client': Frontend (includes clients + tanstack)
     * - 'server': Backend (no clients, router only)
     * - 'fullstack': Monorepo (router + clients + tanstack)
     *
     * Individual options override preset defaults.
     * @example 'client'
     */
    preset?: Preset;
    /**
     * Custom function to transform operation names in the router.
     * Receives the full operation object and returns the transformed name.
     * Access operation.id, operation.tags, operation.path, operation.method, etc.
     * @example
     * transformOperationName: (operation) => {
     *   const name = operation.id;
     *   const tag = operation.tags?.[0];
     *   // Custom transform logic using any operation property
     *   return name.replace(/Controller_/i, '').toLowerCase();
     * }
     */
    transformOperationName?: TransformOperationNameFn;
  };

export type Config = Plugin.Hooks &
  Plugin.Exports & {
    name: "@ahmedrowaihi/openapi-ts-orpc";
    clients: ReadonlyArray<ClientType>;
    group: "paths" | "flat" | "tags";
    mode: "detailed" | "compact";
    preset?: Preset;
    transformOperationName?: TransformOperationNameFn;
  };

export type ORPCPlugin = DefinePlugin<UserConfig, Config>;

// Module augmentation to register the orpc plugin in the PluginConfigMap
declare module "@hey-api/openapi-ts" {
  export interface PluginConfigMap {
    "@ahmedrowaihi/openapi-ts-orpc": ORPCPlugin["Types"];
  }
}
