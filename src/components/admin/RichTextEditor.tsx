'use client';

import React, { useRef, useState, useEffect } from 'react';
import { uploadImage } from '@/lib/api';
import {
  addTableColumn,
  addTableRowBelow,
  buildTableHtml,
  deleteTable,
  deleteTableColumn,
  deleteTableRow,
  ensureTableCellsEditable,
  getTableSelection,
  sanitizeImportedHtml,
} from '@/lib/richTextTable';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

function ToolbarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rich-toolbar-row">
      <span className="toolbar-row-label">{label}</span>
      <div className="rich-toolbar-row-tools">{children}</div>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  label = 'Article body',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'split'>('visual');
  const [codeValue, setCodeValue] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [tableActive, setTableActive] = useState(false);

  const syncEditorHtml = (html: string, notifyParent = false) => {
    if (!editorRef.current) return html;
    editorRef.current.innerHTML = html || '';
    ensureTableCellsEditable(editorRef.current);
    const next = editorRef.current.innerHTML;
    setCodeValue(next);
    if (notifyParent) onChange(next);
    return next;
  };

  // Synchronize initial and external content
  useEffect(() => {
    if (!editorRef.current) {
      setCodeValue(value || '');
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      const next = syncEditorHtml(value || '');
      if (next !== (value || '')) {
        onChange(next);
      }
    } else {
      setCodeValue(value || '');
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCodeValue(html);
      onChange(html);
      checkActiveFormats();
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCodeValue(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const isInTableCell = () => Boolean(getTableSelection(editorRef.current));

  const checkActiveFormats = () => {
    if (!editorRef.current) return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    });
    setTableActive(Boolean(getTableSelection(editorRef.current)));
  };

  const insertHtml = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const handleInsertTable = () => {
    const rowInput = prompt('Data rows (not including header row):', '3');
    if (rowInput === null) return;
    const colInput = prompt('Columns:', '3');
    if (colInput === null) return;

    const rows = Number.parseInt(rowInput, 10);
    const cols = Number.parseInt(colInput, 10);
    if (!rows || !cols) {
      alert('Enter valid row and column counts.');
      return;
    }

    insertHtml(buildTableHtml(rows, cols));
    if (editorRef.current) ensureTableCellsEditable(editorRef.current);
    handleInput();
  };

  const withTableCell = (fn: (cell: HTMLTableCellElement) => void) => {
    const ctx = getTableSelection(editorRef.current);
    if (!ctx) return;
    fn(ctx.cell);
    handleInput();
  };

  const handleRemoveTable = () => {
    const ctx = getTableSelection(editorRef.current);
    if (!ctx) return;
    if (!confirm('Remove this entire table?')) return;
    deleteTable(ctx.table);
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData('text/html');
    if (!html) return;

    e.preventDefault();
    insertHtml(sanitizeImportedHtml(html));
  };

  const handleCleanImportedStyles = () => {
    if (!editorRef.current) return;
    const cleaned = sanitizeImportedHtml(editorRef.current.innerHTML);
    editorRef.current.innerHTML = cleaned;
    handleInput();
  };

  // Change font size cleanly using span or execCommand
  const handleFontSizeChange = (size: string) => {
    if (!size) return;
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Use execCommand('fontSize', false, sizeIndex) or wrap in span
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      // Nothing selected, execute fontSize command
      document.execCommand('fontSize', false, size);
    } else {
      const selectedContent = range.extractContents();
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.appendChild(selectedContent);
      range.insertNode(span);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }
    handleInput();
  };

  // Change block format (H1, H2, H3, H4, p, blockquote)
  const handleFormatBlock = (tag: string) => {
    if (isInTableCell()) {
      alert('Use the table formatting bar (bold, italic, link, etc.) inside cells—not heading styles.');
      return;
    }
    executeCommand('formatBlock', tag);
  };

  const handleInsertLinkInContext = () => {
    const url = prompt('Enter the destination URL (e.g. https://...):');
    if (url) executeCommand('createLink', url);
  };

  const handleRemoveLinkInCell = () => {
    executeCommand('unlink');
  };

  // Apply custom text color
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('foreColor', e.target.value);
  };

  // Apply custom background / highlight color
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('hiliteColor', e.target.value);
  };

  const handleInsertLink = () => {
    handleInsertLinkInContext();
  };

  // Insert Image via URL
  const handleInsertImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  // Upload image file and insert into editor
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadImage(file);
      if (res.success && res.url) {
        executeCommand('insertImage', res.url);
      } else {
        alert(res.message || 'Image upload failed. Try again or check server connection.');
      }
    } catch (err: any) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="rich-editor-wrapper">
      <div className="rich-editor-topbar">
        <div>
          <p className="rich-editor-title">{label}</p>
          <p className="rich-editor-subtitle">Formatting matches the live blog. Click inside a table cell for the cell toolbar.</p>
        </div>
        <div className="toolbar-group view-switcher rich-editor-view-switcher">
          <button
            type="button"
            className={`view-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
          >
            Visual
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'code' ? 'active' : ''}`}
            onClick={() => setViewMode('code')}
          >
            HTML
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
          >
            Split
          </button>
        </div>
      </div>

      <div className="rich-toolbar">
        <ToolbarRow label="Edit">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" title="Undo (Ctrl+Z)" onClick={() => executeCommand('undo')}>
              Undo
            </button>
            <button type="button" className="toolbar-btn" title="Redo (Ctrl+Y)" onClick={() => executeCommand('redo')}>
              Redo
            </button>
          </div>
          <div className="toolbar-group">
            <select
              className="toolbar-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleFormatBlock(e.target.value);
              }}
              title="Block style"
            >
              <option value="">Paragraph style</option>
              <option value="<p>">Normal paragraph</option>
              <option value="<h1>">Heading 1</option>
              <option value="<h2>">Heading 2</option>
              <option value="<h3>">Heading 3</option>
              <option value="<h4>">Heading 4</option>
              <option value="<blockquote>">Quote</option>
              <option value="<pre>">Code block</option>
            </select>
          </div>
          <div className="toolbar-group">
            <select
              className="toolbar-select"
              defaultValue=""
              onChange={(e) => handleFontSizeChange(e.target.value)}
              title="Font size"
            >
              <option value="">Size</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="34px">34px</option>
            </select>
          </div>
        </ToolbarRow>

        <ToolbarRow label="Format">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`}
            title="Strikethrough"
            onClick={() => executeCommand('strikeThrough')}
          >
            <s>S</s>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
            title="Align left"
            onClick={() => executeCommand('justifyLeft')}
          >
            Left
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
            title="Align center"
            onClick={() => executeCommand('justifyCenter')}
          >
            Center
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyRight ? 'active' : ''}`}
            title="Align right"
            onClick={() => executeCommand('justifyRight')}
          >
            Right
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
            title="Bullet list"
            onClick={() => executeCommand('insertUnorderedList')}
          >
            Bullets
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
            title="Numbered list"
            onClick={() => executeCommand('insertOrderedList')}
          >
            Numbers
          </button>
          <button type="button" className="toolbar-btn" title="Horizontal rule" onClick={() => executeCommand('insertHorizontalRule')}>
            Rule
          </button>
        </div>
        <div className="toolbar-group color-pickers">
          <label className="color-label" title="Text color">
            <span className="color-label-text">Text</span>
            <input type="color" defaultValue="#000000" onChange={handleTextColorChange} />
          </label>
          <label className="color-label bg-color" title="Highlight">
            <span className="color-label-text">Mark</span>
            <input type="color" defaultValue="#FFE300" onChange={handleBgColorChange} />
          </label>
        </div>
        </ToolbarRow>

        <ToolbarRow label="Table">
          <div className="toolbar-group table-toolbar">
            <button type="button" className="toolbar-btn toolbar-btn-primary" title="Insert table" onClick={handleInsertTable}>
              Insert table
            </button>
            <button type="button" className="toolbar-btn" title="Add row below" disabled={!tableActive} onClick={() => withTableCell(addTableRowBelow)}>
              + Row
            </button>
            <button type="button" className="toolbar-btn" title="Remove row" disabled={!tableActive} onClick={() => withTableCell(deleteTableRow)}>
              − Row
            </button>
            <button type="button" className="toolbar-btn" title="Add column" disabled={!tableActive} onClick={() => withTableCell((cell) => addTableColumn(cell, true))}>
              + Col
            </button>
            <button type="button" className="toolbar-btn" title="Remove column" disabled={!tableActive} onClick={() => withTableCell(deleteTableColumn)}>
              − Col
            </button>
            <button type="button" className="toolbar-btn" title="Delete table" disabled={!tableActive} onClick={handleRemoveTable}>
              Delete table
            </button>
            <button type="button" className="toolbar-btn" title="Remove pasted Docs backgrounds" onClick={handleCleanImportedStyles}>
              Clean paste
            </button>
          </div>
        </ToolbarRow>

        <ToolbarRow label="Media">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" title="Insert link" onClick={handleInsertLink}>
              Link
            </button>
            <button type="button" className="toolbar-btn" title="Image from URL" onClick={handleInsertImageUrl}>
              Image URL
            </button>
            <label className="toolbar-file-btn" title="Upload image">
              <span>{isUploading ? 'Uploading…' : 'Upload image'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={handleImageFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </ToolbarRow>
      </div>

      {tableActive && (viewMode === 'visual' || viewMode === 'split') && (
        <div className="table-cell-toolbar" role="toolbar" aria-label="Table cell formatting">
          <span className="table-cell-toolbar-label">Table cell</span>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.bold ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.italic ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.underline ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`}
            title="Strikethrough"
            onClick={() => executeCommand('strikeThrough')}
          >
            <s>S</s>
          </button>
          <button type="button" className="toolbar-btn" title="Insert link" onClick={handleInsertLinkInContext}>
            🔗
          </button>
          <button type="button" className="toolbar-btn" title="Remove link" onClick={handleRemoveLinkInCell}>
            ✕ Link
          </button>
          <label className="color-label table-cell-color" title="Text color">
            <span>A</span>
            <input type="color" defaultValue="#000000" onChange={handleTextColorChange} />
          </label>
          <label className="color-label bg-color table-cell-color" title="Highlight">
            <span>🖍</span>
            <input type="color" defaultValue="#FFE300" onChange={handleBgColorChange} />
          </label>
          <button
            type="button"
            className="toolbar-btn"
            title="Clear inline formatting in selection"
            onClick={() => executeCommand('removeFormat')}
          >
            Clear
          </button>
        </div>
      )}

      {/* EDITOR CONTENT AREA */}
      <div className={`editor-container view-${viewMode}`}>
        {/* VISUAL WYSIWYG EDITOR */}
        {(viewMode === 'visual' || viewMode === 'split') && (
          <div
            ref={editorRef}
            className="editor-content visual-pane"
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onClick={checkActiveFormats}
            data-placeholder={placeholder || 'Write post content here... You can select text to bold, change font size, format headings, add images, and more.'}
          />
        )}

        {/* HTML SOURCE CODE EDITOR */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <textarea
            className="editor-code code-pane"
            value={codeValue}
            onChange={handleCodeChange}
            placeholder="<p>Raw HTML content...</p>"
          />
        )}
      </div>

      {/* STATUS BAR */}
      <div className="editor-status-bar">
        <span>Characters: {codeValue.replace(/<[^>]*>/g, '').length}</span>
        <span>Words: {codeValue.replace(/<[^>]*>/g, '').trim() ? codeValue.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0}</span>
        <span className="tip">
          Tip: Click inside a table cell to use the cell format bar (bold, links, colors). Main toolbar works for the rest of the post.
        </span>
      </div>
    </div>
  );
}
