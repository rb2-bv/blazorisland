// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/utils.js
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    for (const callback of callbacks) {
      callback(void 0);
    }
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function set_store_value(store, ret, value) {
  store.set(value);
  return ret;
}

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/globals.js
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  global
);

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/ResizeObserverSingleton.js
var ResizeObserverSingleton = class _ResizeObserverSingleton {
  /**
   * @private
   * @readonly
   * @type {WeakMap<Element, import('./private.js').Listener>}
   */
  _listeners = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
  /**
   * @private
   * @type {ResizeObserver}
   */
  _observer = void 0;
  /** @type {ResizeObserverOptions} */
  options;
  /** @param {ResizeObserverOptions} options */
  constructor(options) {
    this.options = options;
  }
  /**
   * @param {Element} element
   * @param {import('./private.js').Listener} listener
   * @returns {() => void}
   */
  observe(element2, listener) {
    this._listeners.set(element2, listener);
    this._getObserver().observe(element2, this.options);
    return () => {
      this._listeners.delete(element2);
      this._observer.unobserve(element2);
    };
  }
  /**
   * @private
   */
  _getObserver() {
    return this._observer ?? (this._observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        _ResizeObserverSingleton.entries.set(entry.target, entry);
        this._listeners.get(entry.target)?.(entry);
      }
    }));
  }
};
ResizeObserverSingleton.entries = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/dom.js
var is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function upper_bound(low, high, key, value) {
  while (low < high) {
    const mid = low + (high - low >> 1);
    if (key(mid) <= value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
function init_hydrate(target) {
  if (target.hydrate_init)
    return;
  target.hydrate_init = true;
  let children2 = (
    /** @type {ArrayLike<NodeEx2>} */
    target.childNodes
  );
  if (target.nodeName === "HEAD") {
    const my_children = [];
    for (let i = 0; i < children2.length; i++) {
      const node = children2[i];
      if (node.claim_order !== void 0) {
        my_children.push(node);
      }
    }
    children2 = my_children;
  }
  const m = new Int32Array(children2.length + 1);
  const p = new Int32Array(children2.length);
  m[0] = -1;
  let longest = 0;
  for (let i = 0; i < children2.length; i++) {
    const current = children2[i].claim_order;
    const seq_len = (longest > 0 && children2[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, (idx) => children2[m[idx]].claim_order, current)) - 1;
    p[i] = m[seq_len] + 1;
    const new_len = seq_len + 1;
    m[new_len] = i;
    longest = Math.max(new_len, longest);
  }
  const lis = [];
  const to_move = [];
  let last = children2.length - 1;
  for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
    lis.push(children2[cur - 1]);
    for (; last >= cur; last--) {
      to_move.push(children2[last]);
    }
    last--;
  }
  for (; last >= 0; last--) {
    to_move.push(children2[last]);
  }
  lis.reverse();
  to_move.sort((a, b) => a.claim_order - b.claim_order);
  for (let i = 0, j = 0; i < to_move.length; i++) {
    while (j < lis.length && to_move[i].claim_order >= lis[j].claim_order) {
      j++;
    }
    const anchor = j < lis.length ? lis[j] : null;
    target.insertBefore(to_move[i], anchor);
  }
}
function append_hydration(target, node) {
  if (is_hydrating) {
    init_hydrate(target);
    if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentNode !== target) {
      target.actual_end_child = target.firstChild;
    }
    while (target.actual_end_child !== null && target.actual_end_child.claim_order === void 0) {
      target.actual_end_child = target.actual_end_child.nextSibling;
    }
    if (node !== target.actual_end_child) {
      if (node.claim_order !== void 0 || node.parentNode !== target) {
        target.insertBefore(node, target.actual_end_child);
      }
    } else {
      target.actual_end_child = node.nextSibling;
    }
  } else if (node.parentNode !== target || node.nextSibling !== null) {
    target.appendChild(node);
  }
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function insert_hydration(target, node, anchor) {
  if (is_hydrating && !anchor) {
    append_hydration(target, node);
  } else if (node.parentNode !== target || node.nextSibling != anchor) {
    target.insertBefore(node, anchor || null);
  }
}
function detach(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function init_claim_info(nodes) {
  if (nodes.claim_info === void 0) {
    nodes.claim_info = { last_index: 0, total_claimed: 0 };
  }
}
function claim_node(nodes, predicate, process_node, create_node, dont_update_last_index = false) {
  init_claim_info(nodes);
  const result_node = (() => {
    for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = process_node(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dont_update_last_index) {
          nodes.claim_info.last_index = i;
        }
        return node;
      }
    }
    for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = process_node(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dont_update_last_index) {
          nodes.claim_info.last_index = i;
        } else if (replacement === void 0) {
          nodes.claim_info.last_index--;
        }
        return node;
      }
    }
    return create_node();
  })();
  result_node.claim_order = nodes.claim_info.total_claimed;
  nodes.claim_info.total_claimed += 1;
  return result_node;
}
function claim_element_base(nodes, name, attributes, create_element) {
  return claim_node(
    nodes,
    /** @returns {node is Element | SVGElement} */
    (node) => node.nodeName === name,
    /** @param {Element} node */
    (node) => {
      const remove = [];
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes[j];
        if (!attributes[attribute.name]) {
          remove.push(attribute.name);
        }
      }
      remove.forEach((v) => node.removeAttribute(v));
      return void 0;
    },
    () => create_element(name)
  );
}
function claim_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, element);
}
function claim_text(nodes, data) {
  return claim_node(
    nodes,
    /** @returns {node is Text} */
    (node) => node.nodeType === 3,
    /** @param {Text} node */
    (node) => {
      const data_str = "" + data;
      if (node.data.startsWith(data_str)) {
        if (node.data.length !== data_str.length) {
          return node.splitText(data_str.length);
        }
      } else {
        node.data = data_str;
      }
    },
    () => text(data),
    true
    // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
  );
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.data === data)
    return;
  text2.data = /** @type {string} */
  data;
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach(
    /** @param {Element} node */
    (node) => {
      result[node.slot || "default"] = true;
    }
  );
  return result;
}

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/lifecycle.js
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/scheduler.js
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = /* @__PURE__ */ Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
var seen_callbacks = /* @__PURE__ */ new Set();
var flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
function flush_render_callbacks(fns) {
  const filtered = [];
  const targets = [];
  render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
  targets.forEach((c) => c());
  render_callbacks = filtered;
}

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/transitions.js
var outroing = /* @__PURE__ */ new Set();
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/Component.js
function mount_component(component, target, anchor) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  add_render_callback(() => {
    const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
    if (component.$$.on_destroy) {
      component.$$.on_destroy.push(...new_on_destroy);
    } else {
      run_all(new_on_destroy);
    }
    component.$$.on_mount = [];
  });
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    flush_render_callbacks($$.after_update);
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles = null, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    // state
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    // everything else
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance ? instance(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, Function[]>} Event listeners */
    $$l = {};
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    constructor($$componentCtor, $$slots, use_shadow_dom) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (use_shadow_dom) {
        this.attachShadow({ mode: "open" });
      }
    }
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot = function(name) {
          return () => {
            let node;
            const obj = {
              c: function create() {
                node = element("slot");
                if (name !== "default") {
                  attr(node, "name", name);
                }
              },
              /**
               * @param {HTMLElement} target
               * @param {HTMLElement} [anchor]
               */
              m: function mount(target, anchor) {
                insert(target, node, anchor);
              },
              d: function destroy(detaching) {
                if (detaching) {
                  detach(node);
                }
              }
            };
            return obj;
          };
        };
        await Promise.resolve();
        if (!this.$$cn || this.$$c) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            $$slots[name] = [create_slot(name)];
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        for (const key in this.$$p_d) {
          if (!(key in this.$$d) && this[key] !== void 0) {
            this.$$d[key] = this[key];
            delete this[key];
          }
        }
        this.$$c = new this.$$ctor({
          target: this.shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$scope: {
              ctx: []
            }
          }
        });
        const reflect_attributes = () => {
          this.$$r = true;
          for (const key in this.$$p_d) {
            this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
            if (this.$$p_d[key].reflect) {
              const attribute_value = get_custom_element_value(
                key,
                this.$$d[key],
                this.$$p_d,
                "toAttribute"
              );
              if (attribute_value == null) {
                this.removeAttribute(this.$$p_d[key].attribute || key);
              } else {
                this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
              }
            }
          }
          this.$$r = false;
        };
        this.$$c.$$.after_update.push(reflect_attributes);
        reflect_attributes();
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r)
        return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({ [attr2]: this.$$d[attr2] });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn && this.$$c) {
          this.$$c.$destroy();
          this.$$c = void 0;
        }
      });
    }
    $$g_p(attribute_name) {
      return Object.keys(this.$$p_d).find(
        (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
      ) || attribute_name;
    }
  };
}
function get_custom_element_value(prop, value, props_definition, transform) {
  const type = props_definition[prop]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
var SvelteComponent = class {
  /**
   * ### PRIVATE API
   *
   * Do not use, may change at any time
   *
   * @type {any}
   */
  $$ = void 0;
  /**
   * ### PRIVATE API
   *
   * Do not use, may change at any time
   *
   * @type {any}
   */
  $$set = void 0;
  /** @returns {void} */
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(props) {
    if (this.$$set && !is_empty(props)) {
      this.$$.skip_bound = true;
      this.$$set(props);
      this.$$.skip_bound = false;
    }
  }
};

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/shared/boolean_attributes.js
var _boolean_attributes = (
  /** @type {const} */
  [
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ]
);
var boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/shared/version.js
var PUBLIC_VERSION = "4";

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/internal/disclose-version/index.js
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);

// node_modules/.pnpm/svelte@4.2.19/node_modules/svelte/src/runtime/store/index.js
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update2) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update: update2, subscribe: subscribe2 };
}

// store.ts
var count = writable(0);

export {
  noop,
  safe_not_equal,
  component_subscribe,
  set_store_value,
  append_hydration,
  insert_hydration,
  detach,
  element,
  text,
  listen,
  attr,
  children,
  claim_element,
  claim_text,
  set_data,
  onMount,
  init,
  SvelteComponent,
  count
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3Yvbm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMTkvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC91dGlscy5qcyIsICIuLi8uLi9zdi9ub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4xOS9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2dsb2JhbHMuanMiLCAiLi4vLi4vc3Yvbm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMTkvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9SZXNpemVPYnNlcnZlclNpbmdsZXRvbi5qcyIsICIuLi8uLi9zdi9ub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4xOS9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2RvbS5qcyIsICIuLi8uLi9zdi9ub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4xOS9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL2xpZmVjeWNsZS5qcyIsICIuLi8uLi9zdi9ub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4xOS9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3NjaGVkdWxlci5qcyIsICIuLi8uLi9zdi9ub2RlX21vZHVsZXMvLnBucG0vc3ZlbHRlQDQuMi4xOS9ub2RlX21vZHVsZXMvc3ZlbHRlL3NyYy9ydW50aW1lL2ludGVybmFsL3RyYW5zaXRpb25zLmpzIiwgIi4uLy4uL3N2L25vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjE5L25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvaW50ZXJuYWwvQ29tcG9uZW50LmpzIiwgIi4uLy4uL3N2L25vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjE5L25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3NoYXJlZC9ib29sZWFuX2F0dHJpYnV0ZXMuanMiLCAiLi4vLi4vc3Yvbm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMTkvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvc2hhcmVkL3ZlcnNpb24uanMiLCAiLi4vLi4vc3Yvbm9kZV9tb2R1bGVzLy5wbnBtL3N2ZWx0ZUA0LjIuMTkvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zcmMvcnVudGltZS9pbnRlcm5hbC9kaXNjbG9zZS12ZXJzaW9uL2luZGV4LmpzIiwgIi4uLy4uL3N2L25vZGVfbW9kdWxlcy8ucG5wbS9zdmVsdGVANC4yLjE5L25vZGVfbW9kdWxlcy9zdmVsdGUvc3JjL3J1bnRpbWUvc3RvcmUvaW5kZXguanMiLCAiLi4vLi4vc3Yvc3RvcmUudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBub29wKCkge31cblxuZXhwb3J0IGNvbnN0IGlkZW50aXR5ID0gKHgpID0+IHg7XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0ZW1wbGF0ZSBTXG4gKiBAcGFyYW0ge1R9IHRhclxuICogQHBhcmFtIHtTfSBzcmNcbiAqIEByZXR1cm5zIHtUICYgU31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbih0YXIsIHNyYykge1xuXHQvLyBAdHMtaWdub3JlXG5cdGZvciAoY29uc3QgayBpbiBzcmMpIHRhcltrXSA9IHNyY1trXTtcblx0cmV0dXJuIC8qKiBAdHlwZSB7VCAmIFN9ICovICh0YXIpO1xufVxuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3RoZW4vaXMtcHJvbWlzZS9ibG9iL21hc3Rlci9pbmRleC5qc1xuLy8gRGlzdHJpYnV0ZWQgdW5kZXIgTUlUIExpY2Vuc2UgaHR0cHM6Ly9naXRodWIuY29tL3RoZW4vaXMtcHJvbWlzZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4vKipcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3ZhbHVlIGlzIFByb21pc2VMaWtlPGFueT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19wcm9taXNlKHZhbHVlKSB7XG5cdHJldHVybiAoXG5cdFx0ISF2YWx1ZSAmJlxuXHRcdCh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykgJiZcblx0XHR0eXBlb2YgKC8qKiBAdHlwZSB7YW55fSAqLyAodmFsdWUpLnRoZW4pID09PSAnZnVuY3Rpb24nXG5cdCk7XG59XG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRfbG9jYXRpb24oZWxlbWVudCwgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyKSB7XG5cdGVsZW1lbnQuX19zdmVsdGVfbWV0YSA9IHtcblx0XHRsb2M6IHsgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyIH1cblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihmbikge1xuXHRyZXR1cm4gZm4oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJsYW5rX29iamVjdCgpIHtcblx0cmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtGdW5jdGlvbltdfSBmbnNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuX2FsbChmbnMpIHtcblx0Zm5zLmZvckVhY2gocnVuKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge2FueX0gdGhpbmdcbiAqIEByZXR1cm5zIHt0aGluZyBpcyBGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzX2Z1bmN0aW9uKHRoaW5nKSB7XG5cdHJldHVybiB0eXBlb2YgdGhpbmcgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKiBAcmV0dXJucyB7Ym9vbGVhbn0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYWZlX25vdF9lcXVhbChhLCBiKSB7XG5cdHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiIHx8IChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbic7XG59XG5cbmxldCBzcmNfdXJsX2VxdWFsX2FuY2hvcjtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZWxlbWVudF9zcmNcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3JjX3VybF9lcXVhbChlbGVtZW50X3NyYywgdXJsKSB7XG5cdGlmIChlbGVtZW50X3NyYyA9PT0gdXJsKSByZXR1cm4gdHJ1ZTtcblx0aWYgKCFzcmNfdXJsX2VxdWFsX2FuY2hvcikge1xuXHRcdHNyY191cmxfZXF1YWxfYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuXHR9XG5cdC8vIFRoaXMgaXMgYWN0dWFsbHkgZmFzdGVyIHRoYW4gZG9pbmcgVVJMKC4uKS5ocmVmXG5cdHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWYgPSB1cmw7XG5cdHJldHVybiBlbGVtZW50X3NyYyA9PT0gc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZjtcbn1cblxuLyoqIEBwYXJhbSB7c3RyaW5nfSBzcmNzZXQgKi9cbmZ1bmN0aW9uIHNwbGl0X3NyY3NldChzcmNzZXQpIHtcblx0cmV0dXJuIHNyY3NldC5zcGxpdCgnLCcpLm1hcCgoc3JjKSA9PiBzcmMudHJpbSgpLnNwbGl0KCcgJykuZmlsdGVyKEJvb2xlYW4pKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxTb3VyY2VFbGVtZW50IHwgSFRNTEltYWdlRWxlbWVudH0gZWxlbWVudF9zcmNzZXRcbiAqIEBwYXJhbSB7c3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbH0gc3Jjc2V0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNyY3NldF91cmxfZXF1YWwoZWxlbWVudF9zcmNzZXQsIHNyY3NldCkge1xuXHRjb25zdCBlbGVtZW50X3VybHMgPSBzcGxpdF9zcmNzZXQoZWxlbWVudF9zcmNzZXQuc3Jjc2V0KTtcblx0Y29uc3QgdXJscyA9IHNwbGl0X3NyY3NldChzcmNzZXQgfHwgJycpO1xuXG5cdHJldHVybiAoXG5cdFx0dXJscy5sZW5ndGggPT09IGVsZW1lbnRfdXJscy5sZW5ndGggJiZcblx0XHR1cmxzLmV2ZXJ5KFxuXHRcdFx0KFt1cmwsIHdpZHRoXSwgaSkgPT5cblx0XHRcdFx0d2lkdGggPT09IGVsZW1lbnRfdXJsc1tpXVsxXSAmJlxuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIHRlc3QgYm90aCB3YXlzIGJlY2F1c2UgVml0ZSB3aWxsIGNyZWF0ZSBhbiBhIGZ1bGwgVVJMIHdpdGhcblx0XHRcdFx0Ly8gYG5ldyBVUkwoYXNzZXQsIGltcG9ydC5tZXRhLnVybCkuaHJlZmAgZm9yIHRoZSBjbGllbnQgd2hlbiBgYmFzZTogJy4vJ2AsIGFuZCB0aGVcblx0XHRcdFx0Ly8gcmVsYXRpdmUgVVJMcyBpbnNpZGUgc3Jjc2V0IGFyZSBub3QgYXV0b21hdGljYWxseSByZXNvbHZlZCB0byBhYnNvbHV0ZSBVUkxzIGJ5XG5cdFx0XHRcdC8vIGJyb3dzZXJzIChpbiBjb250cmFzdCB0byBpbWcuc3JjKS4gVGhpcyBtZWFucyBib3RoIFNTUiBhbmQgRE9NIGNvZGUgY291bGRcblx0XHRcdFx0Ly8gY29udGFpbiByZWxhdGl2ZSBvciBhYnNvbHV0ZSBVUkxzLlxuXHRcdFx0XHQoc3JjX3VybF9lcXVhbChlbGVtZW50X3VybHNbaV1bMF0sIHVybCkgfHwgc3JjX3VybF9lcXVhbCh1cmwsIGVsZW1lbnRfdXJsc1tpXVswXSkpXG5cdFx0KVxuXHQpO1xufVxuXG4vKiogQHJldHVybnMge2Jvb2xlYW59ICovXG5leHBvcnQgZnVuY3Rpb24gbm90X2VxdWFsKGEsIGIpIHtcblx0cmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGI7XG59XG5cbi8qKiBAcmV0dXJucyB7Ym9vbGVhbn0gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc19lbXB0eShvYmopIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuXG4vKiogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcblx0aWYgKHN0b3JlICE9IG51bGwgJiYgdHlwZW9mIHN0b3JlLnN1YnNjcmliZSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3Vic2NyaWJlKHN0b3JlLCAuLi5jYWxsYmFja3MpIHtcblx0aWYgKHN0b3JlID09IG51bGwpIHtcblx0XHRmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIGNhbGxiYWNrcykge1xuXHRcdFx0Y2FsbGJhY2sodW5kZWZpbmVkKTtcblx0XHR9XG5cdFx0cmV0dXJuIG5vb3A7XG5cdH1cblx0Y29uc3QgdW5zdWIgPSBzdG9yZS5zdWJzY3JpYmUoLi4uY2FsbGJhY2tzKTtcblx0cmV0dXJuIHVuc3ViLnVuc3Vic2NyaWJlID8gKCkgPT4gdW5zdWIudW5zdWJzY3JpYmUoKSA6IHVuc3ViO1xufVxuXG4vKipcbiAqIEdldCB0aGUgY3VycmVudCB2YWx1ZSBmcm9tIGEgc3RvcmUgYnkgc3Vic2NyaWJpbmcgYW5kIGltbWVkaWF0ZWx5IHVuc3Vic2NyaWJpbmcuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLXN0b3JlI2dldFxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7aW1wb3J0KCcuLi9zdG9yZS9wdWJsaWMuanMnKS5SZWFkYWJsZTxUPn0gc3RvcmVcbiAqIEByZXR1cm5zIHtUfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X3N0b3JlX3ZhbHVlKHN0b3JlKSB7XG5cdGxldCB2YWx1ZTtcblx0c3Vic2NyaWJlKHN0b3JlLCAoXykgPT4gKHZhbHVlID0gXykpKCk7XG5cdHJldHVybiB2YWx1ZTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcblx0Y29tcG9uZW50LiQkLm9uX2Rlc3Ryb3kucHVzaChzdWJzY3JpYmUoc3RvcmUsIGNhbGxiYWNrKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfc2xvdChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKSB7XG5cdGlmIChkZWZpbml0aW9uKSB7XG5cdFx0Y29uc3Qgc2xvdF9jdHggPSBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pO1xuXHRcdHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcblx0cmV0dXJuIGRlZmluaXRpb25bMV0gJiYgZm4gPyBhc3NpZ24oJCRzY29wZS5jdHguc2xpY2UoKSwgZGVmaW5pdGlvblsxXShmbihjdHgpKSkgOiAkJHNjb3BlLmN0eDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldF9zbG90X2NoYW5nZXMoZGVmaW5pdGlvbiwgJCRzY29wZSwgZGlydHksIGZuKSB7XG5cdGlmIChkZWZpbml0aW9uWzJdICYmIGZuKSB7XG5cdFx0Y29uc3QgbGV0cyA9IGRlZmluaXRpb25bMl0oZm4oZGlydHkpKTtcblx0XHRpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbGV0cztcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBsZXRzID09PSAnb2JqZWN0Jykge1xuXHRcdFx0Y29uc3QgbWVyZ2VkID0gW107XG5cdFx0XHRjb25zdCBsZW4gPSBNYXRoLm1heCgkJHNjb3BlLmRpcnR5Lmxlbmd0aCwgbGV0cy5sZW5ndGgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuXHRcdFx0XHRtZXJnZWRbaV0gPSAkJHNjb3BlLmRpcnR5W2ldIHwgbGV0c1tpXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtZXJnZWQ7XG5cdFx0fVxuXHRcdHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcblx0fVxuXHRyZXR1cm4gJCRzY29wZS5kaXJ0eTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9zbG90X2Jhc2UoXG5cdHNsb3QsXG5cdHNsb3RfZGVmaW5pdGlvbixcblx0Y3R4LFxuXHQkJHNjb3BlLFxuXHRzbG90X2NoYW5nZXMsXG5cdGdldF9zbG90X2NvbnRleHRfZm5cbikge1xuXHRpZiAoc2xvdF9jaGFuZ2VzKSB7XG5cdFx0Y29uc3Qgc2xvdF9jb250ZXh0ID0gZ2V0X3Nsb3RfY29udGV4dChzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG5cdFx0c2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcblx0fVxufVxuXG4vKiogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX3Nsb3QoXG5cdHNsb3QsXG5cdHNsb3RfZGVmaW5pdGlvbixcblx0Y3R4LFxuXHQkJHNjb3BlLFxuXHRkaXJ0eSxcblx0Z2V0X3Nsb3RfY2hhbmdlc19mbixcblx0Z2V0X3Nsb3RfY29udGV4dF9mblxuKSB7XG5cdGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG5cdHVwZGF0ZV9zbG90X2Jhc2Uoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIHNsb3RfY2hhbmdlcywgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG59XG5cbi8qKiBAcmV0dXJucyB7YW55W10gfCAtMX0gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRfYWxsX2RpcnR5X2Zyb21fc2NvcGUoJCRzY29wZSkge1xuXHRpZiAoJCRzY29wZS5jdHgubGVuZ3RoID4gMzIpIHtcblx0XHRjb25zdCBkaXJ0eSA9IFtdO1xuXHRcdGNvbnN0IGxlbmd0aCA9ICQkc2NvcGUuY3R4Lmxlbmd0aCAvIDMyO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcblx0XHRcdGRpcnR5W2ldID0gLTE7XG5cdFx0fVxuXHRcdHJldHVybiBkaXJ0eTtcblx0fVxuXHRyZXR1cm4gLTE7XG59XG5cbi8qKiBAcmV0dXJucyB7e319ICovXG5leHBvcnQgZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuXHRjb25zdCByZXN1bHQgPSB7fTtcblx0Zm9yIChjb25zdCBrIGluIHByb3BzKSBpZiAoa1swXSAhPT0gJyQnKSByZXN1bHRba10gPSBwcm9wc1trXTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqIEByZXR1cm5zIHt7fX0gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcblx0Y29uc3QgcmVzdCA9IHt9O1xuXHRrZXlzID0gbmV3IFNldChrZXlzKTtcblx0Zm9yIChjb25zdCBrIGluIHByb3BzKSBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJykgcmVzdFtrXSA9IHByb3BzW2tdO1xuXHRyZXR1cm4gcmVzdDtcbn1cblxuLyoqIEByZXR1cm5zIHt7fX0gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlX3Nsb3RzKHNsb3RzKSB7XG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuXHRcdHJlc3VsdFtrZXldID0gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogQHJldHVybnMgeyh0aGlzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9uY2UoZm4pIHtcblx0bGV0IHJhbiA9IGZhbHNlO1xuXHRyZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcblx0XHRpZiAocmFuKSByZXR1cm47XG5cdFx0cmFuID0gdHJ1ZTtcblx0XHRmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbnVsbF90b19lbXB0eSh2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRfc3RvcmVfdmFsdWUoc3RvcmUsIHJldCwgdmFsdWUpIHtcblx0c3RvcmUuc2V0KHZhbHVlKTtcblx0cmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGNvbnN0IGhhc19wcm9wID0gKG9iaiwgcHJvcCkgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25fZGVzdHJveWVyKGFjdGlvbl9yZXN1bHQpIHtcblx0cmV0dXJuIGFjdGlvbl9yZXN1bHQgJiYgaXNfZnVuY3Rpb24oYWN0aW9uX3Jlc3VsdC5kZXN0cm95KSA/IGFjdGlvbl9yZXN1bHQuZGVzdHJveSA6IG5vb3A7XG59XG5cbi8qKiBAcGFyYW0ge251bWJlciB8IHN0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHtbbnVtYmVyLCBzdHJpbmddfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3BsaXRfY3NzX3VuaXQodmFsdWUpIHtcblx0Y29uc3Qgc3BsaXQgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm1hdGNoKC9eXFxzKigtP1tcXGQuXSspKFteXFxzXSopXFxzKiQvKTtcblx0cmV0dXJuIHNwbGl0ID8gW3BhcnNlRmxvYXQoc3BsaXRbMV0pLCBzcGxpdFsyXSB8fCAncHgnXSA6IFsvKiogQHR5cGUge251bWJlcn0gKi8gKHZhbHVlKSwgJ3B4J107XG59XG5cbmV4cG9ydCBjb25zdCBjb250ZW50ZWRpdGFibGVfdHJ1dGh5X3ZhbHVlcyA9IFsnJywgdHJ1ZSwgMSwgJ3RydWUnLCAnY29udGVudGVkaXRhYmxlJ107XG4iLCAiLyoqIEB0eXBlIHt0eXBlb2YgZ2xvYmFsVGhpc30gKi9cbmV4cG9ydCBjb25zdCBnbG9iYWxzID1cblx0dHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0XHQ/IHdpbmRvd1xuXHRcdDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG5cdFx0PyBnbG9iYWxUaGlzXG5cdFx0OiAvLyBAdHMtaWdub3JlIE5vZGUgdHlwaW5ncyBoYXZlIHRoaXNcblx0XHQgIGdsb2JhbDtcbiIsICJpbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi9nbG9iYWxzLmpzJztcblxuLyoqXG4gKiBSZXNpemUgb2JzZXJ2ZXIgc2luZ2xldG9uLlxuICogT25lIGxpc3RlbmVyIHBlciBlbGVtZW50IG9ubHkhXG4gKiBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2EvY2hyb21pdW0ub3JnL2cvYmxpbmstZGV2L2MvejZpZW5PTlViNUEvbS9GNS1WY1VadEJBQUpcbiAqL1xuZXhwb3J0IGNsYXNzIFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uIHtcblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEByZWFkb25seVxuXHQgKiBAdHlwZSB7V2Vha01hcDxFbGVtZW50LCBpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLkxpc3RlbmVyPn1cblx0ICovXG5cdF9saXN0ZW5lcnMgPSAnV2Vha01hcCcgaW4gZ2xvYmFscyA/IG5ldyBXZWFrTWFwKCkgOiB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB0eXBlIHtSZXNpemVPYnNlcnZlcn1cblx0ICovXG5cdF9vYnNlcnZlciA9IHVuZGVmaW5lZDtcblxuXHQvKiogQHR5cGUge1Jlc2l6ZU9ic2VydmVyT3B0aW9uc30gKi9cblx0b3B0aW9ucztcblxuXHQvKiogQHBhcmFtIHtSZXNpemVPYnNlcnZlck9wdGlvbnN9IG9wdGlvbnMgKi9cblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG5cdCAqIEBwYXJhbSB7aW1wb3J0KCcuL3ByaXZhdGUuanMnKS5MaXN0ZW5lcn0gbGlzdGVuZXJcblx0ICogQHJldHVybnMgeygpID0+IHZvaWR9XG5cdCAqL1xuXHRvYnNlcnZlKGVsZW1lbnQsIGxpc3RlbmVyKSB7XG5cdFx0dGhpcy5fbGlzdGVuZXJzLnNldChlbGVtZW50LCBsaXN0ZW5lcik7XG5cdFx0dGhpcy5fZ2V0T2JzZXJ2ZXIoKS5vYnNlcnZlKGVsZW1lbnQsIHRoaXMub3B0aW9ucyk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRoaXMuX2xpc3RlbmVycy5kZWxldGUoZWxlbWVudCk7XG5cdFx0XHR0aGlzLl9vYnNlcnZlci51bm9ic2VydmUoZWxlbWVudCk7IC8vIHRoaXMgbGluZSBjYW4gcHJvYmFibHkgYmUgcmVtb3ZlZFxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRPYnNlcnZlcigpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dGhpcy5fb2JzZXJ2ZXIgPz9cblx0XHRcdCh0aGlzLl9vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoZW50cmllcykgPT4ge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcblx0XHRcdFx0XHRSZXNpemVPYnNlcnZlclNpbmdsZXRvbi5lbnRyaWVzLnNldChlbnRyeS50YXJnZXQsIGVudHJ5KTtcblx0XHRcdFx0XHR0aGlzLl9saXN0ZW5lcnMuZ2V0KGVudHJ5LnRhcmdldCk/LihlbnRyeSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKVxuXHRcdCk7XG5cdH1cbn1cblxuLy8gTmVlZHMgdG8gYmUgd3JpdHRlbiBsaWtlIHRoaXMgdG8gcGFzcyB0aGUgdHJlZS1zaGFrZS10ZXN0XG5SZXNpemVPYnNlcnZlclNpbmdsZXRvbi5lbnRyaWVzID0gJ1dlYWtNYXAnIGluIGdsb2JhbHMgPyBuZXcgV2Vha01hcCgpIDogdW5kZWZpbmVkO1xuIiwgImltcG9ydCB7IGNvbnRlbnRlZGl0YWJsZV90cnV0aHlfdmFsdWVzLCBoYXNfcHJvcCB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5pbXBvcnQgeyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbiB9IGZyb20gJy4vUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24uanMnO1xuXG4vLyBUcmFjayB3aGljaCBub2RlcyBhcmUgY2xhaW1lZCBkdXJpbmcgaHlkcmF0aW9uLiBVbmNsYWltZWQgbm9kZXMgY2FuIHRoZW4gYmUgcmVtb3ZlZCBmcm9tIHRoZSBET01cbi8vIGF0IHRoZSBlbmQgb2YgaHlkcmF0aW9uIHdpdGhvdXQgdG91Y2hpbmcgdGhlIHJlbWFpbmluZyBub2Rlcy5cbmxldCBpc19oeWRyYXRpbmcgPSBmYWxzZTtcblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0X2h5ZHJhdGluZygpIHtcblx0aXNfaHlkcmF0aW5nID0gdHJ1ZTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZF9oeWRyYXRpbmcoKSB7XG5cdGlzX2h5ZHJhdGluZyA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBsb3dcbiAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoXG4gKiBAcGFyYW0geyhpbmRleDogbnVtYmVyKSA9PiBudW1iZXJ9IGtleVxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiB1cHBlcl9ib3VuZChsb3csIGhpZ2gsIGtleSwgdmFsdWUpIHtcblx0Ly8gUmV0dXJuIGZpcnN0IGluZGV4IG9mIHZhbHVlIGxhcmdlciB0aGFuIGlucHV0IHZhbHVlIGluIHRoZSByYW5nZSBbbG93LCBoaWdoKVxuXHR3aGlsZSAobG93IDwgaGlnaCkge1xuXHRcdGNvbnN0IG1pZCA9IGxvdyArICgoaGlnaCAtIGxvdykgPj4gMSk7XG5cdFx0aWYgKGtleShtaWQpIDw9IHZhbHVlKSB7XG5cdFx0XHRsb3cgPSBtaWQgKyAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRoaWdoID0gbWlkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbG93O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Tm9kZUV4fSB0YXJnZXRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBpbml0X2h5ZHJhdGUodGFyZ2V0KSB7XG5cdGlmICh0YXJnZXQuaHlkcmF0ZV9pbml0KSByZXR1cm47XG5cdHRhcmdldC5oeWRyYXRlX2luaXQgPSB0cnVlO1xuXHQvLyBXZSBrbm93IHRoYXQgYWxsIGNoaWxkcmVuIGhhdmUgY2xhaW1fb3JkZXIgdmFsdWVzIHNpbmNlIHRoZSB1bmNsYWltZWQgaGF2ZSBiZWVuIGRldGFjaGVkIGlmIHRhcmdldCBpcyBub3QgPGhlYWQ+XG5cblx0bGV0IGNoaWxkcmVuID0gLyoqIEB0eXBlIHtBcnJheUxpa2U8Tm9kZUV4Mj59ICovICh0YXJnZXQuY2hpbGROb2Rlcyk7XG5cdC8vIElmIHRhcmdldCBpcyA8aGVhZD4sIHRoZXJlIG1heSBiZSBjaGlsZHJlbiB3aXRob3V0IGNsYWltX29yZGVyXG5cdGlmICh0YXJnZXQubm9kZU5hbWUgPT09ICdIRUFEJykge1xuXHRcdGNvbnN0IG15X2NoaWxkcmVuID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xuXHRcdFx0aWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRteV9jaGlsZHJlbi5wdXNoKG5vZGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjaGlsZHJlbiA9IG15X2NoaWxkcmVuO1xuXHR9XG5cdC8qXG5cdCAqIFJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkuXG5cdCAqIFdlIGNhbiByZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5IGJ5IGZpbmRpbmcgdGhlIGxvbmdlc3Qgc3Vic2VxdWVuY2Ugb2Zcblx0ICogbm9kZXMgdGhhdCBhcmUgYWxyZWFkeSBjbGFpbWVkIGluIG9yZGVyIGFuZCBvbmx5IG1vdmluZyB0aGUgcmVzdC4gVGhlIGxvbmdlc3Rcblx0ICogc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgdGhhdCBhcmUgY2xhaW1lZCBpbiBvcmRlciBjYW4gYmUgZm91bmQgYnlcblx0ICogY29tcHV0aW5nIHRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgLmNsYWltX29yZGVyIHZhbHVlcy5cblx0ICpcblx0ICogVGhpcyBhbGdvcml0aG0gaXMgb3B0aW1hbCBpbiBnZW5lcmF0aW5nIHRoZSBsZWFzdCBhbW91bnQgb2YgcmVvcmRlciBvcGVyYXRpb25zXG5cdCAqIHBvc3NpYmxlLlxuXHQgKlxuXHQgKiBQcm9vZjpcblx0ICogV2Uga25vdyB0aGF0LCBnaXZlbiBhIHNldCBvZiByZW9yZGVyaW5nIG9wZXJhdGlvbnMsIHRoZSBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlXG5cdCAqIGFsd2F5cyBmb3JtIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2UsIHNpbmNlIHRoZXkgZG8gbm90IG1vdmUgYW1vbmcgZWFjaCBvdGhlclxuXHQgKiBtZWFuaW5nIHRoYXQgdGhleSBtdXN0IGJlIGFscmVhZHkgb3JkZXJlZCBhbW9uZyBlYWNoIG90aGVyLiBUaHVzLCB0aGUgbWF4aW1hbFxuXHQgKiBzZXQgb2Ygbm9kZXMgdGhhdCBkbyBub3QgbW92ZSBmb3JtIGEgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlLlxuXHQgKi9cblx0Ly8gQ29tcHV0ZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Vcblx0Ly8gbTogc3Vic2VxdWVuY2UgbGVuZ3RoIGogPT4gaW5kZXggayBvZiBzbWFsbGVzdCB2YWx1ZSB0aGF0IGVuZHMgYW4gaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiBsZW5ndGggalxuXHRjb25zdCBtID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoICsgMSk7XG5cdC8vIFByZWRlY2Vzc29yIGluZGljZXMgKyAxXG5cdGNvbnN0IHAgPSBuZXcgSW50MzJBcnJheShjaGlsZHJlbi5sZW5ndGgpO1xuXHRtWzBdID0gLTE7XG5cdGxldCBsb25nZXN0ID0gMDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IGN1cnJlbnQgPSBjaGlsZHJlbltpXS5jbGFpbV9vcmRlcjtcblx0XHQvLyBGaW5kIHRoZSBsYXJnZXN0IHN1YnNlcXVlbmNlIGxlbmd0aCBzdWNoIHRoYXQgaXQgZW5kcyBpbiBhIHZhbHVlIGxlc3MgdGhhbiBvdXIgY3VycmVudCB2YWx1ZVxuXHRcdC8vIHVwcGVyX2JvdW5kIHJldHVybnMgZmlyc3QgZ3JlYXRlciB2YWx1ZSwgc28gd2Ugc3VidHJhY3Qgb25lXG5cdFx0Ly8gd2l0aCBmYXN0IHBhdGggZm9yIHdoZW4gd2UgYXJlIG9uIHRoZSBjdXJyZW50IGxvbmdlc3Qgc3Vic2VxdWVuY2Vcblx0XHRjb25zdCBzZXFfbGVuID1cblx0XHRcdChsb25nZXN0ID4gMCAmJiBjaGlsZHJlblttW2xvbmdlc3RdXS5jbGFpbV9vcmRlciA8PSBjdXJyZW50XG5cdFx0XHRcdD8gbG9uZ2VzdCArIDFcblx0XHRcdFx0OiB1cHBlcl9ib3VuZCgxLCBsb25nZXN0LCAoaWR4KSA9PiBjaGlsZHJlblttW2lkeF1dLmNsYWltX29yZGVyLCBjdXJyZW50KSkgLSAxO1xuXHRcdHBbaV0gPSBtW3NlcV9sZW5dICsgMTtcblx0XHRjb25zdCBuZXdfbGVuID0gc2VxX2xlbiArIDE7XG5cdFx0Ly8gV2UgY2FuIGd1YXJhbnRlZSB0aGF0IGN1cnJlbnQgaXMgdGhlIHNtYWxsZXN0IHZhbHVlLiBPdGhlcndpc2UsIHdlIHdvdWxkIGhhdmUgZ2VuZXJhdGVkIGEgbG9uZ2VyIHNlcXVlbmNlLlxuXHRcdG1bbmV3X2xlbl0gPSBpO1xuXHRcdGxvbmdlc3QgPSBNYXRoLm1heChuZXdfbGVuLCBsb25nZXN0KTtcblx0fVxuXHQvLyBUaGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIG5vZGVzIChpbml0aWFsbHkgcmV2ZXJzZWQpXG5cblx0LyoqXG5cdCAqIEB0eXBlIHtOb2RlRXgyW119XG5cdCAqL1xuXHRjb25zdCBsaXMgPSBbXTtcblx0Ly8gVGhlIHJlc3Qgb2YgdGhlIG5vZGVzLCBub2RlcyB0aGF0IHdpbGwgYmUgbW92ZWRcblxuXHQvKipcblx0ICogQHR5cGUge05vZGVFeDJbXX1cblx0ICovXG5cdGNvbnN0IHRvX21vdmUgPSBbXTtcblx0bGV0IGxhc3QgPSBjaGlsZHJlbi5sZW5ndGggLSAxO1xuXHRmb3IgKGxldCBjdXIgPSBtW2xvbmdlc3RdICsgMTsgY3VyICE9IDA7IGN1ciA9IHBbY3VyIC0gMV0pIHtcblx0XHRsaXMucHVzaChjaGlsZHJlbltjdXIgLSAxXSk7XG5cdFx0Zm9yICg7IGxhc3QgPj0gY3VyOyBsYXN0LS0pIHtcblx0XHRcdHRvX21vdmUucHVzaChjaGlsZHJlbltsYXN0XSk7XG5cdFx0fVxuXHRcdGxhc3QtLTtcblx0fVxuXHRmb3IgKDsgbGFzdCA+PSAwOyBsYXN0LS0pIHtcblx0XHR0b19tb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuXHR9XG5cdGxpcy5yZXZlcnNlKCk7XG5cdC8vIFdlIHNvcnQgdGhlIG5vZGVzIGJlaW5nIG1vdmVkIHRvIGd1YXJhbnRlZSB0aGF0IHRoZWlyIGluc2VydGlvbiBvcmRlciBtYXRjaGVzIHRoZSBjbGFpbSBvcmRlclxuXHR0b19tb3ZlLnNvcnQoKGEsIGIpID0+IGEuY2xhaW1fb3JkZXIgLSBiLmNsYWltX29yZGVyKTtcblx0Ly8gRmluYWxseSwgd2UgbW92ZSB0aGUgbm9kZXNcblx0Zm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgdG9fbW92ZS5sZW5ndGg7IGkrKykge1xuXHRcdHdoaWxlIChqIDwgbGlzLmxlbmd0aCAmJiB0b19tb3ZlW2ldLmNsYWltX29yZGVyID49IGxpc1tqXS5jbGFpbV9vcmRlcikge1xuXHRcdFx0aisrO1xuXHRcdH1cblx0XHRjb25zdCBhbmNob3IgPSBqIDwgbGlzLmxlbmd0aCA/IGxpc1tqXSA6IG51bGw7XG5cdFx0dGFyZ2V0Lmluc2VydEJlZm9yZSh0b19tb3ZlW2ldLCBhbmNob3IpO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG5cdHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlX3NoZWV0X2lkXG4gKiBAcGFyYW0ge3N0cmluZ30gc3R5bGVzXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZF9zdHlsZXModGFyZ2V0LCBzdHlsZV9zaGVldF9pZCwgc3R5bGVzKSB7XG5cdGNvbnN0IGFwcGVuZF9zdHlsZXNfdG8gPSBnZXRfcm9vdF9mb3Jfc3R5bGUodGFyZ2V0KTtcblx0aWYgKCFhcHBlbmRfc3R5bGVzX3RvLmdldEVsZW1lbnRCeUlkKHN0eWxlX3NoZWV0X2lkKSkge1xuXHRcdGNvbnN0IHN0eWxlID0gZWxlbWVudCgnc3R5bGUnKTtcblx0XHRzdHlsZS5pZCA9IHN0eWxlX3NoZWV0X2lkO1xuXHRcdHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuXHRcdGFwcGVuZF9zdHlsZXNoZWV0KGFwcGVuZF9zdHlsZXNfdG8sIHN0eWxlKTtcblx0fVxufVxuXG4vKipcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybnMge1NoYWRvd1Jvb3QgfCBEb2N1bWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9yb290X2Zvcl9zdHlsZShub2RlKSB7XG5cdGlmICghbm9kZSkgcmV0dXJuIGRvY3VtZW50O1xuXHRjb25zdCByb290ID0gbm9kZS5nZXRSb290Tm9kZSA/IG5vZGUuZ2V0Um9vdE5vZGUoKSA6IG5vZGUub3duZXJEb2N1bWVudDtcblx0aWYgKHJvb3QgJiYgLyoqIEB0eXBlIHtTaGFkb3dSb290fSAqLyAocm9vdCkuaG9zdCkge1xuXHRcdHJldHVybiAvKiogQHR5cGUge1NoYWRvd1Jvb3R9ICovIChyb290KTtcblx0fVxuXHRyZXR1cm4gbm9kZS5vd25lckRvY3VtZW50O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybnMge0NTU1N0eWxlU2hlZXR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSB7XG5cdGNvbnN0IHN0eWxlX2VsZW1lbnQgPSBlbGVtZW50KCdzdHlsZScpO1xuXHQvLyBGb3IgdHJhbnNpdGlvbnMgdG8gd29yayB3aXRob3V0ICdzdHlsZS1zcmM6IHVuc2FmZS1pbmxpbmUnIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5LFxuXHQvLyB0aGVzZSBlbXB0eSB0YWdzIG5lZWQgdG8gYmUgYWxsb3dlZCB3aXRoIGEgaGFzaCBhcyBhIHdvcmthcm91bmQgdW50aWwgd2UgbW92ZSB0byB0aGUgV2ViIEFuaW1hdGlvbnMgQVBJLlxuXHQvLyBVc2luZyB0aGUgaGFzaCBmb3IgdGhlIGVtcHR5IHN0cmluZyAoZm9yIGFuIGVtcHR5IHRhZykgd29ya3MgaW4gYWxsIGJyb3dzZXJzIGV4Y2VwdCBTYWZhcmkuXG5cdC8vIFNvIGFzIGEgd29ya2Fyb3VuZCBmb3IgdGhlIHdvcmthcm91bmQsIHdoZW4gd2UgYXBwZW5kIGVtcHR5IHN0eWxlIHRhZ3Mgd2Ugc2V0IHRoZWlyIGNvbnRlbnQgdG8gLyogZW1wdHkgKi8uXG5cdC8vIFRoZSBoYXNoICdzaGEyNTYtOU9sTk8wRE5FZWFWekhMNFJad0NMc0JIQThXQlE4dG9CcC80RjVYVjJuYz0nIHdpbGwgdGhlbiB3b3JrIGV2ZW4gaW4gU2FmYXJpLlxuXHRzdHlsZV9lbGVtZW50LnRleHRDb250ZW50ID0gJy8qIGVtcHR5ICovJztcblx0YXBwZW5kX3N0eWxlc2hlZXQoZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpLCBzdHlsZV9lbGVtZW50KTtcblx0cmV0dXJuIHN0eWxlX2VsZW1lbnQuc2hlZXQ7XG59XG5cbi8qKlxuICogQHBhcmFtIHtTaGFkb3dSb290IHwgRG9jdW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7SFRNTFN0eWxlRWxlbWVudH0gc3R5bGVcbiAqIEByZXR1cm5zIHtDU1NTdHlsZVNoZWV0fVxuICovXG5mdW5jdGlvbiBhcHBlbmRfc3R5bGVzaGVldChub2RlLCBzdHlsZSkge1xuXHRhcHBlbmQoLyoqIEB0eXBlIHtEb2N1bWVudH0gKi8gKG5vZGUpLmhlYWQgfHwgbm9kZSwgc3R5bGUpO1xuXHRyZXR1cm4gc3R5bGUuc2hlZXQ7XG59XG5cbi8qKlxuICogQHBhcmFtIHtOb2RlRXh9IHRhcmdldFxuICogQHBhcmFtIHtOb2RlRXh9IG5vZGVcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpIHtcblx0aWYgKGlzX2h5ZHJhdGluZykge1xuXHRcdGluaXRfaHlkcmF0ZSh0YXJnZXQpO1xuXHRcdGlmIChcblx0XHRcdHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID09PSB1bmRlZmluZWQgfHxcblx0XHRcdCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCAmJiB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5wYXJlbnROb2RlICE9PSB0YXJnZXQpXG5cdFx0KSB7XG5cdFx0XHR0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5maXJzdENoaWxkO1xuXHRcdH1cblx0XHQvLyBTa2lwIG5vZGVzIG9mIHVuZGVmaW5lZCBvcmRlcmluZ1xuXHRcdHdoaWxlICh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCAmJiB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5jbGFpbV9vcmRlciA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLm5leHRTaWJsaW5nO1xuXHRcdH1cblx0XHRpZiAobm9kZSAhPT0gdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpIHtcblx0XHRcdC8vIFdlIG9ubHkgaW5zZXJ0IGlmIHRoZSBvcmRlcmluZyBvZiB0aGlzIG5vZGUgc2hvdWxkIGJlIG1vZGlmaWVkIG9yIHRoZSBwYXJlbnQgbm9kZSBpcyBub3QgdGFyZ2V0XG5cdFx0XHRpZiAobm9kZS5jbGFpbV9vcmRlciAhPT0gdW5kZWZpbmVkIHx8IG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0KSB7XG5cdFx0XHRcdHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IG5vZGUubmV4dFNpYmxpbmc7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT09IG51bGwpIHtcblx0XHR0YXJnZXQuYXBwZW5kQ2hpbGQobm9kZSk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge05vZGV9IFthbmNob3JdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuXHR0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge05vZGVFeH0gdGFyZ2V0XG4gKiBAcGFyYW0ge05vZGVFeH0gbm9kZVxuICogQHBhcmFtIHtOb2RlRXh9IFthbmNob3JdXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluc2VydF9oeWRyYXRpb24odGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcblx0aWYgKGlzX2h5ZHJhdGluZyAmJiAhYW5jaG9yKSB7XG5cdFx0YXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpO1xuXHR9IGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT0gYW5jaG9yKSB7XG5cdFx0dGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcblx0aWYgKG5vZGUucGFyZW50Tm9kZSkge1xuXHRcdG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcblx0fVxufVxuXG4vKipcbiAqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfZWFjaChpdGVyYXRpb25zLCBkZXRhY2hpbmcpIHtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0aWYgKGl0ZXJhdGlvbnNbaV0pIGl0ZXJhdGlvbnNbaV0uZChkZXRhY2hpbmcpO1xuXHR9XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIHtrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXB9IEtcbiAqIEBwYXJhbSB7S30gbmFtZVxuICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVsZW1lbnQobmFtZSkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUge2tleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcH0gS1xuICogQHBhcmFtIHtLfSBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaXNcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbGVtZW50X2lzKG5hbWUsIGlzKSB7XG5cdHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUsIHsgaXMgfSk7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEB0ZW1wbGF0ZSB7a2V5b2YgVH0gS1xuICogQHBhcmFtIHtUfSBvYmpcbiAqIEBwYXJhbSB7S1tdfSBleGNsdWRlXG4gKiBAcmV0dXJucyB7UGljazxULCBFeGNsdWRlPGtleW9mIFQsIEs+Pn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMob2JqLCBleGNsdWRlKSB7XG5cdGNvbnN0IHRhcmdldCA9IC8qKiBAdHlwZSB7UGljazxULCBFeGNsdWRlPGtleW9mIFQsIEs+Pn0gKi8gKHt9KTtcblx0Zm9yIChjb25zdCBrIGluIG9iaikge1xuXHRcdGlmIChcblx0XHRcdGhhc19wcm9wKG9iaiwgaykgJiZcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGV4Y2x1ZGUuaW5kZXhPZihrKSA9PT0gLTFcblx0XHQpIHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRhcmdldFtrXSA9IG9ialtrXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBAdGVtcGxhdGUge2tleW9mIFNWR0VsZW1lbnRUYWdOYW1lTWFwfSBLXG4gKiBAcGFyYW0ge0t9IG5hbWVcbiAqIEByZXR1cm5zIHtTVkdFbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3ZnX2VsZW1lbnQobmFtZSkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5hbWUpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhXG4gKiBAcmV0dXJucyB7VGV4dH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRleHQoZGF0YSkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG59XG5cbi8qKlxuICogQHJldHVybnMge1RleHR9ICovXG5leHBvcnQgZnVuY3Rpb24gc3BhY2UoKSB7XG5cdHJldHVybiB0ZXh0KCcgJyk7XG59XG5cbi8qKlxuICogQHJldHVybnMge1RleHR9ICovXG5leHBvcnQgZnVuY3Rpb24gZW1wdHkoKSB7XG5cdHJldHVybiB0ZXh0KCcnKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFxuICogQHJldHVybnMge0NvbW1lbnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21tZW50KGNvbnRlbnQpIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoY29udGVudCk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtFdmVudFRhcmdldH0gbm9kZVxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3R9IGhhbmRsZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbiB8IEFkZEV2ZW50TGlzdGVuZXJPcHRpb25zIHwgRXZlbnRMaXN0ZW5lck9wdGlvbnN9IFtvcHRpb25zXVxuICogQHJldHVybnMgeygpID0+IHZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcblx0bm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcblx0cmV0dXJuICgpID0+IG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogQHJldHVybnMgeyhldmVudDogYW55KSA9PiBhbnl9ICovXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG5cdH07XG59XG5cbi8qKlxuICogQHJldHVybnMgeyhldmVudDogYW55KSA9PiBhbnl9ICovXG5leHBvcnQgZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcblx0fTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7KGV2ZW50OiBhbnkpID0+IGFueX0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wX2ltbWVkaWF0ZV9wcm9wYWdhdGlvbihmbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcblx0fTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7KGV2ZW50OiBhbnkpID0+IHZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZihmbikge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuXHR9O1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHsoZXZlbnQ6IGFueSkgPT4gdm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnVzdGVkKGZuKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aWYgKGV2ZW50LmlzVHJ1c3RlZCkgZm4uY2FsbCh0aGlzLCBldmVudCk7XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0ge3N0cmluZ30gYXR0cmlidXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZhbHVlXVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcblx0aWYgKHZhbHVlID09IG51bGwpIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG5cdGVsc2UgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKSBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbi8qKlxuICogTGlzdCBvZiBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBzZXQgdGhyb3VnaCB0aGUgYXR0ciBtZXRob2QsXG4gKiBiZWNhdXNlIHVwZGF0aW5nIHRoZW0gdGhyb3VnaCB0aGUgcHJvcGVydHkgc2V0dGVyIGRvZXNuJ3Qgd29yayByZWxpYWJseS5cbiAqIEluIHRoZSBleGFtcGxlIG9mIGB3aWR0aGAvYGhlaWdodGAsIHRoZSBwcm9ibGVtIGlzIHRoYXQgdGhlIHNldHRlciBvbmx5XG4gKiBhY2NlcHRzIG51bWVyaWMgdmFsdWVzLCBidXQgdGhlIGF0dHJpYnV0ZSBjYW4gYWxzbyBiZSBzZXQgdG8gYSBzdHJpbmcgbGlrZSBgNTAlYC5cbiAqIElmIHRoaXMgbGlzdCBiZWNvbWVzIHRvbyBiaWcsIHJldGhpbmsgdGhpcyBhcHByb2FjaC5cbiAqL1xuY29uc3QgYWx3YXlzX3NldF90aHJvdWdoX3NldF9hdHRyaWJ1dGUgPSBbJ3dpZHRoJywgJ2hlaWdodCddO1xuXG4vKipcbiAqIEBwYXJhbSB7RWxlbWVudCAmIEVsZW1lbnRDU1NJbmxpbmVTdHlsZX0gbm9kZVxuICogQHBhcmFtIHt7IFt4OiBzdHJpbmddOiBzdHJpbmcgfX0gYXR0cmlidXRlc1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG5cdC8vIEB0cy1pZ25vcmVcblx0Y29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXyk7XG5cdGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRpZiAoYXR0cmlidXRlc1trZXldID09IG51bGwpIHtcblx0XHRcdG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSk7XG5cdFx0fSBlbHNlIGlmIChrZXkgPT09ICdzdHlsZScpIHtcblx0XHRcdG5vZGUuc3R5bGUuY3NzVGV4dCA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHR9IGVsc2UgaWYgKGtleSA9PT0gJ19fdmFsdWUnKSB7XG5cdFx0XHQvKiogQHR5cGUge2FueX0gKi8gKG5vZGUpLnZhbHVlID0gbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRkZXNjcmlwdG9yc1trZXldICYmXG5cdFx0XHRkZXNjcmlwdG9yc1trZXldLnNldCAmJlxuXHRcdFx0YWx3YXlzX3NldF90aHJvdWdoX3NldF9hdHRyaWJ1dGUuaW5kZXhPZihrZXkpID09PSAtMVxuXHRcdCkge1xuXHRcdFx0bm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VsZW1lbnQgJiBFbGVtZW50Q1NTSW5saW5lU3R5bGV9IG5vZGVcbiAqIEBwYXJhbSB7eyBbeDogc3RyaW5nXTogc3RyaW5nIH19IGF0dHJpYnV0ZXNcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X3N2Z19hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcblx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCB1bmtub3duPn0gZGF0YV9tYXBcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2N1c3RvbV9lbGVtZW50X2RhdGFfbWFwKG5vZGUsIGRhdGFfbWFwKSB7XG5cdE9iamVjdC5rZXlzKGRhdGFfbWFwKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBrZXksIGRhdGFfbWFwW2tleV0pO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBwcm9wLCB2YWx1ZSkge1xuXHRjb25zdCBsb3dlciA9IHByb3AudG9Mb3dlckNhc2UoKTsgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggZXhpc3RpbmcgYmVoYXZpb3Igd2UgZG8gbG93ZXJjYXNlIGZpcnN0XG5cdGlmIChsb3dlciBpbiBub2RlKSB7XG5cdFx0bm9kZVtsb3dlcl0gPSB0eXBlb2Ygbm9kZVtsb3dlcl0gPT09ICdib29sZWFuJyAmJiB2YWx1ZSA9PT0gJycgPyB0cnVlIDogdmFsdWU7XG5cdH0gZWxzZSBpZiAocHJvcCBpbiBub2RlKSB7XG5cdFx0bm9kZVtwcm9wXSA9IHR5cGVvZiBub2RlW3Byb3BdID09PSAnYm9vbGVhbicgJiYgdmFsdWUgPT09ICcnID8gdHJ1ZSA6IHZhbHVlO1xuXHR9IGVsc2Uge1xuXHRcdGF0dHIobm9kZSwgcHJvcCwgdmFsdWUpO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2R5bmFtaWNfZWxlbWVudF9kYXRhKHRhZykge1xuXHRyZXR1cm4gLy0vLnRlc3QodGFnKSA/IHNldF9jdXN0b21fZWxlbWVudF9kYXRhX21hcCA6IHNldF9hdHRyaWJ1dGVzO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24geGxpbmtfYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG5cdG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X3N2ZWx0ZV9kYXRhc2V0KG5vZGUpIHtcblx0cmV0dXJuIG5vZGUuZGF0YXNldC5zdmVsdGVIO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHt1bmtub3duW119ICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUoZ3JvdXAsIF9fdmFsdWUsIGNoZWNrZWQpIHtcblx0Y29uc3QgdmFsdWUgPSBuZXcgU2V0KCk7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXAubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRpZiAoZ3JvdXBbaV0uY2hlY2tlZCkgdmFsdWUuYWRkKGdyb3VwW2ldLl9fdmFsdWUpO1xuXHR9XG5cdGlmICghY2hlY2tlZCkge1xuXHRcdHZhbHVlLmRlbGV0ZShfX3ZhbHVlKTtcblx0fVxuXHRyZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtIVE1MSW5wdXRFbGVtZW50W119IGdyb3VwXG4gKiBAcmV0dXJucyB7eyBwKC4uLmlucHV0czogSFRNTElucHV0RWxlbWVudFtdKTogdm9pZDsgcigpOiB2b2lkOyB9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdF9iaW5kaW5nX2dyb3VwKGdyb3VwKSB7XG5cdC8qKlxuXHQgKiBAdHlwZSB7SFRNTElucHV0RWxlbWVudFtdfSAqL1xuXHRsZXQgX2lucHV0cztcblx0cmV0dXJuIHtcblx0XHQvKiBwdXNoICovIHAoLi4uaW5wdXRzKSB7XG5cdFx0XHRfaW5wdXRzID0gaW5wdXRzO1xuXHRcdFx0X2lucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4gZ3JvdXAucHVzaChpbnB1dCkpO1xuXHRcdH0sXG5cdFx0LyogcmVtb3ZlICovIHIoKSB7XG5cdFx0XHRfaW5wdXRzLmZvckVhY2goKGlucHV0KSA9PiBncm91cC5zcGxpY2UoZ3JvdXAuaW5kZXhPZihpbnB1dCksIDEpKTtcblx0XHR9XG5cdH07XG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJbXX0gaW5kZXhlc1xuICogQHJldHVybnMge3sgdShuZXdfaW5kZXhlczogbnVtYmVyW10pOiB2b2lkOyBwKC4uLmlucHV0czogSFRNTElucHV0RWxlbWVudFtdKTogdm9pZDsgcjogKCkgPT4gdm9pZDsgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRfYmluZGluZ19ncm91cF9keW5hbWljKGdyb3VwLCBpbmRleGVzKSB7XG5cdC8qKlxuXHQgKiBAdHlwZSB7SFRNTElucHV0RWxlbWVudFtdfSAqL1xuXHRsZXQgX2dyb3VwID0gZ2V0X2JpbmRpbmdfZ3JvdXAoZ3JvdXApO1xuXG5cdC8qKlxuXHQgKiBAdHlwZSB7SFRNTElucHV0RWxlbWVudFtdfSAqL1xuXHRsZXQgX2lucHV0cztcblxuXHRmdW5jdGlvbiBnZXRfYmluZGluZ19ncm91cChncm91cCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZXhlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Z3JvdXAgPSBncm91cFtpbmRleGVzW2ldXSA9IGdyb3VwW2luZGV4ZXNbaV1dIHx8IFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gZ3JvdXA7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybnMge3ZvaWR9ICovXG5cdGZ1bmN0aW9uIHB1c2goKSB7XG5cdFx0X2lucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4gX2dyb3VwLnB1c2goaW5wdXQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7dm9pZH0gKi9cblx0ZnVuY3Rpb24gcmVtb3ZlKCkge1xuXHRcdF9pbnB1dHMuZm9yRWFjaCgoaW5wdXQpID0+IF9ncm91cC5zcGxpY2UoX2dyb3VwLmluZGV4T2YoaW5wdXQpLCAxKSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHQvKiB1cGRhdGUgKi8gdShuZXdfaW5kZXhlcykge1xuXHRcdFx0aW5kZXhlcyA9IG5ld19pbmRleGVzO1xuXHRcdFx0Y29uc3QgbmV3X2dyb3VwID0gZ2V0X2JpbmRpbmdfZ3JvdXAoZ3JvdXApO1xuXHRcdFx0aWYgKG5ld19ncm91cCAhPT0gX2dyb3VwKSB7XG5cdFx0XHRcdHJlbW92ZSgpO1xuXHRcdFx0XHRfZ3JvdXAgPSBuZXdfZ3JvdXA7XG5cdFx0XHRcdHB1c2goKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdC8qIHB1c2ggKi8gcCguLi5pbnB1dHMpIHtcblx0XHRcdF9pbnB1dHMgPSBpbnB1dHM7XG5cdFx0XHRwdXNoKCk7XG5cdFx0fSxcblx0XHQvKiByZW1vdmUgKi8gcjogcmVtb3ZlXG5cdH07XG59XG5cbi8qKiBAcmV0dXJucyB7bnVtYmVyfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvX251bWJlcih2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWUgPT09ICcnID8gbnVsbCA6ICt2YWx1ZTtcbn1cblxuLyoqIEByZXR1cm5zIHthbnlbXX0gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aW1lX3Jhbmdlc190b19hcnJheShyYW5nZXMpIHtcblx0Y29uc3QgYXJyYXkgPSBbXTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRhcnJheS5wdXNoKHsgc3RhcnQ6IHJhbmdlcy5zdGFydChpKSwgZW5kOiByYW5nZXMuZW5kKGkpIH0pO1xuXHR9XG5cdHJldHVybiBhcnJheTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtDaGlsZE5vZGVbXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoaWxkcmVuKGVsZW1lbnQpIHtcblx0cmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jaGlsZE5vZGVzKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0NoaWxkTm9kZUFycmF5fSBub2Rlc1xuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGluaXRfY2xhaW1faW5mbyhub2Rlcykge1xuXHRpZiAobm9kZXMuY2xhaW1faW5mbyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0bm9kZXMuY2xhaW1faW5mbyA9IHsgbGFzdF9pbmRleDogMCwgdG90YWxfY2xhaW1lZDogMCB9O1xuXHR9XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIHtDaGlsZE5vZGVFeH0gUlxuICogQHBhcmFtIHtDaGlsZE5vZGVBcnJheX0gbm9kZXNcbiAqIEBwYXJhbSB7KG5vZGU6IENoaWxkTm9kZUV4KSA9PiBub2RlIGlzIFJ9IHByZWRpY2F0ZVxuICogQHBhcmFtIHsobm9kZTogQ2hpbGROb2RlRXgpID0+IENoaWxkTm9kZUV4IHwgdW5kZWZpbmVkfSBwcm9jZXNzX25vZGVcbiAqIEBwYXJhbSB7KCkgPT4gUn0gY3JlYXRlX25vZGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9udF91cGRhdGVfbGFzdF9pbmRleFxuICogQHJldHVybnMge1J9XG4gKi9cbmZ1bmN0aW9uIGNsYWltX25vZGUobm9kZXMsIHByZWRpY2F0ZSwgcHJvY2Vzc19ub2RlLCBjcmVhdGVfbm9kZSwgZG9udF91cGRhdGVfbGFzdF9pbmRleCA9IGZhbHNlKSB7XG5cdC8vIFRyeSB0byBmaW5kIG5vZGVzIGluIGFuIG9yZGVyIHN1Y2ggdGhhdCB3ZSBsZW5ndGhlbiB0aGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlXG5cdGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG5cdGNvbnN0IHJlc3VsdF9ub2RlID0gKCgpID0+IHtcblx0XHQvLyBXZSBmaXJzdCB0cnkgdG8gZmluZCBhbiBlbGVtZW50IGFmdGVyIHRoZSBwcmV2aW91cyBvbmVcblx0XHRmb3IgKGxldCBpID0gbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4OyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcblx0XHRcdGlmIChwcmVkaWNhdGUobm9kZSkpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBwcm9jZXNzX25vZGUobm9kZSk7XG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bm9kZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5vZGVzW2ldID0gcmVwbGFjZW1lbnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFkb250X3VwZGF0ZV9sYXN0X2luZGV4KSB7XG5cdFx0XHRcdFx0bm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4ID0gaTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gT3RoZXJ3aXNlLCB3ZSB0cnkgdG8gZmluZCBvbmUgYmVmb3JlXG5cdFx0Ly8gV2UgaXRlcmF0ZSBpbiByZXZlcnNlIHNvIHRoYXQgd2UgZG9uJ3QgZ28gdG9vIGZhciBiYWNrXG5cdFx0Zm9yIChsZXQgaSA9IG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCBub2RlID0gbm9kZXNbaV07XG5cdFx0XHRpZiAocHJlZGljYXRlKG5vZGUpKSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50ID0gcHJvY2Vzc19ub2RlKG5vZGUpO1xuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG5vZGVzLnNwbGljZShpLCAxKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRub2Rlc1tpXSA9IHJlcGxhY2VtZW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghZG9udF91cGRhdGVfbGFzdF9pbmRleCkge1xuXHRcdFx0XHRcdG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCA9IGk7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdC8vIFNpbmNlIHdlIHNwbGljZWQgYmVmb3JlIHRoZSBsYXN0X2luZGV4LCB3ZSBkZWNyZWFzZSBpdFxuXHRcdFx0XHRcdG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleC0tO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBub2RlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBJZiB3ZSBjYW4ndCBmaW5kIGFueSBtYXRjaGluZyBub2RlLCB3ZSBjcmVhdGUgYSBuZXcgb25lXG5cdFx0cmV0dXJuIGNyZWF0ZV9ub2RlKCk7XG5cdH0pKCk7XG5cdHJlc3VsdF9ub2RlLmNsYWltX29yZGVyID0gbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkO1xuXHRub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcblx0cmV0dXJuIHJlc3VsdF9ub2RlO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Q2hpbGROb2RlQXJyYXl9IG5vZGVzXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHt7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfX0gYXR0cmlidXRlc1xuICogQHBhcmFtIHsobmFtZTogc3RyaW5nKSA9PiBFbGVtZW50IHwgU1ZHRWxlbWVudH0gY3JlYXRlX2VsZW1lbnRcbiAqIEByZXR1cm5zIHtFbGVtZW50IHwgU1ZHRWxlbWVudH1cbiAqL1xuZnVuY3Rpb24gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBjcmVhdGVfZWxlbWVudCkge1xuXHRyZXR1cm4gY2xhaW1fbm9kZShcblx0XHRub2Rlcyxcblx0XHQvKiogQHJldHVybnMge25vZGUgaXMgRWxlbWVudCB8IFNWR0VsZW1lbnR9ICovXG5cdFx0KG5vZGUpID0+IG5vZGUubm9kZU5hbWUgPT09IG5hbWUsXG5cdFx0LyoqIEBwYXJhbSB7RWxlbWVudH0gbm9kZSAqL1xuXHRcdChub2RlKSA9PiB7XG5cdFx0XHRjb25zdCByZW1vdmUgPSBbXTtcblx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGNvbnN0IGF0dHJpYnV0ZSA9IG5vZGUuYXR0cmlidXRlc1tqXTtcblx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSkge1xuXHRcdFx0XHRcdHJlbW92ZS5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmVtb3ZlLmZvckVhY2goKHYpID0+IG5vZGUucmVtb3ZlQXR0cmlidXRlKHYpKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fSxcblx0XHQoKSA9PiBjcmVhdGVfZWxlbWVudChuYW1lKVxuXHQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Q2hpbGROb2RlQXJyYXl9IG5vZGVzXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICogQHBhcmFtIHt7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfX0gYXR0cmlidXRlc1xuICogQHJldHVybnMge0VsZW1lbnQgfCBTVkdFbGVtZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1fZWxlbWVudChub2RlcywgbmFtZSwgYXR0cmlidXRlcykge1xuXHRyZXR1cm4gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBlbGVtZW50KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0NoaWxkTm9kZUFycmF5fSBub2Rlc1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7eyBba2V5OiBzdHJpbmddOiBib29sZWFuIH19IGF0dHJpYnV0ZXNcbiAqIEByZXR1cm5zIHtFbGVtZW50IHwgU1ZHRWxlbWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYWltX3N2Z19lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzKSB7XG5cdHJldHVybiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIHN2Z19lbGVtZW50KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0NoaWxkTm9kZUFycmF5fSBub2Rlc1xuICogQHJldHVybnMge1RleHR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGFpbV90ZXh0KG5vZGVzLCBkYXRhKSB7XG5cdHJldHVybiBjbGFpbV9ub2RlKFxuXHRcdG5vZGVzLFxuXHRcdC8qKiBAcmV0dXJucyB7bm9kZSBpcyBUZXh0fSAqL1xuXHRcdChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSAzLFxuXHRcdC8qKiBAcGFyYW0ge1RleHR9IG5vZGUgKi9cblx0XHQobm9kZSkgPT4ge1xuXHRcdFx0Y29uc3QgZGF0YV9zdHIgPSAnJyArIGRhdGE7XG5cdFx0XHRpZiAobm9kZS5kYXRhLnN0YXJ0c1dpdGgoZGF0YV9zdHIpKSB7XG5cdFx0XHRcdGlmIChub2RlLmRhdGEubGVuZ3RoICE9PSBkYXRhX3N0ci5sZW5ndGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gbm9kZS5zcGxpdFRleHQoZGF0YV9zdHIubGVuZ3RoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZS5kYXRhID0gZGF0YV9zdHI7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQoKSA9PiB0ZXh0KGRhdGEpLFxuXHRcdHRydWUgLy8gVGV4dCBub2RlcyBzaG91bGQgbm90IHVwZGF0ZSBsYXN0IGluZGV4IHNpbmNlIGl0IGlzIGxpa2VseSBub3Qgd29ydGggaXQgdG8gZWxpbWluYXRlIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgYWN0dWFsIGVsZW1lbnRzXG5cdCk7XG59XG5cbi8qKlxuICogQHJldHVybnMge1RleHR9ICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1fc3BhY2Uobm9kZXMpIHtcblx0cmV0dXJuIGNsYWltX3RleHQobm9kZXMsICcgJyk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtDaGlsZE5vZGVBcnJheX0gbm9kZXNcbiAqIEByZXR1cm5zIHtDb21tZW50fVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1fY29tbWVudChub2RlcywgZGF0YSkge1xuXHRyZXR1cm4gY2xhaW1fbm9kZShcblx0XHRub2Rlcyxcblx0XHQvKiogQHJldHVybnMge25vZGUgaXMgQ29tbWVudH0gKi9cblx0XHQobm9kZSkgPT4gbm9kZS5ub2RlVHlwZSA9PT0gOCxcblx0XHQvKiogQHBhcmFtIHtDb21tZW50fSBub2RlICovXG5cdFx0KG5vZGUpID0+IHtcblx0XHRcdG5vZGUuZGF0YSA9ICcnICsgZGF0YTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fSxcblx0XHQoKSA9PiBjb21tZW50KGRhdGEpLFxuXHRcdHRydWVcblx0KTtcbn1cblxuZnVuY3Rpb24gZ2V0X2NvbW1lbnRfaWR4KG5vZGVzLCB0ZXh0LCBzdGFydCkge1xuXHRmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBjb21tZW50IG5vZGUgKi8gJiYgbm9kZS50ZXh0Q29udGVudC50cmltKCkgPT09IHRleHQpIHtcblx0XHRcdHJldHVybiBpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gLTE7XG59XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufSBpc19zdmdcbiAqIEByZXR1cm5zIHtIdG1sVGFnSHlkcmF0aW9ufVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xhaW1faHRtbF90YWcobm9kZXMsIGlzX3N2Zykge1xuXHQvLyBmaW5kIGh0bWwgb3BlbmluZyB0YWdcblx0Y29uc3Qgc3RhcnRfaW5kZXggPSBnZXRfY29tbWVudF9pZHgobm9kZXMsICdIVE1MX1RBR19TVEFSVCcsIDApO1xuXHRjb25zdCBlbmRfaW5kZXggPSBnZXRfY29tbWVudF9pZHgobm9kZXMsICdIVE1MX1RBR19FTkQnLCBzdGFydF9pbmRleCArIDEpO1xuXHRpZiAoc3RhcnRfaW5kZXggPT09IC0xIHx8IGVuZF9pbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gbmV3IEh0bWxUYWdIeWRyYXRpb24oaXNfc3ZnKTtcblx0fVxuXG5cdGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG5cdGNvbnN0IGh0bWxfdGFnX25vZGVzID0gbm9kZXMuc3BsaWNlKHN0YXJ0X2luZGV4LCBlbmRfaW5kZXggLSBzdGFydF9pbmRleCArIDEpO1xuXHRkZXRhY2goaHRtbF90YWdfbm9kZXNbMF0pO1xuXHRkZXRhY2goaHRtbF90YWdfbm9kZXNbaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMV0pO1xuXHRjb25zdCBjbGFpbWVkX25vZGVzID0gaHRtbF90YWdfbm9kZXMuc2xpY2UoMSwgaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMSk7XG5cdGlmIChjbGFpbWVkX25vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbihpc19zdmcpO1xuXHR9XG5cdGZvciAoY29uc3QgbiBvZiBjbGFpbWVkX25vZGVzKSB7XG5cdFx0bi5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcblx0XHRub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcblx0fVxuXHRyZXR1cm4gbmV3IEh0bWxUYWdIeWRyYXRpb24oaXNfc3ZnLCBjbGFpbWVkX25vZGVzKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1RleHR9IHRleHRcbiAqIEBwYXJhbSB7dW5rbm93bn0gZGF0YVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG5cdGRhdGEgPSAnJyArIGRhdGE7XG5cdGlmICh0ZXh0LmRhdGEgPT09IGRhdGEpIHJldHVybjtcblx0dGV4dC5kYXRhID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChkYXRhKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1RleHR9IHRleHRcbiAqIEBwYXJhbSB7dW5rbm93bn0gZGF0YVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfZGF0YV9jb250ZW50ZWRpdGFibGUodGV4dCwgZGF0YSkge1xuXHRkYXRhID0gJycgKyBkYXRhO1xuXHRpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpIHJldHVybjtcblx0dGV4dC5kYXRhID0gLyoqIEB0eXBlIHtzdHJpbmd9ICovIChkYXRhKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1RleHR9IHRleHRcbiAqIEBwYXJhbSB7dW5rbm93bn0gZGF0YVxuICogQHBhcmFtIHtzdHJpbmd9IGF0dHJfdmFsdWVcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2RhdGFfbWF5YmVfY29udGVudGVkaXRhYmxlKHRleHQsIGRhdGEsIGF0dHJfdmFsdWUpIHtcblx0aWYgKH5jb250ZW50ZWRpdGFibGVfdHJ1dGh5X3ZhbHVlcy5pbmRleE9mKGF0dHJfdmFsdWUpKSB7XG5cdFx0c2V0X2RhdGFfY29udGVudGVkaXRhYmxlKHRleHQsIGRhdGEpO1xuXHR9IGVsc2Uge1xuXHRcdHNldF9kYXRhKHRleHQsIGRhdGEpO1xuXHR9XG59XG5cbi8qKlxuICogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gc2V0X2lucHV0X3ZhbHVlKGlucHV0LCB2YWx1ZSkge1xuXHRpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuXG4vKipcbiAqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG5cdHRyeSB7XG5cdFx0aW5wdXQudHlwZSA9IHR5cGU7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBkbyBub3RoaW5nXG5cdH1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG5cdGlmICh2YWx1ZSA9PSBudWxsKSB7XG5cdFx0bm9kZS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShrZXkpO1xuXHR9IGVsc2Uge1xuXHRcdG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgaW1wb3J0YW50ID8gJ2ltcG9ydGFudCcgOiAnJyk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Rfb3B0aW9uKHNlbGVjdCwgdmFsdWUsIG1vdW50aW5nKSB7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcblx0XHRpZiAob3B0aW9uLl9fdmFsdWUgPT09IHZhbHVlKSB7XG5cdFx0XHRvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXHRpZiAoIW1vdW50aW5nIHx8IHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IC0xOyAvLyBubyBvcHRpb24gc2hvdWxkIGJlIHNlbGVjdGVkXG5cdH1cbn1cblxuLyoqXG4gKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcblx0XHRvcHRpb24uc2VsZWN0ZWQgPSB+dmFsdWUuaW5kZXhPZihvcHRpb24uX192YWx1ZSk7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcblx0Y29uc3Qgc2VsZWN0ZWRfb3B0aW9uID0gc2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJzpjaGVja2VkJyk7XG5cdHJldHVybiBzZWxlY3RlZF9vcHRpb24gJiYgc2VsZWN0ZWRfb3B0aW9uLl9fdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RfbXVsdGlwbGVfdmFsdWUoc2VsZWN0KSB7XG5cdHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgKG9wdGlvbikgPT4gb3B0aW9uLl9fdmFsdWUpO1xufVxuLy8gdW5mb3J0dW5hdGVseSB0aGlzIGNhbid0IGJlIGEgY29uc3RhbnQgYXMgdGhhdCB3b3VsZG4ndCBiZSB0cmVlLXNoYWtlYWJsZVxuLy8gc28gd2UgY2FjaGUgdGhlIHJlc3VsdCBpbnN0ZWFkXG5cbi8qKlxuICogQHR5cGUge2Jvb2xlYW59ICovXG5sZXQgY3Jvc3NvcmlnaW47XG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59ICovXG5leHBvcnQgZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG5cdGlmIChjcm9zc29yaWdpbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Y3Jvc3NvcmlnaW4gPSBmYWxzZTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wYXJlbnQpIHtcblx0XHRcdFx0dm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjcm9zc29yaWdpbiA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjcm9zc29yaWdpbjtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0geygpID0+IHZvaWR9IGZuXG4gKiBAcmV0dXJucyB7KCkgPT4gdm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZF9pZnJhbWVfcmVzaXplX2xpc3RlbmVyKG5vZGUsIGZuKSB7XG5cdGNvbnN0IGNvbXB1dGVkX3N0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcblx0aWYgKGNvbXB1dGVkX3N0eWxlLnBvc2l0aW9uID09PSAnc3RhdGljJykge1xuXHRcdG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuXHR9XG5cdGNvbnN0IGlmcmFtZSA9IGVsZW1lbnQoJ2lmcmFtZScpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKFxuXHRcdCdzdHlsZScsXG5cdFx0J2Rpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgJyArXG5cdFx0XHQnb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTE7J1xuXHQpO1xuXHRpZnJhbWUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cdGlmcmFtZS50YWJJbmRleCA9IC0xO1xuXHRjb25zdCBjcm9zc29yaWdpbiA9IGlzX2Nyb3Nzb3JpZ2luKCk7XG5cblx0LyoqXG5cdCAqIEB0eXBlIHsoKSA9PiB2b2lkfVxuXHQgKi9cblx0bGV0IHVuc3Vic2NyaWJlO1xuXHRpZiAoY3Jvc3NvcmlnaW4pIHtcblx0XHRpZnJhbWUuc3JjID0gXCJkYXRhOnRleHQvaHRtbCw8c2NyaXB0Pm9ucmVzaXplPWZ1bmN0aW9uKCl7cGFyZW50LnBvc3RNZXNzYWdlKDAsJyonKX08L3NjcmlwdD5cIjtcblx0XHR1bnN1YnNjcmliZSA9IGxpc3Rlbihcblx0XHRcdHdpbmRvdyxcblx0XHRcdCdtZXNzYWdlJyxcblx0XHRcdC8qKiBAcGFyYW0ge01lc3NhZ2VFdmVudH0gZXZlbnQgKi8gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdGlmIChldmVudC5zb3VyY2UgPT09IGlmcmFtZS5jb250ZW50V2luZG93KSBmbigpO1xuXHRcdFx0fVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0aWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG5cdFx0aWZyYW1lLm9ubG9hZCA9ICgpID0+IHtcblx0XHRcdHVuc3Vic2NyaWJlID0gbGlzdGVuKGlmcmFtZS5jb250ZW50V2luZG93LCAncmVzaXplJywgZm4pO1xuXHRcdFx0Ly8gbWFrZSBzdXJlIGFuIGluaXRpYWwgcmVzaXplIGV2ZW50IGlzIGZpcmVkIF9hZnRlcl8gdGhlIGlmcmFtZSBpcyBsb2FkZWQgKHdoaWNoIGlzIGFzeW5jaHJvbm91cylcblx0XHRcdC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vc3ZlbHRlanMvc3ZlbHRlL2lzc3Vlcy80MjMzXG5cdFx0XHRmbigpO1xuXHRcdH07XG5cdH1cblx0YXBwZW5kKG5vZGUsIGlmcmFtZSk7XG5cdHJldHVybiAoKSA9PiB7XG5cdFx0aWYgKGNyb3Nzb3JpZ2luKSB7XG5cdFx0XHR1bnN1YnNjcmliZSgpO1xuXHRcdH0gZWxzZSBpZiAodW5zdWJzY3JpYmUgJiYgaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcblx0XHRcdHVuc3Vic2NyaWJlKCk7XG5cdFx0fVxuXHRcdGRldGFjaChpZnJhbWUpO1xuXHR9O1xufVxuZXhwb3J0IGNvbnN0IHJlc2l6ZV9vYnNlcnZlcl9jb250ZW50X2JveCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24oe1xuXHRib3g6ICdjb250ZW50LWJveCdcbn0pO1xuZXhwb3J0IGNvbnN0IHJlc2l6ZV9vYnNlcnZlcl9ib3JkZXJfYm94ID0gLyogQF9fUFVSRV9fICovIG5ldyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbih7XG5cdGJveDogJ2JvcmRlci1ib3gnXG59KTtcbmV4cG9ydCBjb25zdCByZXNpemVfb2JzZXJ2ZXJfZGV2aWNlX3BpeGVsX2NvbnRlbnRfYm94ID0gLyogQF9fUFVSRV9fICovIG5ldyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbihcblx0eyBib3g6ICdkZXZpY2UtcGl4ZWwtY29udGVudC1ib3gnIH1cbik7XG5leHBvcnQgeyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbiB9O1xuXG4vKipcbiAqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZV9jbGFzcyhlbGVtZW50LCBuYW1lLCB0b2dnbGUpIHtcblx0Ly8gVGhlIGAhIWAgaXMgcmVxdWlyZWQgYmVjYXVzZSBhbiBgdW5kZWZpbmVkYCBmbGFnIG1lYW5zIGZsaXBwaW5nIHRoZSBjdXJyZW50IHN0YXRlLlxuXHRlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUobmFtZSwgISF0b2dnbGUpO1xufVxuXG4vKipcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtUfSBbZGV0YWlsXVxuICogQHBhcmFtIHt7IGJ1YmJsZXM/OiBib29sZWFuLCBjYW5jZWxhYmxlPzogYm9vbGVhbiB9fSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHtDdXN0b21FdmVudDxUPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwsIHsgYnViYmxlcyA9IGZhbHNlLCBjYW5jZWxhYmxlID0gZmFsc2UgfSA9IHt9KSB7XG5cdHJldHVybiBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWwsIGJ1YmJsZXMsIGNhbmNlbGFibGUgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRcbiAqIEByZXR1cm5zIHtDaGlsZE5vZGVBcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5X3NlbGVjdG9yX2FsbChzZWxlY3RvciwgcGFyZW50ID0gZG9jdW1lbnQuYm9keSkge1xuXHRyZXR1cm4gQXJyYXkuZnJvbShwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBub2RlSWRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGhlYWRcbiAqIEByZXR1cm5zIHthbnlbXX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhlYWRfc2VsZWN0b3Iobm9kZUlkLCBoZWFkKSB7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXHRsZXQgc3RhcnRlZCA9IDA7XG5cdGZvciAoY29uc3Qgbm9kZSBvZiBoZWFkLmNoaWxkTm9kZXMpIHtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBjb21tZW50IG5vZGUgKi8pIHtcblx0XHRcdGNvbnN0IGNvbW1lbnQgPSBub2RlLnRleHRDb250ZW50LnRyaW0oKTtcblx0XHRcdGlmIChjb21tZW50ID09PSBgSEVBRF8ke25vZGVJZH1fRU5EYCkge1xuXHRcdFx0XHRzdGFydGVkIC09IDE7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKG5vZGUpO1xuXHRcdFx0fSBlbHNlIGlmIChjb21tZW50ID09PSBgSEVBRF8ke25vZGVJZH1fU1RBUlRgKSB7XG5cdFx0XHRcdHN0YXJ0ZWQgKz0gMTtcblx0XHRcdFx0cmVzdWx0LnB1c2gobm9kZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzdGFydGVkID4gMCkge1xuXHRcdFx0cmVzdWx0LnB1c2gobm9kZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59XG4vKiogKi9cbmV4cG9ydCBjbGFzcyBIdG1sVGFnIHtcblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBkZWZhdWx0IGZhbHNlXG5cdCAqL1xuXHRpc19zdmcgPSBmYWxzZTtcblx0LyoqIHBhcmVudCBmb3IgY3JlYXRpbmcgbm9kZSAqL1xuXHRlID0gdW5kZWZpbmVkO1xuXHQvKiogaHRtbCB0YWcgbm9kZXMgKi9cblx0biA9IHVuZGVmaW5lZDtcblx0LyoqIHRhcmdldCAqL1xuXHR0ID0gdW5kZWZpbmVkO1xuXHQvKiogYW5jaG9yICovXG5cdGEgPSB1bmRlZmluZWQ7XG5cdGNvbnN0cnVjdG9yKGlzX3N2ZyA9IGZhbHNlKSB7XG5cdFx0dGhpcy5pc19zdmcgPSBpc19zdmc7XG5cdFx0dGhpcy5lID0gdGhpcy5uID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdGMoaHRtbCkge1xuXHRcdHRoaXMuaChodG1sKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuXHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50IHwgU1ZHRWxlbWVudH0gdGFyZ2V0XG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50fSBhbmNob3Jcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRtKGh0bWwsIHRhcmdldCwgYW5jaG9yID0gbnVsbCkge1xuXHRcdGlmICghdGhpcy5lKSB7XG5cdFx0XHRpZiAodGhpcy5pc19zdmcpXG5cdFx0XHRcdHRoaXMuZSA9IHN2Z19lbGVtZW50KC8qKiBAdHlwZSB7a2V5b2YgU1ZHRWxlbWVudFRhZ05hbWVNYXB9ICovICh0YXJnZXQubm9kZU5hbWUpKTtcblx0XHRcdC8qKiAjNzM2NCAgdGFyZ2V0IGZvciA8dGVtcGxhdGU+IG1heSBiZSBwcm92aWRlZCBhcyAjZG9jdW1lbnQtZnJhZ21lbnQoMTEpICovIGVsc2Vcblx0XHRcdFx0dGhpcy5lID0gZWxlbWVudChcblx0XHRcdFx0XHQvKiogQHR5cGUge2tleW9mIEhUTUxFbGVtZW50VGFnTmFtZU1hcH0gKi8gKFxuXHRcdFx0XHRcdFx0dGFyZ2V0Lm5vZGVUeXBlID09PSAxMSA/ICdURU1QTEFURScgOiB0YXJnZXQubm9kZU5hbWVcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCk7XG5cdFx0XHR0aGlzLnQgPVxuXHRcdFx0XHR0YXJnZXQudGFnTmFtZSAhPT0gJ1RFTVBMQVRFJ1xuXHRcdFx0XHRcdD8gdGFyZ2V0XG5cdFx0XHRcdFx0OiAvKiogQHR5cGUge0hUTUxUZW1wbGF0ZUVsZW1lbnR9ICovICh0YXJnZXQpLmNvbnRlbnQ7XG5cdFx0XHR0aGlzLmMoaHRtbCk7XG5cdFx0fVxuXHRcdHRoaXMuaShhbmNob3IpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0aChodG1sKSB7XG5cdFx0dGhpcy5lLmlubmVySFRNTCA9IGh0bWw7XG5cdFx0dGhpcy5uID0gQXJyYXkuZnJvbShcblx0XHRcdHRoaXMuZS5ub2RlTmFtZSA9PT0gJ1RFTVBMQVRFJyA/IHRoaXMuZS5jb250ZW50LmNoaWxkTm9kZXMgOiB0aGlzLmUuY2hpbGROb2Rlc1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybnMge3ZvaWR9ICovXG5cdGkoYW5jaG9yKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRwKGh0bWwpIHtcblx0XHR0aGlzLmQoKTtcblx0XHR0aGlzLmgoaHRtbCk7XG5cdFx0dGhpcy5pKHRoaXMuYSk7XG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybnMge3ZvaWR9ICovXG5cdGQoKSB7XG5cdFx0dGhpcy5uLmZvckVhY2goZGV0YWNoKTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgSHRtbFRhZ0h5ZHJhdGlvbiBleHRlbmRzIEh0bWxUYWcge1xuXHQvKiogQHR5cGUge0VsZW1lbnRbXX0gaHlkcmF0aW9uIGNsYWltZWQgbm9kZXMgKi9cblx0bCA9IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3Rvcihpc19zdmcgPSBmYWxzZSwgY2xhaW1lZF9ub2Rlcykge1xuXHRcdHN1cGVyKGlzX3N2Zyk7XG5cdFx0dGhpcy5lID0gdGhpcy5uID0gbnVsbDtcblx0XHR0aGlzLmwgPSBjbGFpbWVkX25vZGVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0YyhodG1sKSB7XG5cdFx0aWYgKHRoaXMubCkge1xuXHRcdFx0dGhpcy5uID0gdGhpcy5sO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzdXBlci5jKGh0bWwpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7dm9pZH0gKi9cblx0aShhbmNob3IpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubi5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0aW5zZXJ0X2h5ZHJhdGlvbih0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge05hbWVkTm9kZU1hcH0gYXR0cmlidXRlc1xuICogQHJldHVybnMge3t9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXR0cmlidXRlX3RvX29iamVjdChhdHRyaWJ1dGVzKSB7XG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVzKSB7XG5cdFx0cmVzdWx0W2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5jb25zdCBlc2NhcGVkID0ge1xuXHQnXCInOiAnJnF1b3Q7Jyxcblx0JyYnOiAnJmFtcDsnLFxuXHQnPCc6ICcmbHQ7J1xufTtcblxuY29uc3QgcmVnZXhfYXR0cmlidXRlX2NoYXJhY3RlcnNfdG9fZXNjYXBlID0gL1tcIiY8XS9nO1xuXG4vKipcbiAqIE5vdGUgdGhhdCB0aGUgYXR0cmlidXRlIGl0c2VsZiBzaG91bGQgYmUgc3Vycm91bmRlZCBpbiBkb3VibGUgcXVvdGVzXG4gKiBAcGFyYW0ge2FueX0gYXR0cmlidXRlXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZV9hdHRyaWJ1dGUoYXR0cmlidXRlKSB7XG5cdHJldHVybiBTdHJpbmcoYXR0cmlidXRlKS5yZXBsYWNlKHJlZ2V4X2F0dHJpYnV0ZV9jaGFyYWN0ZXJzX3RvX2VzY2FwZSwgKG1hdGNoKSA9PiBlc2NhcGVkW21hdGNoXSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+fSBhdHRyaWJ1dGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlfc3ByZWFkKGF0dHJpYnV0ZXMpIHtcblx0bGV0IHN0ciA9ICcgJztcblx0Zm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdGlmIChhdHRyaWJ1dGVzW2tleV0gIT0gbnVsbCkge1xuXHRcdFx0c3RyICs9IGAke2tleX09XCIke2VzY2FwZV9hdHRyaWJ1dGUoYXR0cmlidXRlc1trZXldKX1cIiBgO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdHI7XG59XG5cbi8qKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybnMge3t9fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2N1c3RvbV9lbGVtZW50c19zbG90cyhlbGVtZW50KSB7XG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRlbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaChcblx0XHQvKiogQHBhcmFtIHtFbGVtZW50fSBub2RlICovIChub2RlKSA9PiB7XG5cdFx0XHRyZXN1bHRbbm9kZS5zbG90IHx8ICdkZWZhdWx0J10gPSB0cnVlO1xuXHRcdH1cblx0KTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN0cnVjdF9zdmVsdGVfY29tcG9uZW50KGNvbXBvbmVudCwgcHJvcHMpIHtcblx0cmV0dXJuIG5ldyBjb21wb25lbnQocHJvcHMpO1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIHtOb2RlICYge1xuICogXHRjbGFpbV9vcmRlcj86IG51bWJlcjtcbiAqIFx0aHlkcmF0ZV9pbml0PzogdHJ1ZTtcbiAqIFx0YWN0dWFsX2VuZF9jaGlsZD86IE5vZGVFeDtcbiAqIFx0Y2hpbGROb2RlczogTm9kZUxpc3RPZjxOb2RlRXg+O1xuICogfX0gTm9kZUV4XG4gKi9cblxuLyoqIEB0eXBlZGVmIHtDaGlsZE5vZGUgJiBOb2RlRXh9IENoaWxkTm9kZUV4ICovXG5cbi8qKiBAdHlwZWRlZiB7Tm9kZUV4ICYgeyBjbGFpbV9vcmRlcjogbnVtYmVyIH19IE5vZGVFeDIgKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7Q2hpbGROb2RlRXhbXSAmIHtcbiAqIFx0Y2xhaW1faW5mbz86IHtcbiAqIFx0XHRsYXN0X2luZGV4OiBudW1iZXI7XG4gKiBcdFx0dG90YWxfY2xhaW1lZDogbnVtYmVyO1xuICogXHR9O1xuICogfX0gQ2hpbGROb2RlQXJyYXlcbiAqL1xuIiwgImltcG9ydCB7IGN1c3RvbV9ldmVudCB9IGZyb20gJy4vZG9tLmpzJztcblxuZXhwb3J0IGxldCBjdXJyZW50X2NvbXBvbmVudDtcblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpIHtcblx0Y3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG5cdGlmICghY3VycmVudF9jb21wb25lbnQpIHRocm93IG5ldyBFcnJvcignRnVuY3Rpb24gY2FsbGVkIG91dHNpZGUgY29tcG9uZW50IGluaXRpYWxpemF0aW9uJyk7XG5cdHJldHVybiBjdXJyZW50X2NvbXBvbmVudDtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byBydW4gaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBjb21wb25lbnQgaXMgdXBkYXRlZCBhZnRlciBhbnkgc3RhdGUgY2hhbmdlLlxuICpcbiAqIFRoZSBmaXJzdCB0aW1lIHRoZSBjYWxsYmFjayBydW5zIHdpbGwgYmUgYmVmb3JlIHRoZSBpbml0aWFsIGBvbk1vdW50YFxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNiZWZvcmV1cGRhdGVcbiAqIEBwYXJhbSB7KCkgPT4gYW55fSBmblxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcblx0Z2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYmVmb3JlX3VwZGF0ZS5wdXNoKGZuKTtcbn1cblxuLyoqXG4gKiBUaGUgYG9uTW91bnRgIGZ1bmN0aW9uIHNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBhcyBzb29uIGFzIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gbW91bnRlZCB0byB0aGUgRE9NLlxuICogSXQgbXVzdCBiZSBjYWxsZWQgZHVyaW5nIHRoZSBjb21wb25lbnQncyBpbml0aWFsaXNhdGlvbiAoYnV0IGRvZXNuJ3QgbmVlZCB0byBsaXZlICppbnNpZGUqIHRoZSBjb21wb25lbnQ7XG4gKiBpdCBjYW4gYmUgY2FsbGVkIGZyb20gYW4gZXh0ZXJuYWwgbW9kdWxlKS5cbiAqXG4gKiBJZiBhIGZ1bmN0aW9uIGlzIHJldHVybmVkIF9zeW5jaHJvbm91c2x5XyBmcm9tIGBvbk1vdW50YCwgaXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIHVubW91bnRlZC5cbiAqXG4gKiBgb25Nb3VudGAgZG9lcyBub3QgcnVuIGluc2lkZSBhIFtzZXJ2ZXItc2lkZSBjb21wb25lbnRdKGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXNlcnZlci1zaWRlLWNvbXBvbmVudC1hcGkpLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNvbm1vdW50XG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHsoKSA9PiBpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLk5vdEZ1bmN0aW9uPFQ+IHwgUHJvbWlzZTxpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLk5vdEZ1bmN0aW9uPFQ+PiB8ICgoKSA9PiBhbnkpfSBmblxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbk1vdW50KGZuKSB7XG5cdGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX21vdW50LnB1c2goZm4pO1xufVxuXG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBpbW1lZGlhdGVseSBhZnRlciB0aGUgY29tcG9uZW50IGhhcyBiZWVuIHVwZGF0ZWQuXG4gKlxuICogVGhlIGZpcnN0IHRpbWUgdGhlIGNhbGxiYWNrIHJ1bnMgd2lsbCBiZSBhZnRlciB0aGUgaW5pdGlhbCBgb25Nb3VudGBcbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUjYWZ0ZXJ1cGRhdGVcbiAqIEBwYXJhbSB7KCkgPT4gYW55fSBmblxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuXHRnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5hZnRlcl91cGRhdGUucHVzaChmbik7XG59XG5cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIHVubW91bnRlZC5cbiAqXG4gKiBPdXQgb2YgYG9uTW91bnRgLCBgYmVmb3JlVXBkYXRlYCwgYGFmdGVyVXBkYXRlYCBhbmQgYG9uRGVzdHJveWAsIHRoaXMgaXMgdGhlXG4gKiBvbmx5IG9uZSB0aGF0IHJ1bnMgaW5zaWRlIGEgc2VydmVyLXNpZGUgY29tcG9uZW50LlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNvbmRlc3Ryb3lcbiAqIEBwYXJhbSB7KCkgPT4gYW55fSBmblxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbkRlc3Ryb3koZm4pIHtcblx0Z2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fZGVzdHJveS5wdXNoKGZuKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGV2ZW50IGRpc3BhdGNoZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBkaXNwYXRjaCBbY29tcG9uZW50IGV2ZW50c10oaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjdGVtcGxhdGUtc3ludGF4LWNvbXBvbmVudC1kaXJlY3RpdmVzLW9uLWV2ZW50bmFtZSkuXG4gKiBFdmVudCBkaXNwYXRjaGVycyBhcmUgZnVuY3Rpb25zIHRoYXQgY2FuIHRha2UgdHdvIGFyZ3VtZW50czogYG5hbWVgIGFuZCBgZGV0YWlsYC5cbiAqXG4gKiBDb21wb25lbnQgZXZlbnRzIGNyZWF0ZWQgd2l0aCBgY3JlYXRlRXZlbnREaXNwYXRjaGVyYCBjcmVhdGUgYVxuICogW0N1c3RvbUV2ZW50XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQpLlxuICogVGhlc2UgZXZlbnRzIGRvIG5vdCBbYnViYmxlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvQnVpbGRpbmdfYmxvY2tzL0V2ZW50cyNFdmVudF9idWJibGluZ19hbmRfY2FwdHVyZSkuXG4gKiBUaGUgYGRldGFpbGAgYXJndW1lbnQgY29ycmVzcG9uZHMgdG8gdGhlIFtDdXN0b21FdmVudC5kZXRhaWxdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9kZXRhaWwpXG4gKiBwcm9wZXJ0eSBhbmQgY2FuIGNvbnRhaW4gYW55IHR5cGUgb2YgZGF0YS5cbiAqXG4gKiBUaGUgZXZlbnQgZGlzcGF0Y2hlciBjYW4gYmUgdHlwZWQgdG8gbmFycm93IHRoZSBhbGxvd2VkIGV2ZW50IG5hbWVzIGFuZCB0aGUgdHlwZSBvZiB0aGUgYGRldGFpbGAgYXJndW1lbnQ6XG4gKiBgYGB0c1xuICogY29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXI8e1xuICogIGxvYWRlZDogbmV2ZXI7IC8vIGRvZXMgbm90IHRha2UgYSBkZXRhaWwgYXJndW1lbnRcbiAqICBjaGFuZ2U6IHN0cmluZzsgLy8gdGFrZXMgYSBkZXRhaWwgYXJndW1lbnQgb2YgdHlwZSBzdHJpbmcsIHdoaWNoIGlzIHJlcXVpcmVkXG4gKiAgb3B0aW9uYWw6IG51bWJlciB8IG51bGw7IC8vIHRha2VzIGFuIG9wdGlvbmFsIGRldGFpbCBhcmd1bWVudCBvZiB0eXBlIG51bWJlclxuICogfT4oKTtcbiAqIGBgYFxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNjcmVhdGVldmVudGRpc3BhdGNoZXJcbiAqIEB0ZW1wbGF0ZSB7UmVjb3JkPHN0cmluZywgYW55Pn0gW0V2ZW50TWFwPWFueV1cbiAqIEByZXR1cm5zIHtpbXBvcnQoJy4vcHVibGljLmpzJykuRXZlbnREaXNwYXRjaGVyPEV2ZW50TWFwPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpIHtcblx0Y29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG5cdHJldHVybiAodHlwZSwgZGV0YWlsLCB7IGNhbmNlbGFibGUgPSBmYWxzZSB9ID0ge30pID0+IHtcblx0XHRjb25zdCBjYWxsYmFja3MgPSBjb21wb25lbnQuJCQuY2FsbGJhY2tzW3R5cGVdO1xuXHRcdGlmIChjYWxsYmFja3MpIHtcblx0XHRcdC8vIFRPRE8gYXJlIHRoZXJlIHNpdHVhdGlvbnMgd2hlcmUgZXZlbnRzIGNvdWxkIGJlIGRpc3BhdGNoZWRcblx0XHRcdC8vIGluIGEgc2VydmVyIChub24tRE9NKSBlbnZpcm9ubWVudD9cblx0XHRcdGNvbnN0IGV2ZW50ID0gY3VzdG9tX2V2ZW50KC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAodHlwZSksIGRldGFpbCwgeyBjYW5jZWxhYmxlIH0pO1xuXHRcdFx0Y2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaCgoZm4pID0+IHtcblx0XHRcdFx0Zm4uY2FsbChjb21wb25lbnQsIGV2ZW50KTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuICFldmVudC5kZWZhdWx0UHJldmVudGVkO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcbn1cblxuLyoqXG4gKiBBc3NvY2lhdGVzIGFuIGFyYml0cmFyeSBgY29udGV4dGAgb2JqZWN0IHdpdGggdGhlIGN1cnJlbnQgY29tcG9uZW50IGFuZCB0aGUgc3BlY2lmaWVkIGBrZXlgXG4gKiBhbmQgcmV0dXJucyB0aGF0IG9iamVjdC4gVGhlIGNvbnRleHQgaXMgdGhlbiBhdmFpbGFibGUgdG8gY2hpbGRyZW4gb2YgdGhlIGNvbXBvbmVudFxuICogKGluY2x1ZGluZyBzbG90dGVkIGNvbnRlbnQpIHdpdGggYGdldENvbnRleHRgLlxuICpcbiAqIExpa2UgbGlmZWN5Y2xlIGZ1bmN0aW9ucywgdGhpcyBtdXN0IGJlIGNhbGxlZCBkdXJpbmcgY29tcG9uZW50IGluaXRpYWxpc2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNzZXRjb250ZXh0XG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IGtleVxuICogQHBhcmFtIHtUfSBjb250ZXh0XG4gKiBAcmV0dXJucyB7VH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG5cdGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQuc2V0KGtleSwgY29udGV4dCk7XG5cdHJldHVybiBjb250ZXh0O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY29udGV4dCB0aGF0IGJlbG9uZ3MgdG8gdGhlIGNsb3Nlc3QgcGFyZW50IGNvbXBvbmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgYGtleWAuXG4gKiBNdXN0IGJlIGNhbGxlZCBkdXJpbmcgY29tcG9uZW50IGluaXRpYWxpc2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNnZXRjb250ZXh0XG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHthbnl9IGtleVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0KGtleSkge1xuXHRyZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHdob2xlIGNvbnRleHQgbWFwIHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50LlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi4gVXNlZnVsLCBmb3IgZXhhbXBsZSwgaWYgeW91XG4gKiBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZSBhIGNvbXBvbmVudCBhbmQgd2FudCB0byBwYXNzIHRoZSBleGlzdGluZyBjb250ZXh0IHRvIGl0LlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZSNnZXRhbGxjb250ZXh0c1xuICogQHRlbXBsYXRlIHtNYXA8YW55LCBhbnk+fSBbVD1NYXA8YW55LCBhbnk+XVxuICogQHJldHVybnMge1R9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbGxDb250ZXh0cygpIHtcblx0cmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBga2V5YCBoYXMgYmVlbiBzZXQgaW4gdGhlIGNvbnRleHQgb2YgYSBwYXJlbnQgY29tcG9uZW50LlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUjaGFzY29udGV4dFxuICogQHBhcmFtIHthbnl9IGtleVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuXHRyZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5oYXMoa2V5KTtcbn1cblxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbi8qKlxuICogQHBhcmFtIGNvbXBvbmVudFxuICogQHBhcmFtIGV2ZW50XG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG5cdGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG5cdGlmIChjYWxsYmFja3MpIHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaCgoZm4pID0+IGZuLmNhbGwodGhpcywgZXZlbnQpKTtcblx0fVxufVxuIiwgImltcG9ydCB7IHJ1bl9hbGwgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7IGN1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VycmVudF9jb21wb25lbnQgfSBmcm9tICcuL2xpZmVjeWNsZS5qcyc7XG5cbmV4cG9ydCBjb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5leHBvcnQgY29uc3QgaW50cm9zID0geyBlbmFibGVkOiBmYWxzZSB9O1xuZXhwb3J0IGNvbnN0IGJpbmRpbmdfY2FsbGJhY2tzID0gW107XG5cbmxldCByZW5kZXJfY2FsbGJhY2tzID0gW107XG5cbmNvbnN0IGZsdXNoX2NhbGxiYWNrcyA9IFtdO1xuXG5jb25zdCByZXNvbHZlZF9wcm9taXNlID0gLyogQF9fUFVSRV9fICovIFByb21pc2UucmVzb2x2ZSgpO1xuXG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuXG4vKiogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuXHRpZiAoIXVwZGF0ZV9zY2hlZHVsZWQpIHtcblx0XHR1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcblx0XHRyZXNvbHZlZF9wcm9taXNlLnRoZW4oZmx1c2gpO1xuXHR9XG59XG5cbi8qKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gKi9cbmV4cG9ydCBmdW5jdGlvbiB0aWNrKCkge1xuXHRzY2hlZHVsZV91cGRhdGUoKTtcblx0cmV0dXJuIHJlc29sdmVkX3Byb21pc2U7XG59XG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRfcmVuZGVyX2NhbGxiYWNrKGZuKSB7XG5cdHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcblx0Zmx1c2hfY2FsbGJhY2tzLnB1c2goZm4pO1xufVxuXG4vLyBmbHVzaCgpIGNhbGxzIGNhbGxiYWNrcyBpbiB0aGlzIG9yZGVyOlxuLy8gMS4gQWxsIGJlZm9yZVVwZGF0ZSBjYWxsYmFja3MsIGluIG9yZGVyOiBwYXJlbnRzIGJlZm9yZSBjaGlsZHJlblxuLy8gMi4gQWxsIGJpbmQ6dGhpcyBjYWxsYmFja3MsIGluIHJldmVyc2Ugb3JkZXI6IGNoaWxkcmVuIGJlZm9yZSBwYXJlbnRzLlxuLy8gMy4gQWxsIGFmdGVyVXBkYXRlIGNhbGxiYWNrcywgaW4gb3JkZXI6IHBhcmVudHMgYmVmb3JlIGNoaWxkcmVuLiBFWENFUFRcbi8vICAgIGZvciBhZnRlclVwZGF0ZXMgY2FsbGVkIGR1cmluZyB0aGUgaW5pdGlhbCBvbk1vdW50LCB3aGljaCBhcmUgY2FsbGVkIGluXG4vLyAgICByZXZlcnNlIG9yZGVyOiBjaGlsZHJlbiBiZWZvcmUgcGFyZW50cy5cbi8vIFNpbmNlIGNhbGxiYWNrcyBtaWdodCB1cGRhdGUgY29tcG9uZW50IHZhbHVlcywgd2hpY2ggY291bGQgdHJpZ2dlciBhbm90aGVyXG4vLyBjYWxsIHRvIGZsdXNoKCksIHRoZSBmb2xsb3dpbmcgc3RlcHMgZ3VhcmQgYWdhaW5zdCB0aGlzOlxuLy8gMS4gRHVyaW5nIGJlZm9yZVVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuLy8gICAgZGlydHlfY29tcG9uZW50cyBhcnJheSBhbmQgd2lsbCBjYXVzZSBhIHJlZW50cmFudCBjYWxsIHRvIGZsdXNoKCkuIEJlY2F1c2Vcbi8vICAgIHRoZSBmbHVzaCBpbmRleCBpcyBrZXB0IG91dHNpZGUgdGhlIGZ1bmN0aW9uLCB0aGUgcmVlbnRyYW50IGNhbGwgd2lsbCBwaWNrXG4vLyAgICB1cCB3aGVyZSB0aGUgZWFybGllciBjYWxsIGxlZnQgb2ZmIGFuZCBnbyB0aHJvdWdoIGFsbCBkaXJ0eSBjb21wb25lbnRzLiBUaGVcbi8vICAgIGN1cnJlbnRfY29tcG9uZW50IHZhbHVlIGlzIHNhdmVkIGFuZCByZXN0b3JlZCBzbyB0aGF0IHRoZSByZWVudHJhbnQgY2FsbCB3aWxsXG4vLyAgICBub3QgaW50ZXJmZXJlIHdpdGggdGhlIFwicGFyZW50XCIgZmx1c2goKSBjYWxsLlxuLy8gMi4gYmluZDp0aGlzIGNhbGxiYWNrcyBjYW5ub3QgdHJpZ2dlciBuZXcgZmx1c2goKSBjYWxscy5cbi8vIDMuIER1cmluZyBhZnRlclVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIE5PVCBoYXZlIHRoZWlyIGFmdGVyVXBkYXRlXG4vLyAgICBjYWxsYmFjayBjYWxsZWQgYSBzZWNvbmQgdGltZTsgdGhlIHNlZW5fY2FsbGJhY2tzIHNldCwgb3V0c2lkZSB0aGUgZmx1c2goKVxuLy8gICAgZnVuY3Rpb24sIGd1YXJhbnRlZXMgdGhpcyBiZWhhdmlvci5cbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xuXG5sZXQgZmx1c2hpZHggPSAwOyAvLyBEbyAqbm90KiBtb3ZlIHRoaXMgaW5zaWRlIHRoZSBmbHVzaCgpIGZ1bmN0aW9uXG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaCgpIHtcblx0Ly8gRG8gbm90IHJlZW50ZXIgZmx1c2ggd2hpbGUgZGlydHkgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgYXMgdGhpcyBjYW5cblx0Ly8gcmVzdWx0IGluIGFuIGluZmluaXRlIGxvb3AuIEluc3RlYWQsIGxldCB0aGUgaW5uZXIgZmx1c2ggaGFuZGxlIGl0LlxuXHQvLyBSZWVudHJhbmN5IGlzIG9rIGFmdGVyd2FyZHMgZm9yIGJpbmRpbmdzIGV0Yy5cblx0aWYgKGZsdXNoaWR4ICE9PSAwKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdGNvbnN0IHNhdmVkX2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuXHRkbyB7XG5cdFx0Ly8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuXHRcdC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuXHRcdHRyeSB7XG5cdFx0XHR3aGlsZSAoZmx1c2hpZHggPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBjb21wb25lbnQgPSBkaXJ0eV9jb21wb25lbnRzW2ZsdXNoaWR4XTtcblx0XHRcdFx0Zmx1c2hpZHgrKztcblx0XHRcdFx0c2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG5cdFx0XHRcdHVwZGF0ZShjb21wb25lbnQuJCQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIHJlc2V0IGRpcnR5IHN0YXRlIHRvIG5vdCBlbmQgdXAgaW4gYSBkZWFkbG9ja2VkIHN0YXRlIGFuZCB0aGVuIHJldGhyb3dcblx0XHRcdGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcblx0XHRcdGZsdXNoaWR4ID0gMDtcblx0XHRcdHRocm93IGU7XG5cdFx0fVxuXHRcdHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcblx0XHRkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCA9IDA7XG5cdFx0Zmx1c2hpZHggPSAwO1xuXHRcdHdoaWxlIChiaW5kaW5nX2NhbGxiYWNrcy5sZW5ndGgpIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG5cdFx0Ly8gdGhlbiwgb25jZSBjb21wb25lbnRzIGFyZSB1cGRhdGVkLCBjYWxsXG5cdFx0Ly8gYWZ0ZXJVcGRhdGUgZnVuY3Rpb25zLiBUaGlzIG1heSBjYXVzZVxuXHRcdC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0Y29uc3QgY2FsbGJhY2sgPSByZW5kZXJfY2FsbGJhY2tzW2ldO1xuXHRcdFx0aWYgKCFzZWVuX2NhbGxiYWNrcy5oYXMoY2FsbGJhY2spKSB7XG5cdFx0XHRcdC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcblx0XHRcdFx0c2Vlbl9jYWxsYmFja3MuYWRkKGNhbGxiYWNrKTtcblx0XHRcdFx0Y2FsbGJhY2soKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuXHR9IHdoaWxlIChkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCk7XG5cdHdoaWxlIChmbHVzaF9jYWxsYmFja3MubGVuZ3RoKSB7XG5cdFx0Zmx1c2hfY2FsbGJhY2tzLnBvcCgpKCk7XG5cdH1cblx0dXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuXHRzZWVuX2NhbGxiYWNrcy5jbGVhcigpO1xuXHRzZXRfY3VycmVudF9jb21wb25lbnQoc2F2ZWRfY29tcG9uZW50KTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZnVuY3Rpb24gdXBkYXRlKCQkKSB7XG5cdGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuXHRcdCQkLnVwZGF0ZSgpO1xuXHRcdHJ1bl9hbGwoJCQuYmVmb3JlX3VwZGF0ZSk7XG5cdFx0Y29uc3QgZGlydHkgPSAkJC5kaXJ0eTtcblx0XHQkJC5kaXJ0eSA9IFstMV07XG5cdFx0JCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQucCgkJC5jdHgsIGRpcnR5KTtcblx0XHQkJC5hZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcblx0fVxufVxuXG4vKipcbiAqIFVzZWZ1bCBmb3IgZXhhbXBsZSB0byBleGVjdXRlIHJlbWFpbmluZyBgYWZ0ZXJVcGRhdGVgIGNhbGxiYWNrcyBiZWZvcmUgZXhlY3V0aW5nIGBkZXN0cm95YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb25bXX0gZm5zXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsdXNoX3JlbmRlcl9jYWxsYmFja3MoZm5zKSB7XG5cdGNvbnN0IGZpbHRlcmVkID0gW107XG5cdGNvbnN0IHRhcmdldHMgPSBbXTtcblx0cmVuZGVyX2NhbGxiYWNrcy5mb3JFYWNoKChjKSA9PiAoZm5zLmluZGV4T2YoYykgPT09IC0xID8gZmlsdGVyZWQucHVzaChjKSA6IHRhcmdldHMucHVzaChjKSkpO1xuXHR0YXJnZXRzLmZvckVhY2goKGMpID0+IGMoKSk7XG5cdHJlbmRlcl9jYWxsYmFja3MgPSBmaWx0ZXJlZDtcbn1cbiIsICJpbXBvcnQgeyBpZGVudGl0eSBhcyBsaW5lYXIsIGlzX2Z1bmN0aW9uLCBub29wLCBydW5fYWxsIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBub3cgfSBmcm9tICcuL2Vudmlyb25tZW50LmpzJztcbmltcG9ydCB7IGxvb3AgfSBmcm9tICcuL2xvb3AuanMnO1xuaW1wb3J0IHsgY3JlYXRlX3J1bGUsIGRlbGV0ZV9ydWxlIH0gZnJvbSAnLi9zdHlsZV9tYW5hZ2VyLmpzJztcbmltcG9ydCB7IGN1c3RvbV9ldmVudCB9IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IGFkZF9yZW5kZXJfY2FsbGJhY2sgfSBmcm9tICcuL3NjaGVkdWxlci5qcyc7XG5cbi8qKlxuICogQHR5cGUge1Byb21pc2U8dm9pZD4gfCBudWxsfVxuICovXG5sZXQgcHJvbWlzZTtcblxuLyoqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAqL1xuZnVuY3Rpb24gd2FpdCgpIHtcblx0aWYgKCFwcm9taXNlKSB7XG5cdFx0cHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdHByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRwcm9taXNlID0gbnVsbDtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gcHJvbWlzZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7SU5UUk8gfCBPVVRSTyB8IGJvb2xlYW59IGRpcmVjdGlvblxuICogQHBhcmFtIHsnc3RhcnQnIHwgJ2VuZCd9IGtpbmRcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBkaXNwYXRjaChub2RlLCBkaXJlY3Rpb24sIGtpbmQpIHtcblx0bm9kZS5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudChgJHtkaXJlY3Rpb24gPyAnaW50cm8nIDogJ291dHJvJ30ke2tpbmR9YCkpO1xufVxuXG5jb25zdCBvdXRyb2luZyA9IG5ldyBTZXQoKTtcblxuLyoqXG4gKiBAdHlwZSB7T3V0cm99XG4gKi9cbmxldCBvdXRyb3M7XG5cbi8qKlxuICogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBfb3V0cm9zKCkge1xuXHRvdXRyb3MgPSB7XG5cdFx0cjogMCxcblx0XHRjOiBbXSxcblx0XHRwOiBvdXRyb3MgLy8gcGFyZW50IGdyb3VwXG5cdH07XG59XG5cbi8qKlxuICogQHJldHVybnMge3ZvaWR9ICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tfb3V0cm9zKCkge1xuXHRpZiAoIW91dHJvcy5yKSB7XG5cdFx0cnVuX2FsbChvdXRyb3MuYyk7XG5cdH1cblx0b3V0cm9zID0gb3V0cm9zLnA7XG59XG5cbi8qKlxuICogQHBhcmFtIHtpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLkZyYWdtZW50fSBibG9ja1xuICogQHBhcmFtIHswIHwgMX0gW2xvY2FsXVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uX2luKGJsb2NrLCBsb2NhbCkge1xuXHRpZiAoYmxvY2sgJiYgYmxvY2suaSkge1xuXHRcdG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG5cdFx0YmxvY2suaShsb2NhbCk7XG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge2ltcG9ydCgnLi9wcml2YXRlLmpzJykuRnJhZ21lbnR9IGJsb2NrXG4gKiBAcGFyYW0gezAgfCAxfSBsb2NhbFxuICogQHBhcmFtIHswIHwgMX0gW2RldGFjaF1cbiAqIEBwYXJhbSB7KCkgPT4gdm9pZH0gW2NhbGxiYWNrXVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uX291dChibG9jaywgbG9jYWwsIGRldGFjaCwgY2FsbGJhY2spIHtcblx0aWYgKGJsb2NrICYmIGJsb2NrLm8pIHtcblx0XHRpZiAob3V0cm9pbmcuaGFzKGJsb2NrKSkgcmV0dXJuO1xuXHRcdG91dHJvaW5nLmFkZChibG9jayk7XG5cdFx0b3V0cm9zLmMucHVzaCgoKSA9PiB7XG5cdFx0XHRvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuXHRcdFx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0XHRcdGlmIChkZXRhY2gpIGJsb2NrLmQoMSk7XG5cdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0YmxvY2subyhsb2NhbCk7XG5cdH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcblx0XHRjYWxsYmFjaygpO1xuXHR9XG59XG5cbi8qKlxuICogQHR5cGUge2ltcG9ydCgnLi4vdHJhbnNpdGlvbi9wdWJsaWMuanMnKS5UcmFuc2l0aW9uQ29uZmlnfVxuICovXG5jb25zdCBudWxsX3RyYW5zaXRpb24gPSB7IGR1cmF0aW9uOiAwIH07XG5cbi8qKlxuICogQHBhcmFtIHtFbGVtZW50ICYgRWxlbWVudENTU0lubGluZVN0eWxlfSBub2RlXG4gKiBAcGFyYW0ge1RyYW5zaXRpb25Gbn0gZm5cbiAqIEBwYXJhbSB7YW55fSBwYXJhbXNcbiAqIEByZXR1cm5zIHt7IHN0YXJ0KCk6IHZvaWQ7IGludmFsaWRhdGUoKTogdm9pZDsgZW5kKCk6IHZvaWQ7IH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfaW5fdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG5cdC8qKlxuXHQgKiBAdHlwZSB7VHJhbnNpdGlvbk9wdGlvbnN9ICovXG5cdGNvbnN0IG9wdGlvbnMgPSB7IGRpcmVjdGlvbjogJ2luJyB9O1xuXHRsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zLCBvcHRpb25zKTtcblx0bGV0IHJ1bm5pbmcgPSBmYWxzZTtcblx0bGV0IGFuaW1hdGlvbl9uYW1lO1xuXHRsZXQgdGFzaztcblx0bGV0IHVpZCA9IDA7XG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt2b2lkfSAqL1xuXHRmdW5jdGlvbiBjbGVhbnVwKCkge1xuXHRcdGlmIChhbmltYXRpb25fbmFtZSkgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt2b2lkfSAqL1xuXHRmdW5jdGlvbiBnbygpIHtcblx0XHRjb25zdCB7XG5cdFx0XHRkZWxheSA9IDAsXG5cdFx0XHRkdXJhdGlvbiA9IDMwMCxcblx0XHRcdGVhc2luZyA9IGxpbmVhcixcblx0XHRcdHRpY2sgPSBub29wLFxuXHRcdFx0Y3NzXG5cdFx0fSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG5cdFx0aWYgKGNzcykgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzLCB1aWQrKyk7XG5cdFx0dGljaygwLCAxKTtcblx0XHRjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcblx0XHRjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcblx0XHRpZiAodGFzaykgdGFzay5hYm9ydCgpO1xuXHRcdHJ1bm5pbmcgPSB0cnVlO1xuXHRcdGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ3N0YXJ0JykpO1xuXHRcdHRhc2sgPSBsb29wKChub3cpID0+IHtcblx0XHRcdGlmIChydW5uaW5nKSB7XG5cdFx0XHRcdGlmIChub3cgPj0gZW5kX3RpbWUpIHtcblx0XHRcdFx0XHR0aWNrKDEsIDApO1xuXHRcdFx0XHRcdGRpc3BhdGNoKG5vZGUsIHRydWUsICdlbmQnKTtcblx0XHRcdFx0XHRjbGVhbnVwKCk7XG5cdFx0XHRcdFx0cmV0dXJuIChydW5uaW5nID0gZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChub3cgPj0gc3RhcnRfdGltZSkge1xuXHRcdFx0XHRcdGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuXHRcdFx0XHRcdHRpY2sodCwgMSAtIHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcnVubmluZztcblx0XHR9KTtcblx0fVxuXHRsZXQgc3RhcnRlZCA9IGZhbHNlO1xuXHRyZXR1cm4ge1xuXHRcdHN0YXJ0KCkge1xuXHRcdFx0aWYgKHN0YXJ0ZWQpIHJldHVybjtcblx0XHRcdHN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0ZGVsZXRlX3J1bGUobm9kZSk7XG5cdFx0XHRpZiAoaXNfZnVuY3Rpb24oY29uZmlnKSkge1xuXHRcdFx0XHRjb25maWcgPSBjb25maWcob3B0aW9ucyk7XG5cdFx0XHRcdHdhaXQoKS50aGVuKGdvKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdvKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpbnZhbGlkYXRlKCkge1xuXHRcdFx0c3RhcnRlZCA9IGZhbHNlO1xuXHRcdH0sXG5cdFx0ZW5kKCkge1xuXHRcdFx0aWYgKHJ1bm5pbmcpIHtcblx0XHRcdFx0Y2xlYW51cCgpO1xuXHRcdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7RWxlbWVudCAmIEVsZW1lbnRDU1NJbmxpbmVTdHlsZX0gbm9kZVxuICogQHBhcmFtIHtUcmFuc2l0aW9uRm59IGZuXG4gKiBAcGFyYW0ge2FueX0gcGFyYW1zXG4gKiBAcmV0dXJucyB7eyBlbmQocmVzZXQ6IGFueSk6IHZvaWQ7IH19XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfb3V0X3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcykge1xuXHQvKiogQHR5cGUge1RyYW5zaXRpb25PcHRpb25zfSAqL1xuXHRjb25zdCBvcHRpb25zID0geyBkaXJlY3Rpb246ICdvdXQnIH07XG5cdGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMsIG9wdGlvbnMpO1xuXHRsZXQgcnVubmluZyA9IHRydWU7XG5cdGxldCBhbmltYXRpb25fbmFtZTtcblx0Y29uc3QgZ3JvdXAgPSBvdXRyb3M7XG5cdGdyb3VwLnIgKz0gMTtcblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRsZXQgb3JpZ2luYWxfaW5lcnRfdmFsdWU7XG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt2b2lkfSAqL1xuXHRmdW5jdGlvbiBnbygpIHtcblx0XHRjb25zdCB7XG5cdFx0XHRkZWxheSA9IDAsXG5cdFx0XHRkdXJhdGlvbiA9IDMwMCxcblx0XHRcdGVhc2luZyA9IGxpbmVhcixcblx0XHRcdHRpY2sgPSBub29wLFxuXHRcdFx0Y3NzXG5cdFx0fSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG5cblx0XHRpZiAoY3NzKSBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuXG5cdFx0Y29uc3Qgc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXk7XG5cdFx0Y29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG5cdFx0YWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuXG5cdFx0aWYgKCdpbmVydCcgaW4gbm9kZSkge1xuXHRcdFx0b3JpZ2luYWxfaW5lcnRfdmFsdWUgPSAvKiogQHR5cGUge0hUTUxFbGVtZW50fSAqLyAobm9kZSkuaW5lcnQ7XG5cdFx0XHRub2RlLmluZXJ0ID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRsb29wKChub3cpID0+IHtcblx0XHRcdGlmIChydW5uaW5nKSB7XG5cdFx0XHRcdGlmIChub3cgPj0gZW5kX3RpbWUpIHtcblx0XHRcdFx0XHR0aWNrKDAsIDEpO1xuXHRcdFx0XHRcdGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG5cdFx0XHRcdFx0aWYgKCEtLWdyb3VwLnIpIHtcblx0XHRcdFx0XHRcdC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG5cdFx0XHRcdFx0XHQvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcblx0XHRcdFx0XHRcdHJ1bl9hbGwoZ3JvdXAuYyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcblx0XHRcdFx0XHRjb25zdCB0ID0gZWFzaW5nKChub3cgLSBzdGFydF90aW1lKSAvIGR1cmF0aW9uKTtcblx0XHRcdFx0XHR0aWNrKDEgLSB0LCB0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJ1bm5pbmc7XG5cdFx0fSk7XG5cdH1cblxuXHRpZiAoaXNfZnVuY3Rpb24oY29uZmlnKSkge1xuXHRcdHdhaXQoKS50aGVuKCgpID0+IHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGNvbmZpZyA9IGNvbmZpZyhvcHRpb25zKTtcblx0XHRcdGdvKCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Z28oKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0ZW5kKHJlc2V0KSB7XG5cdFx0XHRpZiAocmVzZXQgJiYgJ2luZXJ0JyBpbiBub2RlKSB7XG5cdFx0XHRcdG5vZGUuaW5lcnQgPSBvcmlnaW5hbF9pbmVydF92YWx1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuXHRcdFx0XHRjb25maWcudGljaygxLCAwKTtcblx0XHRcdH1cblx0XHRcdGlmIChydW5uaW5nKSB7XG5cdFx0XHRcdGlmIChhbmltYXRpb25fbmFtZSkgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuXHRcdFx0XHRydW5uaW5nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7RWxlbWVudCAmIEVsZW1lbnRDU1NJbmxpbmVTdHlsZX0gbm9kZVxuICogQHBhcmFtIHtUcmFuc2l0aW9uRm59IGZuXG4gKiBAcGFyYW0ge2FueX0gcGFyYW1zXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludHJvXG4gKiBAcmV0dXJucyB7eyBydW4oYjogMCB8IDEpOiB2b2lkOyBlbmQoKTogdm9pZDsgfX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcywgaW50cm8pIHtcblx0LyoqXG5cdCAqIEB0eXBlIHtUcmFuc2l0aW9uT3B0aW9uc30gKi9cblx0Y29uc3Qgb3B0aW9ucyA9IHsgZGlyZWN0aW9uOiAnYm90aCcgfTtcblx0bGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcywgb3B0aW9ucyk7XG5cdGxldCB0ID0gaW50cm8gPyAwIDogMTtcblxuXHQvKipcblx0ICogQHR5cGUge1Byb2dyYW0gfCBudWxsfSAqL1xuXHRsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcblxuXHQvKipcblx0ICogQHR5cGUge1BlbmRpbmdQcm9ncmFtIHwgbnVsbH0gKi9cblx0bGV0IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG5cdGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG5cblx0LyoqIEB0eXBlIHtib29sZWFufSAqL1xuXHRsZXQgb3JpZ2luYWxfaW5lcnRfdmFsdWU7XG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt2b2lkfSAqL1xuXHRmdW5jdGlvbiBjbGVhcl9hbmltYXRpb24oKSB7XG5cdFx0aWYgKGFuaW1hdGlvbl9uYW1lKSBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIHtQZW5kaW5nUHJvZ3JhbX0gcHJvZ3JhbVxuXHQgKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb25cblx0ICogQHJldHVybnMge1Byb2dyYW19XG5cdCAqL1xuXHRmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG5cdFx0Y29uc3QgZCA9IC8qKiBAdHlwZSB7UHJvZ3JhbVsnZCddfSAqLyAocHJvZ3JhbS5iIC0gdCk7XG5cdFx0ZHVyYXRpb24gKj0gTWF0aC5hYnMoZCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGE6IHQsXG5cdFx0XHRiOiBwcm9ncmFtLmIsXG5cdFx0XHRkLFxuXHRcdFx0ZHVyYXRpb24sXG5cdFx0XHRzdGFydDogcHJvZ3JhbS5zdGFydCxcblx0XHRcdGVuZDogcHJvZ3JhbS5zdGFydCArIGR1cmF0aW9uLFxuXHRcdFx0Z3JvdXA6IHByb2dyYW0uZ3JvdXBcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7SU5UUk8gfCBPVVRST30gYlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdGZ1bmN0aW9uIGdvKGIpIHtcblx0XHRjb25zdCB7XG5cdFx0XHRkZWxheSA9IDAsXG5cdFx0XHRkdXJhdGlvbiA9IDMwMCxcblx0XHRcdGVhc2luZyA9IGxpbmVhcixcblx0XHRcdHRpY2sgPSBub29wLFxuXHRcdFx0Y3NzXG5cdFx0fSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG5cblx0XHQvKipcblx0XHQgKiBAdHlwZSB7UGVuZGluZ1Byb2dyYW19ICovXG5cdFx0Y29uc3QgcHJvZ3JhbSA9IHtcblx0XHRcdHN0YXJ0OiBub3coKSArIGRlbGF5LFxuXHRcdFx0YlxuXHRcdH07XG5cblx0XHRpZiAoIWIpIHtcblx0XHRcdC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG5cdFx0XHRwcm9ncmFtLmdyb3VwID0gb3V0cm9zO1xuXHRcdFx0b3V0cm9zLnIgKz0gMTtcblx0XHR9XG5cblx0XHRpZiAoJ2luZXJ0JyBpbiBub2RlKSB7XG5cdFx0XHRpZiAoYikge1xuXHRcdFx0XHRpZiAob3JpZ2luYWxfaW5lcnRfdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdC8vIGFib3J0ZWQvcmV2ZXJzZWQgb3V0cm8gXHUyMDE0IHJlc3RvcmUgcHJldmlvdXMgaW5lcnQgdmFsdWVcblx0XHRcdFx0XHRub2RlLmluZXJ0ID0gb3JpZ2luYWxfaW5lcnRfdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9yaWdpbmFsX2luZXJ0X3ZhbHVlID0gLyoqIEB0eXBlIHtIVE1MRWxlbWVudH0gKi8gKG5vZGUpLmluZXJ0O1xuXHRcdFx0XHRub2RlLmluZXJ0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSkge1xuXHRcdFx0cGVuZGluZ19wcm9ncmFtID0gcHJvZ3JhbTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhpcyBpcyBhbiBpbnRybywgYW5kIHRoZXJlJ3MgYSBkZWxheSwgd2UgbmVlZCB0byBkb1xuXHRcdFx0Ly8gYW4gaW5pdGlhbCB0aWNrIGFuZC9vciBhcHBseSBDU1MgYW5pbWF0aW9uIGltbWVkaWF0ZWx5XG5cdFx0XHRpZiAoY3NzKSB7XG5cdFx0XHRcdGNsZWFyX2FuaW1hdGlvbigpO1xuXHRcdFx0XHRhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGIpIHRpY2soMCwgMSk7XG5cdFx0XHRydW5uaW5nX3Byb2dyYW0gPSBpbml0KHByb2dyYW0sIGR1cmF0aW9uKTtcblx0XHRcdGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgYiwgJ3N0YXJ0JykpO1xuXHRcdFx0bG9vcCgobm93KSA9PiB7XG5cdFx0XHRcdGlmIChwZW5kaW5nX3Byb2dyYW0gJiYgbm93ID4gcGVuZGluZ19wcm9ncmFtLnN0YXJ0KSB7XG5cdFx0XHRcdFx0cnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcblx0XHRcdFx0XHRwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuXHRcdFx0XHRcdGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnc3RhcnQnKTtcblx0XHRcdFx0XHRpZiAoY3NzKSB7XG5cdFx0XHRcdFx0XHRjbGVhcl9hbmltYXRpb24oKTtcblx0XHRcdFx0XHRcdGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUoXG5cdFx0XHRcdFx0XHRcdG5vZGUsXG5cdFx0XHRcdFx0XHRcdHQsXG5cdFx0XHRcdFx0XHRcdHJ1bm5pbmdfcHJvZ3JhbS5iLFxuXHRcdFx0XHRcdFx0XHRydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24sXG5cdFx0XHRcdFx0XHRcdDAsXG5cdFx0XHRcdFx0XHRcdGVhc2luZyxcblx0XHRcdFx0XHRcdFx0Y29uZmlnLmNzc1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJ1bm5pbmdfcHJvZ3JhbSkge1xuXHRcdFx0XHRcdGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuXHRcdFx0XHRcdFx0dGljaygodCA9IHJ1bm5pbmdfcHJvZ3JhbS5iKSwgMSAtIHQpO1xuXHRcdFx0XHRcdFx0ZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdlbmQnKTtcblx0XHRcdFx0XHRcdGlmICghcGVuZGluZ19wcm9ncmFtKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHdlJ3JlIGRvbmVcblx0XHRcdFx0XHRcdFx0aWYgKHJ1bm5pbmdfcHJvZ3JhbS5iKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gaW50cm8gXHUyMDE0IHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRcdFx0Y2xlYXJfYW5pbWF0aW9uKCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gb3V0cm8gXHUyMDE0IG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCEtLXJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5yKSBydW5fYWxsKHJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5jKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cnVubmluZ19wcm9ncmFtID0gbnVsbDtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uc3RhcnQpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHAgPSBub3cgLSBydW5uaW5nX3Byb2dyYW0uc3RhcnQ7XG5cdFx0XHRcdFx0XHR0ID0gcnVubmluZ19wcm9ncmFtLmEgKyBydW5uaW5nX3Byb2dyYW0uZCAqIGVhc2luZyhwIC8gcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uKTtcblx0XHRcdFx0XHRcdHRpY2sodCwgMSAtIHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gISEocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHtcblx0XHRydW4oYikge1xuXHRcdFx0aWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcblx0XHRcdFx0d2FpdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9wdHMgPSB7IGRpcmVjdGlvbjogYiA/ICdpbicgOiAnb3V0JyB9O1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRjb25maWcgPSBjb25maWcob3B0cyk7XG5cdFx0XHRcdFx0Z28oYik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Z28oYik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRlbmQoKSB7XG5cdFx0XHRjbGVhcl9hbmltYXRpb24oKTtcblx0XHRcdHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG5cdFx0fVxuXHR9O1xufVxuXG4vKiogQHR5cGVkZWYgezF9IElOVFJPICovXG4vKiogQHR5cGVkZWYgezB9IE9VVFJPICovXG4vKiogQHR5cGVkZWYge3sgZGlyZWN0aW9uOiAnaW4nIHwgJ291dCcgfCAnYm90aCcgfX0gVHJhbnNpdGlvbk9wdGlvbnMgKi9cbi8qKiBAdHlwZWRlZiB7KG5vZGU6IEVsZW1lbnQsIHBhcmFtczogYW55LCBvcHRpb25zOiBUcmFuc2l0aW9uT3B0aW9ucykgPT4gaW1wb3J0KCcuLi90cmFuc2l0aW9uL3B1YmxpYy5qcycpLlRyYW5zaXRpb25Db25maWd9IFRyYW5zaXRpb25GbiAqL1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IE91dHJvXG4gKiBAcHJvcGVydHkge251bWJlcn0gclxuICogQHByb3BlcnR5IHtGdW5jdGlvbltdfSBjXG4gKiBAcHJvcGVydHkge09iamVjdH0gcFxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gUGVuZGluZ1Byb2dyYW1cbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBzdGFydFxuICogQHByb3BlcnR5IHtJTlRST3xPVVRST30gYlxuICogQHByb3BlcnR5IHtPdXRyb30gW2dyb3VwXVxuICovXG5cbi8qKlxuICogQHR5cGVkZWYge09iamVjdH0gUHJvZ3JhbVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGFcbiAqIEBwcm9wZXJ0eSB7SU5UUk98T1VUUk99IGJcbiAqIEBwcm9wZXJ0eSB7MXwtMX0gZFxuICogQHByb3BlcnR5IHtudW1iZXJ9IGR1cmF0aW9uXG4gKiBAcHJvcGVydHkge251bWJlcn0gc3RhcnRcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBlbmRcbiAqIEBwcm9wZXJ0eSB7T3V0cm99IFtncm91cF1cbiAqL1xuIiwgImltcG9ydCB7XG5cdGFkZF9yZW5kZXJfY2FsbGJhY2ssXG5cdGZsdXNoLFxuXHRmbHVzaF9yZW5kZXJfY2FsbGJhY2tzLFxuXHRzY2hlZHVsZV91cGRhdGUsXG5cdGRpcnR5X2NvbXBvbmVudHNcbn0gZnJvbSAnLi9zY2hlZHVsZXIuanMnO1xuaW1wb3J0IHsgY3VycmVudF9jb21wb25lbnQsIHNldF9jdXJyZW50X2NvbXBvbmVudCB9IGZyb20gJy4vbGlmZWN5Y2xlLmpzJztcbmltcG9ydCB7IGJsYW5rX29iamVjdCwgaXNfZW1wdHksIGlzX2Z1bmN0aW9uLCBydW4sIHJ1bl9hbGwsIG5vb3AgfSBmcm9tICcuL3V0aWxzLmpzJztcbmltcG9ydCB7XG5cdGNoaWxkcmVuLFxuXHRkZXRhY2gsXG5cdHN0YXJ0X2h5ZHJhdGluZyxcblx0ZW5kX2h5ZHJhdGluZyxcblx0Z2V0X2N1c3RvbV9lbGVtZW50c19zbG90cyxcblx0aW5zZXJ0LFxuXHRlbGVtZW50LFxuXHRhdHRyXG59IGZyb20gJy4vZG9tLmpzJztcbmltcG9ydCB7IHRyYW5zaXRpb25faW4gfSBmcm9tICcuL3RyYW5zaXRpb25zLmpzJztcblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmQoY29tcG9uZW50LCBuYW1lLCBjYWxsYmFjaykge1xuXHRjb25zdCBpbmRleCA9IGNvbXBvbmVudC4kJC5wcm9wc1tuYW1lXTtcblx0aWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcblx0XHRjb21wb25lbnQuJCQuYm91bmRbaW5kZXhdID0gY2FsbGJhY2s7XG5cdFx0Y2FsbGJhY2soY29tcG9uZW50LiQkLmN0eFtpbmRleF0pO1xuXHR9XG59XG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVfY29tcG9uZW50KGJsb2NrKSB7XG5cdGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG5cdGJsb2NrICYmIGJsb2NrLmwocGFyZW50X25vZGVzKTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vdW50X2NvbXBvbmVudChjb21wb25lbnQsIHRhcmdldCwgYW5jaG9yKSB7XG5cdGNvbnN0IHsgZnJhZ21lbnQsIGFmdGVyX3VwZGF0ZSB9ID0gY29tcG9uZW50LiQkO1xuXHRmcmFnbWVudCAmJiBmcmFnbWVudC5tKHRhcmdldCwgYW5jaG9yKTtcblx0Ly8gb25Nb3VudCBoYXBwZW5zIGJlZm9yZSB0aGUgaW5pdGlhbCBhZnRlclVwZGF0ZVxuXHRhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IHtcblx0XHRjb25zdCBuZXdfb25fZGVzdHJveSA9IGNvbXBvbmVudC4kJC5vbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuXHRcdC8vIGlmIHRoZSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseVxuXHRcdC8vIGl0IHdpbGwgdXBkYXRlIHRoZSBgJCQub25fZGVzdHJveWAgcmVmZXJlbmNlIHRvIGBudWxsYC5cblx0XHQvLyB0aGUgZGVzdHJ1Y3R1cmVkIG9uX2Rlc3Ryb3kgbWF5IHN0aWxsIHJlZmVyZW5jZSB0byB0aGUgb2xkIGFycmF5XG5cdFx0aWYgKGNvbXBvbmVudC4kJC5vbl9kZXN0cm95KSB7XG5cdFx0XHRjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKC4uLm5ld19vbl9kZXN0cm95KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRWRnZSBjYXNlIC0gY29tcG9uZW50IHdhcyBkZXN0cm95ZWQgaW1tZWRpYXRlbHksXG5cdFx0XHQvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG5cdFx0XHRydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcblx0XHR9XG5cdFx0Y29tcG9uZW50LiQkLm9uX21vdW50ID0gW107XG5cdH0pO1xuXHRhZnRlcl91cGRhdGUuZm9yRWFjaChhZGRfcmVuZGVyX2NhbGxiYWNrKTtcbn1cblxuLyoqIEByZXR1cm5zIHt2b2lkfSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlc3Ryb3lfY29tcG9uZW50KGNvbXBvbmVudCwgZGV0YWNoaW5nKSB7XG5cdGNvbnN0ICQkID0gY29tcG9uZW50LiQkO1xuXHRpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcblx0XHRmbHVzaF9yZW5kZXJfY2FsbGJhY2tzKCQkLmFmdGVyX3VwZGF0ZSk7XG5cdFx0cnVuX2FsbCgkJC5vbl9kZXN0cm95KTtcblx0XHQkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5kKGRldGFjaGluZyk7XG5cdFx0Ly8gVE9ETyBudWxsIG91dCBvdGhlciByZWZzLCBpbmNsdWRpbmcgY29tcG9uZW50LiQkIChidXQgbmVlZCB0b1xuXHRcdC8vIHByZXNlcnZlIGZpbmFsIHN0YXRlPylcblx0XHQkJC5vbl9kZXN0cm95ID0gJCQuZnJhZ21lbnQgPSBudWxsO1xuXHRcdCQkLmN0eCA9IFtdO1xuXHR9XG59XG5cbi8qKiBAcmV0dXJucyB7dm9pZH0gKi9cbmZ1bmN0aW9uIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKSB7XG5cdGlmIChjb21wb25lbnQuJCQuZGlydHlbMF0gPT09IC0xKSB7XG5cdFx0ZGlydHlfY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG5cdFx0c2NoZWR1bGVfdXBkYXRlKCk7XG5cdFx0Y29tcG9uZW50LiQkLmRpcnR5LmZpbGwoMCk7XG5cdH1cblx0Y29tcG9uZW50LiQkLmRpcnR5WyhpIC8gMzEpIHwgMF0gfD0gMSA8PCBpICUgMzE7XG59XG5cbi8vIFRPRE86IERvY3VtZW50IHRoZSBvdGhlciBwYXJhbXNcbi8qKlxuICogQHBhcmFtIHtTdmVsdGVDb21wb25lbnR9IGNvbXBvbmVudFxuICogQHBhcmFtIHtpbXBvcnQoJy4vcHVibGljLmpzJykuQ29tcG9uZW50Q29uc3RydWN0b3JPcHRpb25zfSBvcHRpb25zXG4gKlxuICogQHBhcmFtIHtpbXBvcnQoJy4vdXRpbHMuanMnKVsnbm90X2VxdWFsJ119IG5vdF9lcXVhbCBVc2VkIHRvIGNvbXBhcmUgcHJvcHMgYW5kIHN0YXRlIHZhbHVlcy5cbiAqIEBwYXJhbSB7KHRhcmdldDogRWxlbWVudCB8IFNoYWRvd1Jvb3QpID0+IHZvaWR9IFthcHBlbmRfc3R5bGVzXSBGdW5jdGlvbiB0aGF0IGFwcGVuZHMgc3R5bGVzIHRvIHRoZSBET00gd2hlbiB0aGUgY29tcG9uZW50IGlzIGZpcnN0IGluaXRpYWxpc2VkLlxuICogVGhpcyB3aWxsIGJlIHRoZSBgYWRkX2Nzc2AgZnVuY3Rpb24gZnJvbSB0aGUgY29tcGlsZWQgY29tcG9uZW50LlxuICpcbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdChcblx0Y29tcG9uZW50LFxuXHRvcHRpb25zLFxuXHRpbnN0YW5jZSxcblx0Y3JlYXRlX2ZyYWdtZW50LFxuXHRub3RfZXF1YWwsXG5cdHByb3BzLFxuXHRhcHBlbmRfc3R5bGVzID0gbnVsbCxcblx0ZGlydHkgPSBbLTFdXG4pIHtcblx0Y29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuXHRzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcblx0LyoqIEB0eXBlIHtpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLlQkJH0gKi9cblx0Y29uc3QgJCQgPSAoY29tcG9uZW50LiQkID0ge1xuXHRcdGZyYWdtZW50OiBudWxsLFxuXHRcdGN0eDogW10sXG5cdFx0Ly8gc3RhdGVcblx0XHRwcm9wcyxcblx0XHR1cGRhdGU6IG5vb3AsXG5cdFx0bm90X2VxdWFsLFxuXHRcdGJvdW5kOiBibGFua19vYmplY3QoKSxcblx0XHQvLyBsaWZlY3ljbGVcblx0XHRvbl9tb3VudDogW10sXG5cdFx0b25fZGVzdHJveTogW10sXG5cdFx0b25fZGlzY29ubmVjdDogW10sXG5cdFx0YmVmb3JlX3VwZGF0ZTogW10sXG5cdFx0YWZ0ZXJfdXBkYXRlOiBbXSxcblx0XHRjb250ZXh0OiBuZXcgTWFwKG9wdGlvbnMuY29udGV4dCB8fCAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSksXG5cdFx0Ly8gZXZlcnl0aGluZyBlbHNlXG5cdFx0Y2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcblx0XHRkaXJ0eSxcblx0XHRza2lwX2JvdW5kOiBmYWxzZSxcblx0XHRyb290OiBvcHRpb25zLnRhcmdldCB8fCBwYXJlbnRfY29tcG9uZW50LiQkLnJvb3Rcblx0fSk7XG5cdGFwcGVuZF9zdHlsZXMgJiYgYXBwZW5kX3N0eWxlcygkJC5yb290KTtcblx0bGV0IHJlYWR5ID0gZmFsc2U7XG5cdCQkLmN0eCA9IGluc3RhbmNlXG5cdFx0PyBpbnN0YW5jZShjb21wb25lbnQsIG9wdGlvbnMucHJvcHMgfHwge30sIChpLCByZXQsIC4uLnJlc3QpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG5cdFx0XHRcdGlmICgkJC5jdHggJiYgbm90X2VxdWFsKCQkLmN0eFtpXSwgKCQkLmN0eFtpXSA9IHZhbHVlKSkpIHtcblx0XHRcdFx0XHRpZiAoISQkLnNraXBfYm91bmQgJiYgJCQuYm91bmRbaV0pICQkLmJvdW5kW2ldKHZhbHVlKTtcblx0XHRcdFx0XHRpZiAocmVhZHkpIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdCAgfSlcblx0XHQ6IFtdO1xuXHQkJC51cGRhdGUoKTtcblx0cmVhZHkgPSB0cnVlO1xuXHRydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuXHQvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcblx0JCQuZnJhZ21lbnQgPSBjcmVhdGVfZnJhZ21lbnQgPyBjcmVhdGVfZnJhZ21lbnQoJCQuY3R4KSA6IGZhbHNlO1xuXHRpZiAob3B0aW9ucy50YXJnZXQpIHtcblx0XHRpZiAob3B0aW9ucy5oeWRyYXRlKSB7XG5cdFx0XHRzdGFydF9oeWRyYXRpbmcoKTtcblx0XHRcdC8vIFRPRE86IHdoYXQgaXMgdGhlIGNvcnJlY3QgdHlwZSBoZXJlP1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0Y29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG5cdFx0XHQkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5sKG5vZGVzKTtcblx0XHRcdG5vZGVzLmZvckVhY2goZGV0YWNoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cblx0XHRcdCQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmMoKTtcblx0XHR9XG5cdFx0aWYgKG9wdGlvbnMuaW50cm8pIHRyYW5zaXRpb25faW4oY29tcG9uZW50LiQkLmZyYWdtZW50KTtcblx0XHRtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IpO1xuXHRcdGVuZF9oeWRyYXRpbmcoKTtcblx0XHRmbHVzaCgpO1xuXHR9XG5cdHNldF9jdXJyZW50X2NvbXBvbmVudChwYXJlbnRfY29tcG9uZW50KTtcbn1cblxuZXhwb3J0IGxldCBTdmVsdGVFbGVtZW50O1xuXG5pZiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFN2ZWx0ZUVsZW1lbnQgPSBjbGFzcyBleHRlbmRzIEhUTUxFbGVtZW50IHtcblx0XHQvKiogVGhlIFN2ZWx0ZSBjb21wb25lbnQgY29uc3RydWN0b3IgKi9cblx0XHQkJGN0b3I7XG5cdFx0LyoqIFNsb3RzICovXG5cdFx0JCRzO1xuXHRcdC8qKiBUaGUgU3ZlbHRlIGNvbXBvbmVudCBpbnN0YW5jZSAqL1xuXHRcdCQkYztcblx0XHQvKiogV2hldGhlciBvciBub3QgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGNvbm5lY3RlZCAqL1xuXHRcdCQkY24gPSBmYWxzZTtcblx0XHQvKiogQ29tcG9uZW50IHByb3BzIGRhdGEgKi9cblx0XHQkJGQgPSB7fTtcblx0XHQvKiogYHRydWVgIGlmIGN1cnJlbnRseSBpbiB0aGUgcHJvY2VzcyBvZiByZWZsZWN0aW5nIGNvbXBvbmVudCBwcm9wcyBiYWNrIHRvIGF0dHJpYnV0ZXMgKi9cblx0XHQkJHIgPSBmYWxzZTtcblx0XHQvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRQcm9wRGVmaW5pdGlvbj59IFByb3BzIGRlZmluaXRpb24gKG5hbWUsIHJlZmxlY3RlZCwgdHlwZSBldGMpICovXG5cdFx0JCRwX2QgPSB7fTtcblx0XHQvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEZ1bmN0aW9uW10+fSBFdmVudCBsaXN0ZW5lcnMgKi9cblx0XHQkJGwgPSB7fTtcblx0XHQvKiogQHR5cGUge01hcDxGdW5jdGlvbiwgRnVuY3Rpb24+fSBFdmVudCBsaXN0ZW5lciB1bnN1YnNjcmliZSBmdW5jdGlvbnMgKi9cblx0XHQkJGxfdSA9IG5ldyBNYXAoKTtcblxuXHRcdGNvbnN0cnVjdG9yKCQkY29tcG9uZW50Q3RvciwgJCRzbG90cywgdXNlX3NoYWRvd19kb20pIHtcblx0XHRcdHN1cGVyKCk7XG5cdFx0XHR0aGlzLiQkY3RvciA9ICQkY29tcG9uZW50Q3Rvcjtcblx0XHRcdHRoaXMuJCRzID0gJCRzbG90cztcblx0XHRcdGlmICh1c2Vfc2hhZG93X2RvbSkge1xuXHRcdFx0XHR0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zKSB7XG5cdFx0XHQvLyBXZSBjYW4ndCBkZXRlcm1pbmUgdXBmcm9udCBpZiB0aGUgZXZlbnQgaXMgYSBjdXN0b20gZXZlbnQgb3Igbm90LCBzbyB3ZSBoYXZlIHRvXG5cdFx0XHQvLyBsaXN0ZW4gdG8gYm90aC4gSWYgc29tZW9uZSB1c2VzIGEgY3VzdG9tIGV2ZW50IHdpdGggdGhlIHNhbWUgbmFtZSBhcyBhIHJlZ3VsYXJcblx0XHRcdC8vIGJyb3dzZXIgZXZlbnQsIHRoaXMgZmlyZXMgdHdpY2UgLSB3ZSBjYW4ndCBhdm9pZCB0aGF0LlxuXHRcdFx0dGhpcy4kJGxbdHlwZV0gPSB0aGlzLiQkbFt0eXBlXSB8fCBbXTtcblx0XHRcdHRoaXMuJCRsW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuXHRcdFx0aWYgKHRoaXMuJCRjKSB7XG5cdFx0XHRcdGNvbnN0IHVuc3ViID0gdGhpcy4kJGMuJG9uKHR5cGUsIGxpc3RlbmVyKTtcblx0XHRcdFx0dGhpcy4kJGxfdS5zZXQobGlzdGVuZXIsIHVuc3ViKTtcblx0XHRcdH1cblx0XHRcdHN1cGVyLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdHJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpIHtcblx0XHRcdHN1cGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuXHRcdFx0aWYgKHRoaXMuJCRjKSB7XG5cdFx0XHRcdGNvbnN0IHVuc3ViID0gdGhpcy4kJGxfdS5nZXQobGlzdGVuZXIpO1xuXHRcdFx0XHRpZiAodW5zdWIpIHtcblx0XHRcdFx0XHR1bnN1YigpO1xuXHRcdFx0XHRcdHRoaXMuJCRsX3UuZGVsZXRlKGxpc3RlbmVyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuXHRcdFx0dGhpcy4kJGNuID0gdHJ1ZTtcblx0XHRcdGlmICghdGhpcy4kJGMpIHtcblx0XHRcdFx0Ly8gV2Ugd2FpdCBvbmUgdGljayB0byBsZXQgcG9zc2libGUgY2hpbGQgc2xvdCBlbGVtZW50cyBiZSBjcmVhdGVkL21vdW50ZWRcblx0XHRcdFx0YXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdGlmICghdGhpcy4kJGNuIHx8IHRoaXMuJCRjKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZ1bmN0aW9uIGNyZWF0ZV9zbG90KG5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdFx0bGV0IG5vZGU7XG5cdFx0XHRcdFx0XHRjb25zdCBvYmogPSB7XG5cdFx0XHRcdFx0XHRcdGM6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcblx0XHRcdFx0XHRcdFx0XHRub2RlID0gZWxlbWVudCgnc2xvdCcpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGF0dHIobm9kZSwgJ25hbWUnLCBuYW1lKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXRcblx0XHRcdFx0XHRcdFx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW2FuY2hvcl1cblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdG06IGZ1bmN0aW9uIG1vdW50KHRhcmdldCwgYW5jaG9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0aW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0ZDogZnVuY3Rpb24gZGVzdHJveShkZXRhY2hpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoZGV0YWNoaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZXRhY2gobm9kZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iajtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0ICQkc2xvdHMgPSB7fTtcblx0XHRcdFx0Y29uc3QgZXhpc3Rpbmdfc2xvdHMgPSBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzKHRoaXMpO1xuXHRcdFx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy4kJHMpIHtcblx0XHRcdFx0XHRpZiAobmFtZSBpbiBleGlzdGluZ19zbG90cykge1xuXHRcdFx0XHRcdFx0JCRzbG90c1tuYW1lXSA9IFtjcmVhdGVfc2xvdChuYW1lKV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlIG9mIHRoaXMuYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdC8vIHRoaXMuJCRkYXRhIHRha2VzIHByZWNlZGVuY2Ugb3ZlciB0aGlzLmF0dHJpYnV0ZXNcblx0XHRcdFx0XHRjb25zdCBuYW1lID0gdGhpcy4kJGdfcChhdHRyaWJ1dGUubmFtZSk7XG5cdFx0XHRcdFx0aWYgKCEobmFtZSBpbiB0aGlzLiQkZCkpIHtcblx0XHRcdFx0XHRcdHRoaXMuJCRkW25hbWVdID0gZ2V0X2N1c3RvbV9lbGVtZW50X3ZhbHVlKG5hbWUsIGF0dHJpYnV0ZS52YWx1ZSwgdGhpcy4kJHBfZCwgJ3RvUHJvcCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBQb3J0IG92ZXIgcHJvcHMgdGhhdCB3ZXJlIHNldCBwcm9ncmFtbWF0aWNhbGx5IGJlZm9yZSBjZSB3YXMgaW5pdGlhbGl6ZWRcblx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJHBfZCkge1xuXHRcdFx0XHRcdGlmICghKGtleSBpbiB0aGlzLiQkZCkgJiYgdGhpc1trZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHRoaXMuJCRkW2tleV0gPSB0aGlzW2tleV07IC8vIGRvbid0IHRyYW5zZm9ybSwgdGhlc2Ugd2VyZSBzZXQgdGhyb3VnaCBKYXZhU2NyaXB0XG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpc1trZXldOyAvLyByZW1vdmUgdGhlIHByb3BlcnR5IHRoYXQgc2hhZG93cyB0aGUgZ2V0dGVyL3NldHRlclxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLiQkYyA9IG5ldyB0aGlzLiQkY3Rvcih7XG5cdFx0XHRcdFx0dGFyZ2V0OiB0aGlzLnNoYWRvd1Jvb3QgfHwgdGhpcyxcblx0XHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdFx0Li4udGhpcy4kJGQsXG5cdFx0XHRcdFx0XHQkJHNsb3RzLFxuXHRcdFx0XHRcdFx0JCRzY29wZToge1xuXHRcdFx0XHRcdFx0XHRjdHg6IFtdXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBSZWZsZWN0IGNvbXBvbmVudCBwcm9wcyBhcyBhdHRyaWJ1dGVzXG5cdFx0XHRcdGNvbnN0IHJlZmxlY3RfYXR0cmlidXRlcyA9ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLiQkciA9IHRydWU7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJHBfZCkge1xuXHRcdFx0XHRcdFx0dGhpcy4kJGRba2V5XSA9IHRoaXMuJCRjLiQkLmN0eFt0aGlzLiQkYy4kJC5wcm9wc1trZXldXTtcblx0XHRcdFx0XHRcdGlmICh0aGlzLiQkcF9kW2tleV0ucmVmbGVjdCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhdHRyaWJ1dGVfdmFsdWUgPSBnZXRfY3VzdG9tX2VsZW1lbnRfdmFsdWUoXG5cdFx0XHRcdFx0XHRcdFx0a2V5LFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuJCRkW2tleV0sXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy4kJHBfZCxcblx0XHRcdFx0XHRcdFx0XHQndG9BdHRyaWJ1dGUnXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVfdmFsdWUgPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMucmVtb3ZlQXR0cmlidXRlKHRoaXMuJCRwX2Rba2V5XS5hdHRyaWJ1dGUgfHwga2V5KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEF0dHJpYnV0ZSh0aGlzLiQkcF9kW2tleV0uYXR0cmlidXRlIHx8IGtleSwgYXR0cmlidXRlX3ZhbHVlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLiQkciA9IGZhbHNlO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHR0aGlzLiQkYy4kJC5hZnRlcl91cGRhdGUucHVzaChyZWZsZWN0X2F0dHJpYnV0ZXMpO1xuXHRcdFx0XHRyZWZsZWN0X2F0dHJpYnV0ZXMoKTsgLy8gb25jZSBpbml0aWFsbHkgYmVjYXVzZSBhZnRlcl91cGRhdGUgaXMgYWRkZWQgdG9vIGxhdGUgZm9yIGZpcnN0IHJlbmRlclxuXG5cdFx0XHRcdGZvciAoY29uc3QgdHlwZSBpbiB0aGlzLiQkbCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgbGlzdGVuZXIgb2YgdGhpcy4kJGxbdHlwZV0pIHtcblx0XHRcdFx0XHRcdGNvbnN0IHVuc3ViID0gdGhpcy4kJGMuJG9uKHR5cGUsIGxpc3RlbmVyKTtcblx0XHRcdFx0XHRcdHRoaXMuJCRsX3Uuc2V0KGxpc3RlbmVyLCB1bnN1Yik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuJCRsID0ge307XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gV2UgZG9uJ3QgbmVlZCB0aGlzIHdoZW4gd29ya2luZyB3aXRoaW4gU3ZlbHRlIGNvZGUsIGJ1dCBmb3IgY29tcGF0aWJpbGl0eSBvZiBwZW9wbGUgdXNpbmcgdGhpcyBvdXRzaWRlIG9mIFN2ZWx0ZVxuXHRcdC8vIGFuZCBzZXR0aW5nIGF0dHJpYnV0ZXMgdGhyb3VnaCBzZXRBdHRyaWJ1dGUgZXRjLCB0aGlzIGlzIGhlbHBmdWxcblx0XHRhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgX29sZFZhbHVlLCBuZXdWYWx1ZSkge1xuXHRcdFx0aWYgKHRoaXMuJCRyKSByZXR1cm47XG5cdFx0XHRhdHRyID0gdGhpcy4kJGdfcChhdHRyKTtcblx0XHRcdHRoaXMuJCRkW2F0dHJdID0gZ2V0X2N1c3RvbV9lbGVtZW50X3ZhbHVlKGF0dHIsIG5ld1ZhbHVlLCB0aGlzLiQkcF9kLCAndG9Qcm9wJyk7XG5cdFx0XHR0aGlzLiQkYz8uJHNldCh7IFthdHRyXTogdGhpcy4kJGRbYXR0cl0gfSk7XG5cdFx0fVxuXG5cdFx0ZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cdFx0XHR0aGlzLiQkY24gPSBmYWxzZTtcblx0XHRcdC8vIEluIGEgbWljcm90YXNrLCBiZWNhdXNlIHRoaXMgY291bGQgYmUgYSBtb3ZlIHdpdGhpbiB0aGUgRE9NXG5cdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKCF0aGlzLiQkY24gJiYgdGhpcy4kJGMpIHtcblx0XHRcdFx0XHR0aGlzLiQkYy4kZGVzdHJveSgpO1xuXHRcdFx0XHRcdHRoaXMuJCRjID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQkJGdfcChhdHRyaWJ1dGVfbmFtZSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0T2JqZWN0LmtleXModGhpcy4kJHBfZCkuZmluZChcblx0XHRcdFx0XHQoa2V5KSA9PlxuXHRcdFx0XHRcdFx0dGhpcy4kJHBfZFtrZXldLmF0dHJpYnV0ZSA9PT0gYXR0cmlidXRlX25hbWUgfHxcblx0XHRcdFx0XHRcdCghdGhpcy4kJHBfZFtrZXldLmF0dHJpYnV0ZSAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gYXR0cmlidXRlX25hbWUpXG5cdFx0XHRcdCkgfHwgYXR0cmlidXRlX25hbWVcblx0XHRcdCk7XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge2FueX0gdmFsdWVcbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudFByb3BEZWZpbml0aW9uPn0gcHJvcHNfZGVmaW5pdGlvblxuICogQHBhcmFtIHsndG9BdHRyaWJ1dGUnIHwgJ3RvUHJvcCd9IFt0cmFuc2Zvcm1dXG4gKi9cbmZ1bmN0aW9uIGdldF9jdXN0b21fZWxlbWVudF92YWx1ZShwcm9wLCB2YWx1ZSwgcHJvcHNfZGVmaW5pdGlvbiwgdHJhbnNmb3JtKSB7XG5cdGNvbnN0IHR5cGUgPSBwcm9wc19kZWZpbml0aW9uW3Byb3BdPy50eXBlO1xuXHR2YWx1ZSA9IHR5cGUgPT09ICdCb29sZWFuJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdib29sZWFuJyA/IHZhbHVlICE9IG51bGwgOiB2YWx1ZTtcblx0aWYgKCF0cmFuc2Zvcm0gfHwgIXByb3BzX2RlZmluaXRpb25bcHJvcF0pIHtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH0gZWxzZSBpZiAodHJhbnNmb3JtID09PSAndG9BdHRyaWJ1dGUnKSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlICdPYmplY3QnOlxuXHRcdFx0Y2FzZSAnQXJyYXknOlxuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRjYXNlICdCb29sZWFuJzpcblx0XHRcdFx0cmV0dXJuIHZhbHVlID8gJycgOiBudWxsO1xuXHRcdFx0Y2FzZSAnTnVtYmVyJzpcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWU7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSAnT2JqZWN0Jzpcblx0XHRcdGNhc2UgJ0FycmF5Jzpcblx0XHRcdFx0cmV0dXJuIHZhbHVlICYmIEpTT04ucGFyc2UodmFsdWUpO1xuXHRcdFx0Y2FzZSAnQm9vbGVhbic6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTsgLy8gY29udmVyc2lvbiBhbHJlYWR5IGhhbmRsZWQgYWJvdmVcblx0XHRcdGNhc2UgJ051bWJlcic6XG5cdFx0XHRcdHJldHVybiB2YWx1ZSAhPSBudWxsID8gK3ZhbHVlIDogdmFsdWU7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogQGludGVybmFsXG4gKlxuICogVHVybiBhIFN2ZWx0ZSBjb21wb25lbnQgaW50byBhIGN1c3RvbSBlbGVtZW50LlxuICogQHBhcmFtIHtpbXBvcnQoJy4vcHVibGljLmpzJykuQ29tcG9uZW50VHlwZX0gQ29tcG9uZW50ICBBIFN2ZWx0ZSBjb21wb25lbnQgY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudFByb3BEZWZpbml0aW9uPn0gcHJvcHNfZGVmaW5pdGlvbiAgVGhlIHByb3BzIHRvIG9ic2VydmVcbiAqIEBwYXJhbSB7c3RyaW5nW119IHNsb3RzICBUaGUgc2xvdHMgdG8gY3JlYXRlXG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBhY2Nlc3NvcnMgIE90aGVyIGFjY2Vzc29ycyBiZXNpZGVzIHRoZSBvbmVzIGZvciBwcm9wcyB0aGUgY29tcG9uZW50IGhhc1xuICogQHBhcmFtIHtib29sZWFufSB1c2Vfc2hhZG93X2RvbSAgV2hldGhlciB0byB1c2Ugc2hhZG93IERPTVxuICogQHBhcmFtIHsoY2U6IG5ldyAoKSA9PiBIVE1MRWxlbWVudCkgPT4gbmV3ICgpID0+IEhUTUxFbGVtZW50fSBbZXh0ZW5kXVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlX2N1c3RvbV9lbGVtZW50KFxuXHRDb21wb25lbnQsXG5cdHByb3BzX2RlZmluaXRpb24sXG5cdHNsb3RzLFxuXHRhY2Nlc3NvcnMsXG5cdHVzZV9zaGFkb3dfZG9tLFxuXHRleHRlbmRcbikge1xuXHRsZXQgQ2xhc3MgPSBjbGFzcyBleHRlbmRzIFN2ZWx0ZUVsZW1lbnQge1xuXHRcdGNvbnN0cnVjdG9yKCkge1xuXHRcdFx0c3VwZXIoQ29tcG9uZW50LCBzbG90cywgdXNlX3NoYWRvd19kb20pO1xuXHRcdFx0dGhpcy4kJHBfZCA9IHByb3BzX2RlZmluaXRpb247XG5cdFx0fVxuXHRcdHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHByb3BzX2RlZmluaXRpb24pLm1hcCgoa2V5KSA9PlxuXHRcdFx0XHQocHJvcHNfZGVmaW5pdGlvbltrZXldLmF0dHJpYnV0ZSB8fCBrZXkpLnRvTG93ZXJDYXNlKClcblx0XHRcdCk7XG5cdFx0fVxuXHR9O1xuXHRPYmplY3Qua2V5cyhwcm9wc19kZWZpbml0aW9uKS5mb3JFYWNoKChwcm9wKSA9PiB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KENsYXNzLnByb3RvdHlwZSwgcHJvcCwge1xuXHRcdFx0Z2V0KCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy4kJGMgJiYgcHJvcCBpbiB0aGlzLiQkYyA/IHRoaXMuJCRjW3Byb3BdIDogdGhpcy4kJGRbcHJvcF07XG5cdFx0XHR9LFxuXHRcdFx0c2V0KHZhbHVlKSB7XG5cdFx0XHRcdHZhbHVlID0gZ2V0X2N1c3RvbV9lbGVtZW50X3ZhbHVlKHByb3AsIHZhbHVlLCBwcm9wc19kZWZpbml0aW9uKTtcblx0XHRcdFx0dGhpcy4kJGRbcHJvcF0gPSB2YWx1ZTtcblx0XHRcdFx0dGhpcy4kJGM/LiRzZXQoeyBbcHJvcF06IHZhbHVlIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblx0YWNjZXNzb3JzLmZvckVhY2goKGFjY2Vzc29yKSA9PiB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KENsYXNzLnByb3RvdHlwZSwgYWNjZXNzb3IsIHtcblx0XHRcdGdldCgpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuJCRjPy5bYWNjZXNzb3JdO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblx0aWYgKGV4dGVuZCkge1xuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3IgLSBhc3NpZ25pbmcgaGVyZSBpcyBmaW5lXG5cdFx0Q2xhc3MgPSBleHRlbmQoQ2xhc3MpO1xuXHR9XG5cdENvbXBvbmVudC5lbGVtZW50ID0gLyoqIEB0eXBlIHthbnl9ICovIChDbGFzcyk7XG5cdHJldHVybiBDbGFzcztcbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cy4gVXNlZCB3aGVuIGRldj1mYWxzZS5cbiAqXG4gKiBAdGVtcGxhdGUge1JlY29yZDxzdHJpbmcsIGFueT59IFtQcm9wcz1hbnldXG4gKiBAdGVtcGxhdGUge1JlY29yZDxzdHJpbmcsIGFueT59IFtFdmVudHM9YW55XVxuICovXG5leHBvcnQgY2xhc3MgU3ZlbHRlQ29tcG9uZW50IHtcblx0LyoqXG5cdCAqICMjIyBQUklWQVRFIEFQSVxuXHQgKlxuXHQgKiBEbyBub3QgdXNlLCBtYXkgY2hhbmdlIGF0IGFueSB0aW1lXG5cdCAqXG5cdCAqIEB0eXBlIHthbnl9XG5cdCAqL1xuXHQkJCA9IHVuZGVmaW5lZDtcblx0LyoqXG5cdCAqICMjIyBQUklWQVRFIEFQSVxuXHQgKlxuXHQgKiBEbyBub3QgdXNlLCBtYXkgY2hhbmdlIGF0IGFueSB0aW1lXG5cdCAqXG5cdCAqIEB0eXBlIHthbnl9XG5cdCAqL1xuXHQkJHNldCA9IHVuZGVmaW5lZDtcblxuXHQvKiogQHJldHVybnMge3ZvaWR9ICovXG5cdCRkZXN0cm95KCkge1xuXHRcdGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuXHRcdHRoaXMuJGRlc3Ryb3kgPSBub29wO1xuXHR9XG5cblx0LyoqXG5cdCAqIEB0ZW1wbGF0ZSB7RXh0cmFjdDxrZXlvZiBFdmVudHMsIHN0cmluZz59IEtcblx0ICogQHBhcmFtIHtLfSB0eXBlXG5cdCAqIEBwYXJhbSB7KChlOiBFdmVudHNbS10pID0+IHZvaWQpIHwgbnVsbCB8IHVuZGVmaW5lZH0gY2FsbGJhY2tcblx0ICogQHJldHVybnMgeygpID0+IHZvaWR9XG5cdCAqL1xuXHQkb24odHlwZSwgY2FsbGJhY2spIHtcblx0XHRpZiAoIWlzX2Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuXHRcdFx0cmV0dXJuIG5vb3A7XG5cdFx0fVxuXHRcdGNvbnN0IGNhbGxiYWNrcyA9IHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSA9IFtdKTtcblx0XHRjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdGNvbnN0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuXHRcdFx0aWYgKGluZGV4ICE9PSAtMSkgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge1BhcnRpYWw8UHJvcHM+fSBwcm9wc1xuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdCRzZXQocHJvcHMpIHtcblx0XHRpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkocHJvcHMpKSB7XG5cdFx0XHR0aGlzLiQkLnNraXBfYm91bmQgPSB0cnVlO1xuXHRcdFx0dGhpcy4kJHNldChwcm9wcyk7XG5cdFx0XHR0aGlzLiQkLnNraXBfYm91bmQgPSBmYWxzZTtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBDdXN0b21FbGVtZW50UHJvcERlZmluaXRpb25cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbYXR0cmlidXRlXVxuICogQHByb3BlcnR5IHtib29sZWFufSBbcmVmbGVjdF1cbiAqIEBwcm9wZXJ0eSB7J1N0cmluZyd8J0Jvb2xlYW4nfCdOdW1iZXInfCdBcnJheSd8J09iamVjdCd9IFt0eXBlXVxuICovXG4iLCAiY29uc3QgX2Jvb2xlYW5fYXR0cmlidXRlcyA9IC8qKiBAdHlwZSB7Y29uc3R9ICovIChbXG5cdCdhbGxvd2Z1bGxzY3JlZW4nLFxuXHQnYWxsb3dwYXltZW50cmVxdWVzdCcsXG5cdCdhc3luYycsXG5cdCdhdXRvZm9jdXMnLFxuXHQnYXV0b3BsYXknLFxuXHQnY2hlY2tlZCcsXG5cdCdjb250cm9scycsXG5cdCdkZWZhdWx0Jyxcblx0J2RlZmVyJyxcblx0J2Rpc2FibGVkJyxcblx0J2Zvcm1ub3ZhbGlkYXRlJyxcblx0J2hpZGRlbicsXG5cdCdpbmVydCcsXG5cdCdpc21hcCcsXG5cdCdsb29wJyxcblx0J211bHRpcGxlJyxcblx0J211dGVkJyxcblx0J25vbW9kdWxlJyxcblx0J25vdmFsaWRhdGUnLFxuXHQnb3BlbicsXG5cdCdwbGF5c2lubGluZScsXG5cdCdyZWFkb25seScsXG5cdCdyZXF1aXJlZCcsXG5cdCdyZXZlcnNlZCcsXG5cdCdzZWxlY3RlZCdcbl0pO1xuXG4vKipcbiAqIExpc3Qgb2YgSFRNTCBib29sZWFuIGF0dHJpYnV0ZXMgKGUuZy4gYDxpbnB1dCBkaXNhYmxlZD5gKS5cbiAqIFNvdXJjZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sXG4gKlxuICogQHR5cGUge1NldDxzdHJpbmc+fVxuICovXG5leHBvcnQgY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbLi4uX2Jvb2xlYW5fYXR0cmlidXRlc10pO1xuXG4vKiogQHR5cGVkZWYge3R5cGVvZiBfYm9vbGVhbl9hdHRyaWJ1dGVzW251bWJlcl19IEJvb2xlYW5BdHRyaWJ1dGVzICovXG4iLCAiLy8gZ2VuZXJhdGVkIGR1cmluZyByZWxlYXNlLCBkbyBub3QgbW9kaWZ5XG5cbi8qKlxuICogVGhlIGN1cnJlbnQgdmVyc2lvbiwgYXMgc2V0IGluIHBhY2thZ2UuanNvbi5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcy9zdmVsdGUtY29tcGlsZXIjc3ZlbHRlLXZlcnNpb25cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBWRVJTSU9OID0gJzQuMi4xOSc7XG5leHBvcnQgY29uc3QgUFVCTElDX1ZFUlNJT04gPSAnNCc7XG4iLCAiaW1wb3J0IHsgUFVCTElDX1ZFUlNJT04gfSBmcm9tICcuLi8uLi8uLi9zaGFyZWQvdmVyc2lvbi5qcyc7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJylcblx0Ly8gQHRzLWlnbm9yZVxuXHQod2luZG93Ll9fc3ZlbHRlIHx8ICh3aW5kb3cuX19zdmVsdGUgPSB7IHY6IG5ldyBTZXQoKSB9KSkudi5hZGQoUFVCTElDX1ZFUlNJT04pO1xuIiwgImltcG9ydCB7XG5cdHJ1bl9hbGwsXG5cdHN1YnNjcmliZSxcblx0bm9vcCxcblx0c2FmZV9ub3RfZXF1YWwsXG5cdGlzX2Z1bmN0aW9uLFxuXHRnZXRfc3RvcmVfdmFsdWVcbn0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXguanMnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSZWFkYWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLXN0b3JlI3JlYWRhYmxlXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSBbdmFsdWVdIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLlN0YXJ0U3RvcE5vdGlmaWVyPFQ+fSBbc3RhcnRdXG4gKiBAcmV0dXJucyB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLlJlYWRhYmxlPFQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVhZGFibGUodmFsdWUsIHN0YXJ0KSB7XG5cdHJldHVybiB7XG5cdFx0c3Vic2NyaWJlOiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQpLnN1YnNjcmliZVxuXHR9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBXcml0YWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgYm90aCB1cGRhdGluZyBhbmQgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLXN0b3JlI3dyaXRhYmxlXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtUfSBbdmFsdWVdIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLlN0YXJ0U3RvcE5vdGlmaWVyPFQ+fSBbc3RhcnRdXG4gKiBAcmV0dXJucyB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLldyaXRhYmxlPFQ+fVxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JpdGFibGUodmFsdWUsIHN0YXJ0ID0gbm9vcCkge1xuXHQvKiogQHR5cGUge2ltcG9ydCgnLi9wdWJsaWMuanMnKS5VbnN1YnNjcmliZXJ9ICovXG5cdGxldCBzdG9wO1xuXHQvKiogQHR5cGUge1NldDxpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLlN1YnNjcmliZUludmFsaWRhdGVUdXBsZTxUPj59ICovXG5cdGNvbnN0IHN1YnNjcmliZXJzID0gbmV3IFNldCgpO1xuXHQvKiogQHBhcmFtIHtUfSBuZXdfdmFsdWVcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRmdW5jdGlvbiBzZXQobmV3X3ZhbHVlKSB7XG5cdFx0aWYgKHNhZmVfbm90X2VxdWFsKHZhbHVlLCBuZXdfdmFsdWUpKSB7XG5cdFx0XHR2YWx1ZSA9IG5ld192YWx1ZTtcblx0XHRcdGlmIChzdG9wKSB7XG5cdFx0XHRcdC8vIHN0b3JlIGlzIHJlYWR5XG5cdFx0XHRcdGNvbnN0IHJ1bl9xdWV1ZSA9ICFzdWJzY3JpYmVyX3F1ZXVlLmxlbmd0aDtcblx0XHRcdFx0Zm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSB7XG5cdFx0XHRcdFx0c3Vic2NyaWJlclsxXSgpO1xuXHRcdFx0XHRcdHN1YnNjcmliZXJfcXVldWUucHVzaChzdWJzY3JpYmVyLCB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJ1bl9xdWV1ZSkge1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7IGkgKz0gMikge1xuXHRcdFx0XHRcdFx0c3Vic2NyaWJlcl9xdWV1ZVtpXVswXShzdWJzY3JpYmVyX3F1ZXVlW2kgKyAxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN1YnNjcmliZXJfcXVldWUubGVuZ3RoID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge2ltcG9ydCgnLi9wdWJsaWMuanMnKS5VcGRhdGVyPFQ+fSBmblxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdGZ1bmN0aW9uIHVwZGF0ZShmbikge1xuXHRcdHNldChmbih2YWx1ZSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLlN1YnNjcmliZXI8VD59IHJ1blxuXHQgKiBAcGFyYW0ge2ltcG9ydCgnLi9wcml2YXRlLmpzJykuSW52YWxpZGF0b3I8VD59IFtpbnZhbGlkYXRlXVxuXHQgKiBAcmV0dXJucyB7aW1wb3J0KCcuL3B1YmxpYy5qcycpLlVuc3Vic2NyaWJlcn1cblx0ICovXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShydW4sIGludmFsaWRhdGUgPSBub29wKSB7XG5cdFx0LyoqIEB0eXBlIHtpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLlN1YnNjcmliZUludmFsaWRhdGVUdXBsZTxUPn0gKi9cblx0XHRjb25zdCBzdWJzY3JpYmVyID0gW3J1biwgaW52YWxpZGF0ZV07XG5cdFx0c3Vic2NyaWJlcnMuYWRkKHN1YnNjcmliZXIpO1xuXHRcdGlmIChzdWJzY3JpYmVycy5zaXplID09PSAxKSB7XG5cdFx0XHRzdG9wID0gc3RhcnQoc2V0LCB1cGRhdGUpIHx8IG5vb3A7XG5cdFx0fVxuXHRcdHJ1bih2YWx1ZSk7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHN1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcblx0XHRcdGlmIChzdWJzY3JpYmVycy5zaXplID09PSAwICYmIHN0b3ApIHtcblx0XHRcdFx0c3RvcCgpO1xuXHRcdFx0XHRzdG9wID0gbnVsbDtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHJldHVybiB7IHNldCwgdXBkYXRlLCBzdWJzY3JpYmUgfTtcbn1cblxuLyoqXG4gKiBEZXJpdmVkIHZhbHVlIHN0b3JlIGJ5IHN5bmNocm9uaXppbmcgb25lIG9yIG1vcmUgcmVhZGFibGUgc3RvcmVzIGFuZFxuICogYXBwbHlpbmcgYW4gYWdncmVnYXRpb24gZnVuY3Rpb24gb3ZlciBpdHMgaW5wdXQgdmFsdWVzLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzL3N2ZWx0ZS1zdG9yZSNkZXJpdmVkXG4gKiBAdGVtcGxhdGUge2ltcG9ydCgnLi9wcml2YXRlLmpzJykuU3RvcmVzfSBTXG4gKiBAdGVtcGxhdGUgVFxuICogQG92ZXJsb2FkXG4gKiBAcGFyYW0ge1N9IHN0b3JlcyAtIGlucHV0IHN0b3Jlc1xuICogQHBhcmFtIHsodmFsdWVzOiBpbXBvcnQoJy4vcHJpdmF0ZS5qcycpLlN0b3Jlc1ZhbHVlczxTPiwgc2V0OiAodmFsdWU6IFQpID0+IHZvaWQsIHVwZGF0ZTogKGZuOiBpbXBvcnQoJy4vcHVibGljLmpzJykuVXBkYXRlcjxUPikgPT4gdm9pZCkgPT4gaW1wb3J0KCcuL3B1YmxpYy5qcycpLlVuc3Vic2NyaWJlciB8IHZvaWR9IGZuIC0gZnVuY3Rpb24gY2FsbGJhY2sgdGhhdCBhZ2dyZWdhdGVzIHRoZSB2YWx1ZXNcbiAqIEBwYXJhbSB7VH0gW2luaXRpYWxfdmFsdWVdIC0gaW5pdGlhbCB2YWx1ZVxuICogQHJldHVybnMge2ltcG9ydCgnLi9wdWJsaWMuanMnKS5SZWFkYWJsZTxUPn1cbiAqL1xuXG4vKipcbiAqIERlcml2ZWQgdmFsdWUgc3RvcmUgYnkgc3luY2hyb25pemluZyBvbmUgb3IgbW9yZSByZWFkYWJsZSBzdG9yZXMgYW5kXG4gKiBhcHBseWluZyBhbiBhZ2dyZWdhdGlvbiBmdW5jdGlvbiBvdmVyIGl0cyBpbnB1dCB2YWx1ZXMuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLXN0b3JlI2Rlcml2ZWRcbiAqIEB0ZW1wbGF0ZSB7aW1wb3J0KCcuL3ByaXZhdGUuanMnKS5TdG9yZXN9IFNcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAb3ZlcmxvYWRcbiAqIEBwYXJhbSB7U30gc3RvcmVzIC0gaW5wdXQgc3RvcmVzXG4gKiBAcGFyYW0geyh2YWx1ZXM6IGltcG9ydCgnLi9wcml2YXRlLmpzJykuU3RvcmVzVmFsdWVzPFM+KSA9PiBUfSBmbiAtIGZ1bmN0aW9uIGNhbGxiYWNrIHRoYXQgYWdncmVnYXRlcyB0aGUgdmFsdWVzXG4gKiBAcGFyYW0ge1R9IFtpbml0aWFsX3ZhbHVlXSAtIGluaXRpYWwgdmFsdWVcbiAqIEByZXR1cm5zIHtpbXBvcnQoJy4vcHVibGljLmpzJykuUmVhZGFibGU8VD59XG4gKi9cblxuLyoqXG4gKiBAdGVtcGxhdGUge2ltcG9ydCgnLi9wcml2YXRlLmpzJykuU3RvcmVzfSBTXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtTfSBzdG9yZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge1R9IFtpbml0aWFsX3ZhbHVlXVxuICogQHJldHVybnMge2ltcG9ydCgnLi9wdWJsaWMuanMnKS5SZWFkYWJsZTxUPn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcml2ZWQoc3RvcmVzLCBmbiwgaW5pdGlhbF92YWx1ZSkge1xuXHRjb25zdCBzaW5nbGUgPSAhQXJyYXkuaXNBcnJheShzdG9yZXMpO1xuXHQvKiogQHR5cGUge0FycmF5PGltcG9ydCgnLi9wdWJsaWMuanMnKS5SZWFkYWJsZTxhbnk+Pn0gKi9cblx0Y29uc3Qgc3RvcmVzX2FycmF5ID0gc2luZ2xlID8gW3N0b3Jlc10gOiBzdG9yZXM7XG5cdGlmICghc3RvcmVzX2FycmF5LmV2ZXJ5KEJvb2xlYW4pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdkZXJpdmVkKCkgZXhwZWN0cyBzdG9yZXMgYXMgaW5wdXQsIGdvdCBhIGZhbHN5IHZhbHVlJyk7XG5cdH1cblx0Y29uc3QgYXV0byA9IGZuLmxlbmd0aCA8IDI7XG5cdHJldHVybiByZWFkYWJsZShpbml0aWFsX3ZhbHVlLCAoc2V0LCB1cGRhdGUpID0+IHtcblx0XHRsZXQgc3RhcnRlZCA9IGZhbHNlO1xuXHRcdGNvbnN0IHZhbHVlcyA9IFtdO1xuXHRcdGxldCBwZW5kaW5nID0gMDtcblx0XHRsZXQgY2xlYW51cCA9IG5vb3A7XG5cdFx0Y29uc3Qgc3luYyA9ICgpID0+IHtcblx0XHRcdGlmIChwZW5kaW5nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGNsZWFudXAoKTtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IGZuKHNpbmdsZSA/IHZhbHVlc1swXSA6IHZhbHVlcywgc2V0LCB1cGRhdGUpO1xuXHRcdFx0aWYgKGF1dG8pIHtcblx0XHRcdFx0c2V0KHJlc3VsdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjbGVhbnVwID0gaXNfZnVuY3Rpb24ocmVzdWx0KSA/IHJlc3VsdCA6IG5vb3A7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+XG5cdFx0XHRzdWJzY3JpYmUoXG5cdFx0XHRcdHN0b3JlLFxuXHRcdFx0XHQodmFsdWUpID0+IHtcblx0XHRcdFx0XHR2YWx1ZXNbaV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRwZW5kaW5nICY9IH4oMSA8PCBpKTtcblx0XHRcdFx0XHRpZiAoc3RhcnRlZCkge1xuXHRcdFx0XHRcdFx0c3luYygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdHBlbmRpbmcgfD0gMSA8PCBpO1xuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0KTtcblx0XHRzdGFydGVkID0gdHJ1ZTtcblx0XHRzeW5jKCk7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIHN0b3AoKSB7XG5cdFx0XHRydW5fYWxsKHVuc3Vic2NyaWJlcnMpO1xuXHRcdFx0Y2xlYW51cCgpO1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBzZXQgdGhpcyB0byBmYWxzZSBiZWNhdXNlIGNhbGxiYWNrcyBjYW4gc3RpbGwgaGFwcGVuIGRlc3BpdGUgaGF2aW5nIHVuc3Vic2NyaWJlZDpcblx0XHRcdC8vIENhbGxiYWNrcyBtaWdodCBhbHJlYWR5IGJlIHBsYWNlZCBpbiB0aGUgcXVldWUgd2hpY2ggZG9lc24ndCBrbm93IGl0IHNob3VsZCBubyBsb25nZXJcblx0XHRcdC8vIGludm9rZSB0aGlzIGRlcml2ZWQgc3RvcmUuXG5cdFx0XHRzdGFydGVkID0gZmFsc2U7XG5cdFx0fTtcblx0fSk7XG59XG5cbi8qKlxuICogVGFrZXMgYSBzdG9yZSBhbmQgcmV0dXJucyBhIG5ldyBvbmUgZGVyaXZlZCBmcm9tIHRoZSBvbGQgb25lIHRoYXQgaXMgcmVhZGFibGUuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3Mvc3ZlbHRlLXN0b3JlI3JlYWRvbmx5XG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtpbXBvcnQoJy4vcHVibGljLmpzJykuUmVhZGFibGU8VD59IHN0b3JlICAtIHN0b3JlIHRvIG1ha2UgcmVhZG9ubHlcbiAqIEByZXR1cm5zIHtpbXBvcnQoJy4vcHVibGljLmpzJykuUmVhZGFibGU8VD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkb25seShzdG9yZSkge1xuXHRyZXR1cm4ge1xuXHRcdHN1YnNjcmliZTogc3RvcmUuc3Vic2NyaWJlLmJpbmQoc3RvcmUpXG5cdH07XG59XG5cbmV4cG9ydCB7IGdldF9zdG9yZV92YWx1ZSBhcyBnZXQgfTtcbiIsICJpbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5cbmV4cG9ydCBjb25zdCBjb3VudCA9IHdyaXRhYmxlKDApO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNPLFNBQVMsT0FBTztBQUFDO0FBc0NqQixTQUFTLElBQUksSUFBSTtBQUN2QixTQUFPLEdBQUc7QUFDWDtBQUVPLFNBQVMsZUFBZTtBQUM5QixTQUFPLHVCQUFPLE9BQU8sSUFBSTtBQUMxQjtBQU1PLFNBQVMsUUFBUSxLQUFLO0FBQzVCLE1BQUksUUFBUSxHQUFHO0FBQ2hCO0FBTU8sU0FBUyxZQUFZLE9B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
