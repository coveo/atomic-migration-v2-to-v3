import { spawnSync } from "node:child_process";
import { Config } from "@stencil/core";
import dotenvPlugin from "rollup-plugin-dotenv";
import html from "rollup-plugin-html";
import replace from "@rollup/plugin-replace";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { dirname } from "node:path";
// https://stenciljs.com/docs/config

export const config: Config = {
  namespace: "test-upgrade",
  globalStyle: "src/style/index.css",
  taskQueue: "async",
  outputTargets: [
    {
      type: "www",
      serviceWorker: null, // disable service workers
      copy: [
        { src: "pages", keepDirStructure: false },
        {
          src: dirname(require.resolve("@coveo/atomic/themes/coveo.css",)),
          dest: "atomic/themes",
          keepDirStructure: false,
        },
      ],
    },
    {
      type: "dist",
    },
    {
      type: "dist-custom-elements",
      customElementsExportBehavior: "bundle",
      minify: false,
      includeGlobalScripts: true,
      generateTypeDeclarations: false,
      externalRuntime: false,
    },
  ],
  plugins: [
    dotenvPlugin(),
    replace({
      "process.env.PLATFORM_URL": `'${process.env.PLATFORM_URL}'`,
      "process.env.ORGANIZATION_ID": `'${process.env.ORGANIZATION_ID}'`,
      "process.env.API_KEY": `'${process.env.API_KEY}'`,
    }),
  ],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
      coveoNpmResolve(), // Replace by `coveoNpmResolve()` to bundle Atomic & Headless and that the CDN is not used.
    ],
    after: [nodePolyfills()],
  },
};


function coveoCdnResolve() {
  return {
    resolveId(source: string, importer: string) {
      if (source === '@coveo/atomic/loader') {
        return { id: 'https://static.cloud.coveo.com/atomic/v3/index.js', external: true };
      }
      if (source.startsWith('@coveo/atomic/themes')) {
        return { id: source.replace('@coveo/atomic/themes', "https://static.cloud.coveo.com/atomic/v3/themes"), external: true };
      }
      if (source === '@coveo/atomic') {
        return { id: 'https://static.cloud.coveo.com/atomic/v3/index.esm.js', external: true };
      }
      if(source === "@coveo/headless") {
        return { id: 'https://static.cloud.coveo.com/headless/v3/headless.esm.js', external: true };
      }
    },
  };
}

function coveoNpmResolve() {
  return {
    resolveId(source: string, importer: string) {
      if (source.startsWith('@coveo')) {
        return nodeResolve(source, importer, ['browser', 'default', 'import']);
      }
    },
  };
}

function nodeResolve(
  source: string,
  importer: string,
  conditions: string[] = []
) {
  return spawnSync(
    process.argv[0],
    [
      ...conditions.flatMap((condition) => ['-C', condition]),
      '-p',
      `require.resolve('${source}')`,
    ],
    { encoding: 'utf-8' }
  ).stdout.trim();
}