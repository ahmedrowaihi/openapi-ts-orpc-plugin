import {
  generateClients,
  generateContracts,
  generateRouter,
  generateServer,
  generateTanstack,
} from "./generators";
import { registerExternalSymbols } from "./symbols/external";
import type { ORPCPlugin } from "./types";

/**
 * Main oRPC plugin handler.
 * Orchestrates the generation pipeline.
 */
export const handler: ORPCPlugin["Handler"] = ({ plugin }) => {
  // ============================================================================
  // External Symbols Registration
  // ============================================================================

  registerExternalSymbols(plugin);

  // ============================================================================
  // File Paths Configuration
  // ============================================================================

  const contractFile = `${plugin.name}/contract.gen`;
  const routerFile = `${plugin.name}/router.gen`;
  const clientFile = `${plugin.name}/client.gen`;
  const serverFile = `${plugin.name}/server.gen`;
  const tanstackFile = `${plugin.name}/tanstack.gen`;

  // ============================================================================
  // Contract Generation
  // ============================================================================

  const { routerStructure } = generateContracts({
    contractFile,
    plugin,
  });

  // ============================================================================
  // Router Generation
  // ============================================================================

  if (routerStructure.size > 0) {
    const { routerSymbol } = generateRouter({
      plugin,
      routerFile,
      routerStructure,
    });

    // ==========================================================================
    // Server Generation
    // ==========================================================================

    const preset = plugin.config.preset;
    const shouldGenerateServer = preset === "server" || preset === "fullstack";

    if (shouldGenerateServer) {
      generateServer({
        plugin,
        routerSymbol,
        serverFile,
      });
    }

    // ==========================================================================
    // Client Generation
    // ==========================================================================

    const clientTypes = plugin.config.clients;

    if (clientTypes.length > 0) {
      const context = {
        clientFile,
        contractFile,
        plugin,
        routerFile,
        routerSymbol,
        tanstackFile,
      };

      generateClients({ clientTypes, context });

      if (clientTypes.includes("tanstack")) {
        generateTanstack(context);
      }
    }
  }
};
