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
  safe_not_equal,
  set_data,
  set_store_value,
  text
} from "./chunk-C5XSE2XA.js";

// Counter2.svelte
function create_fragment(ctx) {
  let button;
  let t0;
  let t1;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      t0 = text("count2: ");
      t1 = text(
        /*$count*/
        ctx[0]
      );
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", { class: true });
      var button_nodes = children(button);
      t0 = claim_text(button_nodes, "count2: ");
      t1 = claim_text(
        button_nodes,
        /*$count*/
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
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*handleClick*/
          ctx[1]
        );
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$count*/
      1)
        set_data(
          t1,
          /*$count*/
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
  component_subscribe($$self, count, ($$value) => $$invalidate(0, $count = $$value));
  function handleClick(event) {
    set_store_value(count, $count += 1, $count);
  }
  return [$count, handleClick];
}
var Counter2 = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
};
var Counter2_default = Counter2;
export {
  Counter2_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3YvQ291bnRlcjIuc3ZlbHRlIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyI8c2NyaXB0PlxuXHRpbXBvcnQgeyBjb3VudCB9IGZyb20gXCIuL3N0b3JlXCJcblxuXHQvKiogQHBhcmFtIHtNb3VzZUV2ZW50fSBldmVudCAqL1xuXHRmdW5jdGlvbiBoYW5kbGVDbGljayhldmVudCkge1xuXHRcdCRjb3VudCArPSAxO1xuXHR9XG48L3NjcmlwdD5cblxuPGJ1dHRvbiBvbjpjbGljaz17aGFuZGxlQ2xpY2t9PlxuXHRjb3VudDI6IHskY291bnR9XG48L2J1dHRvbj5cblxuPHN0eWxlPlxuXHRidXR0b24ge1xuXHRcdGJhY2tncm91bmQ6IGxpZ2h0Ymx1ZVxuXHR9XG48L3N0eWxlPlxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztnQkFTOEIsVUFDckI7OztRQUFDLElBQU0sQ0FBQTtNQUFBOzs7Ozs7b0NBRGMsVUFDckI7Ozs7UUFBQyxJQUFNLENBQUE7TUFBQTs7Ozs7Ozs7QUFEaEIsdUJBRVEsUUFBQSxRQUFBLE1BQUE7Ozs7Ozs7O1VBRlUsSUFBVyxDQUFBO1FBQUE7Ozs7Ozs7Ozs7VUFDbkJBLEtBQU0sQ0FBQTtRQUFBOzs7Ozs7Ozs7Ozs7Ozs7O1dBTk4sWUFBWSxPQUFLOzJCQUN6QixVQUFVLEdBQUMsTUFBQTs7Ozs7Ozs7Ozs7IiwKICAibmFtZXMiOiBbImN0eCJdCn0K
