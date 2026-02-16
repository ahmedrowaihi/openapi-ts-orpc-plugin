import type { Symbol as CodegenSymbol } from "@hey-api/codegen-core";
import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

import type { TransformOperationNameFn } from "./types";
import { normalizeOperationName, toCamelCase } from "./utils";

export type RouterNode = {
  contractName: string;
  contractSymbol: CodegenSymbol;
  operation: IR.OperationObject;
  operationName: string;
};

export type GroupMode = "paths" | "flat" | "tags";

/**
 * Determines the grouping key for an operation based on the group mode
 */
export function getGroupKey(
  operation: IR.OperationObject,
  mode: GroupMode,
): string {
  if (mode === "paths") {
    // Group by REST path structure: /auth/phone/send-otp -> auth.phone
    const pathSegments = (operation.path as string)
      .split("/")
      .filter((s) => s && !s.startsWith("{"));
    return pathSegments.slice(0, -1).join(".") || "root";
  }

  if (mode === "flat") {
    // Flat structure: use 'flat' as single group
    return "flat";
  }

  // Group by tags (default)
  return operation.tags?.[0] || "default";
}

/**
 * Builds the router object based on the group mode
 */
export function buildRouterObject(
  routerStructure: Map<string, RouterNode[]>,
  groupMode: GroupMode,
  transformOperationName?: TransformOperationNameFn,
): ReturnType<(typeof $)["object"]> {
  let routerObj = $.object().pretty();

  if (groupMode === "flat") {
    // Flat structure: all contracts at root level
    const nodes = routerStructure.get("flat") || [];
    for (const node of nodes) {
      const key = transformOperationName
        ? transformOperationName(node.operation)
        : normalizeOperationName(node.operationName);
      routerObj = routerObj.prop(key, node.contractSymbol);
    }
  } else if (groupMode === "paths") {
    // Path-based grouping with simplified namespace keys
    for (const [groupKey, nodes] of routerStructure.entries()) {
      let groupObj = $.object().pretty();

      for (const node of nodes) {
        const key = transformOperationName
          ? transformOperationName(node.operation)
          : normalizeOperationName(node.operationName);
        groupObj = groupObj.prop(key, node.contractSymbol);
      }

      // Convert path segments to camelCase namespace key
      const namespaceKey = toCamelCase(groupKey.replace(/\./g, "_"));
      routerObj = routerObj.prop(namespaceKey, groupObj);
    }
  } else {
    // Tags mode (default)
    for (const [namespace, nodes] of routerStructure.entries()) {
      let namespaceObj = $.object().pretty();

      for (const node of nodes) {
        const key = transformOperationName
          ? transformOperationName(node.operation)
          : normalizeOperationName(node.operationName);
        namespaceObj = namespaceObj.prop(key, node.contractSymbol);
      }

      const namespaceKey = toCamelCase(namespace);
      routerObj = routerObj.prop(namespaceKey, namespaceObj);
    }
  }

  return routerObj;
}
