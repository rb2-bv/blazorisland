import {
  count,
  create_ssr_component,
  escape,
  onMount,
  set_store_value,
  subscribe
} from "./chunk-BYBW4AU7.js";

// Counter.svelte
var css = {
  code: "button.svelte-e0u4p{background:lightblue\n	}",
  map: '{"version":3,"file":"Counter.svelte","sources":["Counter.svelte"],"sourcesContent":["<script>\\n    import { onMount } from \\"svelte\\";\\n\\timport { count } from \\"./store\\"\\n\\tlet text = \\"\\";\\n\\t/** @param {MouseEvent} event */\\n\\tfunction handleClick(event) {\\n\\t\\t$count += 1;\\n\\t}\\n\\n\\tonMount(() => {\\n\\t\\ttext = \\"Hydrated\\";\\n\\t\\tsetTimeout(() => {\\n\\t\\t\\ttext += \\" and timer!\\"\\n\\t\\t}, 2000);\\n\\t})\\n<\/script>\\n\\n<button on:click={handleClick}>\\n\\tcount: {$count}\\n\\n\\t- {text}\\n</button>\\n\\n<style>\\n\\tbutton {\\n\\t\\tbackground: lightblue\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAwBC,mBAAO,CACN,UAAU,CAAE,SAAS;AACvB,CAAC"}'
};
var Counter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $count, $$unsubscribe_count;
  $$unsubscribe_count = subscribe(count, (value) => $count = value);
  let text = "";
  function handleClick(event) {
    set_store_value(count, $count += 1, $count);
  }
  onMount(() => {
    text = "Hydrated";
    setTimeout(
      () => {
        text += " and timer!";
      },
      2e3
    );
  });
  $$result.css.add(css);
  $$unsubscribe_count();
  return `<button class="svelte-e0u4p">count: ${escape($count)}

	- ${escape(text)} </button>`;
});
var Counter_default = Counter;
export {
  Counter_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3YvQ291bnRlci5zdmVsdGUiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcblx0aW1wb3J0IHsgY291bnQgfSBmcm9tIFwiLi9zdG9yZVwiXG5cdGxldCB0ZXh0ID0gXCJcIjtcblx0LyoqIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnQgKi9cblx0ZnVuY3Rpb24gaGFuZGxlQ2xpY2soZXZlbnQpIHtcblx0XHQkY291bnQgKz0gMTtcblx0fVxuXG5cdG9uTW91bnQoKCkgPT4ge1xuXHRcdHRleHQgPSBcIkh5ZHJhdGVkXCI7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0ZXh0ICs9IFwiIGFuZCB0aW1lciFcIlxuXHRcdH0sIDIwMDApO1xuXHR9KVxuPC9zY3JpcHQ+XG5cbjxidXR0b24gb246Y2xpY2s9e2hhbmRsZUNsaWNrfT5cblx0Y291bnQ6IHskY291bnR9XG5cblx0LSB7dGV4dH1cbjwvYnV0dG9uPlxuXG48c3R5bGU+XG5cdGJ1dHRvbiB7XG5cdFx0YmFja2dyb3VuZDogbGlnaHRibHVlXG5cdH1cbjwvc3R5bGU+XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7OztNQUdLLE9BQU87V0FFRixZQUFZLE9BQUs7MkJBQ3pCLFVBQVUsR0FBQyxNQUFBOztBQUdaLFVBQU8sTUFBQTtBQUNOLFdBQU87QUFDUDs7QUFDQyxnQkFBUTs7TUFDTjs7Ozs7dURBS0ksTUFBTSxDQUFBOztZQUVYLElBQUksQ0FBQTs7OyIsCiAgIm5hbWVzIjogW10KfQo=
