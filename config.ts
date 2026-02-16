import { definePluginConfig } from "@hey-api/shared";

import { handler } from "./plugin";
import type { ClientType, ORPCPlugin, Preset, UserConfig } from "./types";

/**
 * Preset configurations
 */
const PRESETS: Record<Preset, { clients: ReadonlyArray<ClientType> }> = {
  client: {
    clients: ["rpcLink", "tanstack"],
  },
  fullstack: {
    clients: ["rpcLink", "tanstack"],
  },
  server: {
    clients: [],
  },
};

/**
 * Resolve user config with preset defaults
 */
export const resolveConfig = (
  userConfig: Partial<UserConfig>,
): ORPCPlugin["Config"]["config"] => {
  const preset = userConfig.preset ?? "fullstack";
  const presetConfig = PRESETS[preset];

  return {
    clients: userConfig.clients ?? presetConfig.clients,
    group: userConfig.group ?? "tags",
    includeInEntry: true,
    mode: userConfig.mode ?? "compact",
    preset,
    transformOperationName: userConfig.transformOperationName,
  };
};

export { PRESETS };

export const defaultConfig: ORPCPlugin["Config"] = {
  config: {
    clients: ["rpcLink", "tanstack"],
    group: "tags",
    includeInEntry: true,
    mode: "compact",
    preset: "fullstack",
  },
  /**
   * oRPC plugin depends on the zod plugin to generate schemas.
   * The zod plugin will be automatically processed if not explicitly defined.
   */
  dependencies: ["@hey-api/typescript", "zod"],
  handler,
  name: "@ahmedrowaihi/openapi-ts-orpc",
  /**
   * Tags this plugin as a transformer since it transforms OpenAPI into oRPC contracts.
   */
  tags: ["transformer"],
};

/**
 * Type helper for `orpc` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
