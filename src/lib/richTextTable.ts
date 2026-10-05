const DOCS_BG_PATTERN =
  /background-color:\s*(#fcfcfc|#ffffff|#fff|white|rgb\(\s*252\s*,\s*252\s*,\s*252\s*\)|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))\s*;?/gi;

export function clampTableDimension(value: number, min: number, max: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/** Remove Google Docs / Word paste artifacts that show as white boxes on the cream site background. */
export function sanitizeImportedHtml(html: string): string {
  if (!html) return html;

  let out = html.replace(DOCS_BG_PATTERN, '');
  out = out.replace(/<colgroup>[\s\S]*?<\/colgroup>/gi, '');
  out = out.replace(/\sstyle="\s*"/gi, '');
  out = out.replace(/\sstyle=''\s*/gi, ' ');

  return out;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const TABLE_CELL_EMPTY_HTML = '<p><br></p>';

const DISALLOWED_CELL_TAG =
  /<\/?(?:script|style|iframe|object|embed|table|thead|tbody|tr|td|th|colgroup|col|h[1-6])\b[^>]*>/gi;

function stripCellHtml(inner: string): string {
  return inner
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keep bold/links/etc. inside table cells while dropping Docs cruft. */
export function sanitizeCellRichContent(inner: string): string {
  let out = sanitizeImportedHtml(inner.trim());
  out = out.replace(
    /<span[^>]*font-weight:\s*(?:700|bold)[^>]*>([\s\S]*?)<\/span>/gi,
    '<strong>$1</strong>',
  );
  out = out.replace(DISALLOWED_CELL_TAG, '');
  out = out.replace(/\sstyle="[^"]*"/gi, '');
  out = out.replace(/\sdir="ltr"/gi, '');
  out = out.replace(/\sclass="[^"]*"/gi, '');
  out = out.replace(/<span>([\s\S]*?)<\/span>/gi, '$1');

  const plain = stripCellHtml(out);
  const hasInlineMarkup = /<(?:p|br|strong|b|em|i|u|s|strike|a)\b/i.test(out);

  if (!plain && !hasInlineMarkup) {
    return TABLE_CELL_EMPTY_HTML;
  }

  if (!hasInlineMarkup) {
    return `<p>${escapeHtml(plain)}</p>`;
  }

  if (!/<p[\s>]/i.test(out)) {
    out = `<p>${out}</p>`;
  }

  return out;
}

/** Rebuild a pasted Docs/Word table into clean thead/tbody markup. */
export function rebuildTableFromHtml(tableHtml: string): string {
  const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const matrix = rowMatches
    .map((row) =>
      [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        sanitizeCellRichContent(cell[1]),
      ),
    )
    .filter((row) => row.length > 0);

  if (matrix.length === 0) return tableHtml;

  const [header, ...body] = matrix;
  const headerRow = `<tr>${header.map((h) => `<th scope="col">${h}</th>`).join('')}</tr>`;
  const bodyRows = body
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('');

  return `<table class="post-content-table"><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
}

/** Full cleanup for blog posts pasted from Google Docs. */
export function normalizeBlogPostHtml(html: string): string {
  let out = sanitizeImportedHtml(html);

  out = out.replace(/<table[\s\S]*?<\/table>/gi, (table) => rebuildTableFromHtml(table));

  out = out.replace(
    /<p[^>]*>\s*<span[^>]*>\s*Are free Reddit proxies worth using\?\s*<\/span>\s*<\/p>/i,
    '<h3>Are free Reddit proxies worth using?</h3>',
  );

  return out;
}

export function buildTableHtml(dataRows: number, colCount: number): string {
  const cols = clampTableDimension(colCount, 1, 8);
  const rows = clampTableDimension(dataRows, 1, 30);

  const header = `<tr>${Array.from(
    { length: cols },
    (_, i) => `<th scope="col"><p>Header ${i + 1}</p></th>`,
  ).join('')}</tr>`;
  const body = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () => `<td>${TABLE_CELL_EMPTY_HTML}</td>`).join('')}</tr>`,
  ).join('');

  return `<table class="post-content-table"><thead>${header}</thead><tbody>${body}</tbody></table><p><br></p>`;
}

export type TableSelection = {
  table: HTMLTableElement;
  cell: HTMLTableCellElement;
};

export function getTableSelection(root: HTMLElement | null): TableSelection | null {
  if (!root) return null;

  const sel = window.getSelection();
  if (!sel?.rangeCount || !root.contains(sel.anchorNode)) return null;

  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  if (!(node instanceof Element)) return null;

  const cell = node.closest('td, th');
  if (!(cell instanceof HTMLTableCellElement) || !root.contains(cell)) return null;

  const table = cell.closest('table');
  if (!(table instanceof HTMLTableElement) || !root.contains(table)) return null;

  return { table, cell };
}

function rowUsesHeaderCells(row: HTMLTableRowElement): boolean {
  return row.parentElement?.tagName === 'THEAD' || Array.from(row.cells).some((c) => c.tagName === 'TH');
}

export function addTableRowBelow(cell: HTMLTableCellElement): void {
  const row = cell.parentElement;
  if (!(row instanceof HTMLTableRowElement)) return;

  const table = cell.closest('table');
  if (!table) return;

  const section = row.parentElement;
  if (!(section instanceof HTMLTableSectionElement)) return;

  const newRow = document.createElement('tr');
  const asHeader = rowUsesHeaderCells(row);

  for (let i = 0; i < row.cells.length; i++) {
    const c = document.createElement(asHeader ? 'th' : 'td');
    c.innerHTML = TABLE_CELL_EMPTY_HTML;
    newRow.appendChild(c);
  }

  section.insertBefore(newRow, row.nextSibling);
}

/** Wrap bare text in table cells so inline formatting (bold, links) works in contentEditable. */
export function ensureTableCellsEditable(root: HTMLElement): void {
  root.querySelectorAll('table td, table th').forEach((cell) => {
    if (!(cell instanceof HTMLTableCellElement)) return;

    const html = cell.innerHTML.trim();
    if (!html || html === '&nbsp;') {
      cell.innerHTML = TABLE_CELL_EMPTY_HTML;
      return;
    }

    if (cell.querySelector('p, ul, ol')) return;

    cell.innerHTML = sanitizeCellRichContent(html);
  });
}

export function deleteTableRow(cell: HTMLTableCellElement): void {
  const row = cell.parentElement;
  if (!(row instanceof HTMLTableRowElement)) return;

  const table = cell.closest('table');
  if (!table) return;

  const dataRows = table.tBodies.length ? Array.from(table.tBodies).flatMap((tb) => Array.from(tb.rows)) : [];
  const headerRows = table.tHead ? Array.from(table.tHead.rows) : [];
  const totalRows = headerRows.length + dataRows.length;

  if (totalRows <= 1) return;

  row.remove();
}

export function addTableColumn(cell: HTMLTableCellElement, after = true): void {
  const table = cell.closest('table');
  if (!table) return;

  const insertIndex = cell.cellIndex + (after ? 1 : 0);

  Array.from(table.rows).forEach((row) => {
    const asHeader = rowUsesHeaderCells(row);
    const c = document.createElement(asHeader ? 'th' : 'td');
    c.innerHTML = TABLE_CELL_EMPTY_HTML;
    const ref = row.cells[insertIndex] ?? null;
    if (ref) row.insertBefore(c, ref);
    else row.appendChild(c);
  });
}

export function deleteTableColumn(cell: HTMLTableCellElement): void {
  const table = cell.closest('table');
  if (!table) return;

  const colCount = table.rows[0]?.cells.length ?? 0;
  if (colCount <= 1) return;

  const index = cell.cellIndex;

  Array.from(table.rows).forEach((row) => {
    row.cells[index]?.remove();
  });
}

export function deleteTable(table: HTMLTableElement): void {
  const next = table.nextElementSibling;
  table.remove();
  if (next instanceof HTMLParagraphElement && next.innerHTML.trim() === '<br>') {
    next.remove();
  }
}
