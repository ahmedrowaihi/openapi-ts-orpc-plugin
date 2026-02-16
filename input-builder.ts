import { $ } from "@hey-api/openapi-ts";
import type { IR } from "@hey-api/shared";

/**
 * Builds the input schema expression for an oRPC contract
 * Supports two modes:
 * - compact: Flat schema (body + path for POST, path + query for GET), excludes headers
 * - detailed: Full schema with { params, query, headers, body }
 *
 * Note: Return type uses `any` because the TypeScript DSL returns incompatible types
 * (AttrTsDsl, CallTsDsl, ExprTsDsl) that don't share a common interface with all methods.
 */
export function buildInputSchema(options: {
  inputSchema: string;
  mode: "detailed" | "compact";
  operation: IR.OperationObject;
}) {
  const { inputSchema, mode, operation } = options;

  if (mode === "detailed") {
    // Detailed mode: pass full schema with { params, query, headers, body }
    return $(inputSchema);
  }

  // Compact mode: merge only relevant parts (exclude headers)
  const hasRequiredParam = (
    params: Record<string, IR.ParameterObject> | undefined,
  ): boolean => {
    if (!params) return false;
    return Object.values(params).some((p) => p.required);
  };

  const isGetOrDelete =
    operation.method === "get" || operation.method === "delete";

  let result: any;

  // For POST/PUT/PATCH: include body + path params
  // For GET/DELETE: include path params + query params
  if (operation.body && !isGetOrDelete) {
    const bodyExpr = $(inputSchema).attr("shape").attr("body");
    const expr = operation.body.required
      ? bodyExpr
      : bodyExpr.attr("unwrap").call();
    result = result ? result.attr("merge").call(expr) : expr;
  }

  if (
    operation.parameters?.path &&
    Object.keys(operation.parameters.path).length > 0
  ) {
    const pathExpr = $(inputSchema).attr("shape").attr("path");
    const expr = hasRequiredParam(operation.parameters.path)
      ? pathExpr
      : pathExpr.attr("unwrap").call();
    result = result ? result.attr("merge").call(expr) : expr;
  }

  if (
    operation.parameters?.query &&
    Object.keys(operation.parameters.query).length > 0 &&
    isGetOrDelete
  ) {
    const queryExpr = $(inputSchema).attr("shape").attr("query");
    const expr = hasRequiredParam(operation.parameters.query)
      ? queryExpr
      : queryExpr.attr("unwrap").call();
    result = result ? result.attr("merge").call(expr) : expr;
  }

  return result;
}
