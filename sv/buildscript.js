import fs from "fs";
import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";

//make sure the directoy exists before stuff gets put into it
if (!fs.existsSync("../wwwroot/js/")) {
    fs.mkdirSync("../wwwroot/js/");
}

const eps = [`./Counter.svelte`, 
    `./Counter2.svelte`,
    "./moduleloader.js"];

esbuild
    .build({
        entryPoints: eps,
        bundle: true,
        outdir: `../wwwroot/js/`,
        mainFields: ["svelte", "browser", "module", "main"],
        conditions: ["svelte", "browser"],
        // logLevel: `info`,
        minify: false, //so the resulting code is easier to understand
        sourcemap: "inline",
        splitting: true,
        write: true,
        format: `esm`,
        plugins: [
            esbuildSvelte({
                compilerOptions: {
                    hydratable: true,
                    generate: "dom",
                },
                preprocess: sveltePreprocess(),
            }),
        ],
    })
    .catch((error, location) => {
        console.warn(`Errors: `, error, location);
        process.exit(1);
    });


    if (!fs.existsSync("../js/")) {
        fs.mkdirSync("../js/");
    }
    esbuild
        .build({
            entryPoints: eps,
            bundle: true,
            outdir: `../js/`,
            mainFields: ["svelte", "browser", "module", "main"],
            conditions: ["svelte", "browser"],
            // logLevel: `info`,
            minify: false, //so the resulting code is easier to understand
            sourcemap: "inline",
            splitting: true,
            write: true,
            format: `esm`,
            plugins: [
                esbuildSvelte({
                    compilerOptions: {
                        generate: "ssr",
                    },
                    preprocess: sveltePreprocess(),
                }),
            ],
        })
        .catch((error, location) => {
            console.warn(`Errors: `, error, location);
            process.exit(1);
        });
    
//use a basic html file to test with

// maybe incorporate svelte-check or tsc too?
// https://github.com/EMH333/esbuild-svelte/blob/main/build.js
