# summary

this is a very simple blazor ssr project with default enhanced navigation that has two svelte components.

What makes it different is that both components are server side rendered via the files in js/ and then later hydrated with the files in wwwroot/js.

note: proof of concept. the server side doesnt do any caching or optimization and has a hardcoded path.

# points of interest 

* [sv](sv/) svelte components, runtime loader and build scripts
* [js](js/) generated server side svelte components. these run inside .net via JInt.
* [wwwroot js](wwwroot/js/) generated cliënt side svelte components. these run in the browser 
