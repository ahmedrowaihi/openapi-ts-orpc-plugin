import { defineConfig as defineORPCConfig } from "@ahmedrowaihi/openapi-ts-orpc";
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input:
    "https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml",
  logs: {
    path: "./logs",
  },
  output: {
    path: "./src/generated",
    postProcess: ["oxfmt", "eslint"],
  },
  plugins: [
    "@hey-api/typescript",
    "zod",
    defineORPCConfig({
      // Generates server + client + tanstack
      clients: ["openApiLink", "tanstack", "rpcLink"],
      group: "tags",
      mode: "compact",
      preset: "fullstack",
    }),
  ],
});
