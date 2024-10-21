# summary

this is a very simple blazor ssr project with default enhanced navigation that has two svelte components.

What makes it different is that both components are server side rendered via the files in js/ and then later hydrated with the files in wwwroot/js.

note: proof of concept. the server side doesnt do any caching or optimization and has a hardcoded path.

# points of interest 

* [sv](sv/) svelte components, runtime loader and build scripts
* [js](js/) generated server side svelte components. these run inside .net via JInt.
* [wwwroot js](wwwroot/js/) generated cliënt side svelte components. these run in the browser
* [layout](Components/Layout/MainLayout.razor) Loader code. this does several things :
 * load the server side scripts and render them to html
 * helper tags for the loader script to help with hydration
 * data-permanent to make blazor enhanced navigation keep the hydrated content during navigation. making them essentially compnents that keep living and maintain their state.
