export function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
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

type Attrs = {
  text?: string;
  className?: string | (string | undefined | null)[];
  style?: Partial<CSSStyleProperties>;
  [key: string]: any;
};

export function el(
  tag: string,
  attrs: Attrs = {},
  children: (HTMLElement | string | null | undefined)[] = []
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
  children.forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}
