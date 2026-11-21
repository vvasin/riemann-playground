import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

const INCLUDE_TAG = /<html-include src="([^"]+)"><\/html-include>/g;

export function htmlInclude(): Plugin {
  let root = process.cwd();

  return {
    name: "html-include",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(INCLUDE_TAG, (_, src: string) => readFileSync(resolve(root, src), "utf8")),
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith(".html")) server.ws.send({ type: "full-reload" });
    },
  };
}
