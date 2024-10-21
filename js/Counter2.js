import {
  count,
  create_ssr_component,
  escape,
  set_store_value,
  subscribe
} from "./chunk-BYBW4AU7.js";

// Counter2.svelte
var css = {
  code: "button.svelte-e0u4p{background:lightblue\n	}",
  map: '{"version":3,"file":"Counter2.svelte","sources":["Counter2.svelte"],"sourcesContent":["<script>\\n\\timport { count } from \\"./store\\"\\n\\n\\t/** @param {MouseEvent} event */\\n\\tfunction handleClick(event) {\\n\\t\\t$count += 1;\\n\\t}\\n<\/script>\\n\\n<button on:click={handleClick}>\\n\\tcount2: {$count}\\n</button>\\n\\n<style>\\n\\tbutton {\\n\\t\\tbackground: lightblue\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAcC,mBAAO,CACN,UAAU,CAAE,SAAS;AACvB,CAAC"}'
};
var Counter2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $count, $$unsubscribe_count;
  $$unsubscribe_count = subscribe(count, (value) => $count = value);
  function handleClick(event) {
    set_store_value(count, $count += 1, $count);
  }
  $$result.css.add(css);
  $$unsubscribe_count();
  return `<button class="svelte-e0u4p">count2: ${escape($count)} </button>`;
});
var Counter2_default = Counter2;
export {
  Counter2_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3YvQ291bnRlcjIuc3ZlbHRlIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyI8c2NyaXB0PlxuXHRpbXBvcnQgeyBjb3VudCB9IGZyb20gXCIuL3N0b3JlXCJcblxuXHQvKiogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCAqL1xuXHRmdW5jdGlvbiBoYW5kbGVDbGljayhldmVudCkge1xuXHRcdCRjb3VudCArPSAxO1xuXHR9XG48L3NjcmlwdD5cblxuPGJ1dHRvbiBvbjpjbGljaz17aGFuZGxlQ2xpY2t9PlxuXHRjb3VudDI6IHskY291bnR9XG48L2J1dHRvbj5cblxuPHN0eWxlPlxuXHRidXR0b24ge1xuXHRcdGJhY2tncm91bmQ6IGxpZ2h0Ymx1ZVxuXHR9XG48L3N0eWxlPlxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7OztXQUlVLFlBQVksT0FBSzsyQkFDekIsVUFBVSxHQUFDLE1BQUE7Ozs7d0RBS0gsTUFBTSxDQUFBOzs7IiwKICAibmFtZXMiOiBbXQp9Cg==
