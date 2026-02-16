/**
 * Converts OpenAPI operationId to Zod schema name (PascalCase)
 * Example: AuthController_sendPhoneOtp[1] -> AuthControllerSendPhoneOtp1
 */
export function operationIdToZodSchemaName(operationId: string): string {
  return operationId
    .replace(/\[(\d+)\]$/, "$1") // Remove brackets: [1] -> 1
    .replace(/_(.)/g, (_, char) => char.toUpperCase()); // snake_case to PascalCase
}

/**
 * Converts string to camelCase
 * Example: AuthController_sendPhoneOtp -> authControllerSendPhoneOtp
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[_-](.)/g, (_, char) => char.toUpperCase()) // Handle _ and -
    .replace(/^[A-Z]/, (char) => char.toLowerCase()) // Lowercase first char
    .replace(/[^\w]/g, ""); // Remove non-word chars
}

/**
 * Normalizes operation name for router key
 * Simply converts to camelCase without any prefix stripping
 */
export function normalizeOperationName(operationName: string): string {
  return toCamelCase(operationName);
}
