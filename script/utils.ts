export function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

export function pick<T extends object, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K
): Pick<T, K[number]> {
  const result = {} as Pick<T, K[number]>;
  keys.forEach((k) => {
    if (k in obj) {
      result[k] = obj[k];
    }
  });
  return result;
}

export function escapeHtml(str: string): string {
  return String(str ?? '').replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[m] ?? ''
  );
}
export function escapeAttr(str: string): string {
  return escapeHtml(str);
}

export type ChildElement =
  | HTMLElement
  | string
  | number
  | null
  | undefined
  | boolean;

type Attrs = {
  text?: string;
  className?: string | (string | undefined | null)[];
  class?: never; // deprecated, use className
  style?: Partial<CSSStyleProperties>;
  [key: string]: any;
};

function appendChild(node: HTMLElement, child: ChildElement) {
  if (child == null || typeof child === 'boolean') return;

  if (typeof child === 'string' || typeof child === 'number') {
    node.appendChild(document.createTextNode(escapeHtml(String(child))));
  } else {
    node.appendChild(child);
  }
}

export function el(
  tag: string,
  attrs: Attrs = {},
  children: ChildElement | ChildElement[] = []
) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class' || k === 'className') {
      if (Array.isArray(v)) {
        node.className = v.filter(Boolean).join(' ');
      } else {
        node.className = v;
      }
      return;
    }
    if (k === 'style' && typeof v === 'object') {
      Object.entries(v).forEach(([sk, sv]) => {
        (node.style as any)[sk] = sv;
      });
      return;
    }
    if (tag === 'input' && k === 'value') {
      (node as HTMLInputElement).value = escapeAttr(v);
      return;
    }
    if (k === 'text') {
      node.textContent = v;
      return;
    }
    if (v === false || v === null || v === undefined) return;
    if (v === true) {
      node.setAttribute(k, '');
      return;
    }
    node.setAttribute(k, v);
  });

  const childrenArray = Array.isArray(children) ? children : [children];

  childrenArray.forEach((c) => appendChild(node, c));

  return node;
}
