import {
  SvelteComponent,
  append_hydration,
  attr,
  children,
  claim_element,
  claim_text,
  component_subscribe,
  count,
  detach,
  element,
  init,
  insert_hydration,
  listen,
  noop,
  onMount,
  safe_not_equal,
  set_data,
  set_store_value,
  text
} from "./chunk-C5XSE2XA.js";

// Counter.svelte
function create_fragment(ctx) {
  let button;
  let t0;
  let t1;
  let t2;
  let t3;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t0 = text("count: ");
      t1 = text(
        /*$count*/
        ctx[1]
      );
      t2 = text("\n\n	- ");
      t3 = text(
        /*text*/
        ctx[0]
      );
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", { class: true });
      var button_nodes = children(button);
      t0 = claim_text(button_nodes, "count: ");
      t1 = claim_text(
        button_nodes,
        /*$count*/
        ctx[1]
      );
      t2 = claim_text(button_nodes, "\n\n	- ");
      t3 = claim_text(
        button_nodes,
        /*text*/
        ctx[0]
      );
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "class", "svelte-e0u4p");
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      append_hydration(button, t0);
      append_hydration(button, t1);
      append_hydration(button, t2);
      append_hydration(button, t3);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleClick*/
          ctx[2]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$count*/
      2)
        set_data(
          t1,
          /*$count*/
          ctx2[1]
        );
      if (dirty & /*text*/
      1)
        set_data(
          t3,
          /*text*/
          ctx2[0]
        );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      dispose();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let $count;
  component_subscribe($$self, count, ($$value) => $$invalidate(1, $count = $$value));
  let text2 = "";
  function handleClick(event) {
    set_store_value(count, $count += 1, $count);
  }
  onMount(() => {
    $$invalidate(0, text2 = "Hydrated");
    setTimeout(
      () => {
        $$invalidate(0, text2 += " and timer!");
      },
      2e3
    );
  });
  return [text2, $count, handleClick];
}
var Counter = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
};
var Counter_default = Counter;
export {
  Counter_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3YvQ291bnRlci5zdmVsdGUiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIjxzY3JpcHQ+XG4gICAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcblx0aW1wb3J0IHsgY291bnQgfSBmcm9tIFwiLi9zdG9yZVwiXG5cdGxldCB0ZXh0ID0gXCJcIjtcblx0LyoqIEBwYXJhbSB7TW91c2VFdmVudH0gZXZlbnQgKi9cblx0ZnVuY3Rpb24gaGFuZGxlQ2xpY2soZXZlbnQpIHtcblx0XHQkY291bnQgKz0gMTtcblx0fVxuXG5cdG9uTW91bnQoKCkgPT4ge1xuXHRcdHRleHQgPSBcIkh5ZHJhdGVkXCI7XG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0ZXh0ICs9IFwiIGFuZCB0aW1lciFcIlxuXHRcdH0sIDIwMDApO1xuXHR9KVxuPC9zY3JpcHQ+XG5cbjxidXR0b24gb246Y2xpY2s9e2hhbmRsZUNsaWNrfT5cblx0Y291bnQ6IHskY291bnR9XG5cblx0LSB7dGV4dH1cbjwvYnV0dG9uPlxuXG48c3R5bGU+XG5cdGJ1dHRvbiB7XG5cdFx0YmFja2dyb3VuZDogbGlnaHRibHVlXG5cdH1cbjwvc3R5bGU+XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2dCQWlCOEIsU0FDdEI7OztRQUFDLElBQU0sQ0FBQTtNQUFBO2dCQUFBLFNBRVo7OztRQUFDLElBQUksQ0FBQTtNQUFBOzs7Ozs7b0NBSHNCLFNBQ3RCOzs7O1FBQUMsSUFBTSxDQUFBO01BQUE7b0NBQUEsU0FFWjs7OztRQUFDLElBQUksQ0FBQTtNQUFBOzs7Ozs7OztBQUhSLHVCQUlRLFFBQUEsUUFBQSxNQUFBOzs7Ozs7Ozs7O1VBSlUsSUFBVyxDQUFBO1FBQUE7Ozs7Ozs7Ozs7VUFDcEJBLEtBQU0sQ0FBQTtRQUFBOzs7Ozs7VUFFWEEsS0FBSSxDQUFBO1FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUFqQkhDLFFBQU87V0FFRixZQUFZLE9BQUs7MkJBQ3pCLFVBQVUsR0FBQyxNQUFBOztBQUdaLFVBQU8sTUFBQTtvQkFDTkEsUUFBTyxVQUFVO0FBQ2pCOzt3QkFDQ0EsU0FBUSxhQUFZOztNQUNsQjs7Ozs7Ozs7Ozs7OyIsCiAgIm5hbWVzIjogWyJjdHgiLCAidGV4dCJdCn0K
