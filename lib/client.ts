import { treaty } from "@elysiajs/eden";
import type { App } from "../src/app/api/[[...slugs]]/route";

// .api to enter /api prefix
export const client =
  // process is defined on server side and build time
  typeof process !== "undefined"
    ? treaty<App>("http://localhost:3000").api
    : treaty<App>("localhost:3000").api;
