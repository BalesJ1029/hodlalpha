/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONVEX_URL: string;
  readonly ALERTS_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
