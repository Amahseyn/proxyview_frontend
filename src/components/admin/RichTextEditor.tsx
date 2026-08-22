'use client';

import React, { useRef, useState, useEffect } from 'react';
import { uploadImage } from '@/lib/api';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'split'>('visual');
  const [codeValue, setCodeValue] = useState(value);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  // Synchronize initial and external content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    setCodeValue(value || '');
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
    executeCommand('formatBlock', tag);
  };

  // Apply custom text color
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('foreColor', e.target.value);
  };

  // Apply custom background / highlight color
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('hiliteColor', e.target.value);
  };

  // Insert Link
  const handleInsertLink = () => {
    const url = prompt('Enter the destination URL (e.g. https://...):');
    if (url) {
      executeCommand('createLink', url);
    }
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
      {/* TOOLBAR */}
      <div className="rich-toolbar">
        {/* Undo / Redo */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
            onClick={() => executeCommand('undo')}
          >
            ↩
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Redo (Ctrl+Y)"
            onClick={() => executeCommand('redo')}
          >
            ↪
          </button>
        </div>

        {/* Headings & Block Type */}
        <div className="toolbar-group">
          <select
            className="toolbar-select"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleFormatBlock(e.target.value);
            }}
            title="Heading Style"
          >
            <option value="">Text Style</option>
            <option value="<p>">Normal Paragraph</option>
            <option value="<h1>">Heading 1 (H1)</option>
            <option value="<h2>">Heading 2 (H2)</option>
            <option value="<h3>">Heading 3 (H3)</option>
            <option value="<h4>">Heading 4 (H4)</option>
            <option value="<blockquote>">Quote Block</option>
            <option value="<pre>">Code Block</option>
          </select>
        </div>

        {/* Font Size Selector */}
        <div className="toolbar-group">
          <select
            className="toolbar-select"
            defaultValue=""
            onChange={(e) => {
              handleFontSizeChange(e.target.value);
            }}
            title="Font Size"
          >
            <option value="">Font Size</option>
            <option value="12px">12px (Small)</option>
            <option value="14px">14px (Compact)</option>
            <option value="16px">16px (Normal)</option>
            <option value="18px">18px (Medium)</option>
            <option value="20px">20px (Large)</option>
            <option value="24px">24px (XL)</option>
            <option value="28px">28px (2XL)</option>
            <option value="34px">34px (3XL)</option>
          </select>
        </div>

        {/* Text Styling: Bold, Italic, Underline, Strike */}
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

        {/* Text Alignment */}
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
            title="Align Left"
            onClick={() => executeCommand('justifyLeft')}
          >
            ⇤
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
            title="Align Center"
            onClick={() => executeCommand('justifyCenter')}
          >
            ≡
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.justifyRight ? 'active' : ''}`}
            title="Align Right"
            onClick={() => executeCommand('justifyRight')}
          >
            ⇥
          </button>
        </div>

        {/* Lists & Indents */}
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
            title="Bullet List"
            onClick={() => executeCommand('insertUnorderedList')}
          >
            •≡
          </button>
          <button
            type="button"
            className={`toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
            title="Numbered List"
            onClick={() => executeCommand('insertOrderedList')}
          >
            1.≡
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Horizontal Divider"
            onClick={() => executeCommand('insertHorizontalRule')}
          >
            ―
          </button>
        </div>

        {/* Color Pickers */}
        <div className="toolbar-group color-pickers">
          <label className="color-label" title="Text Color">
            <span>A</span>
            <input
              type="color"
              defaultValue="#000000"
              onChange={handleTextColorChange}
            />
          </label>
          <label className="color-label bg-color" title="Highlight Color">
            <span>🖍</span>
            <input
              type="color"
              defaultValue="#FFE300"
              onChange={handleBgColorChange}
            />
          </label>
        </div>

        {/* Link & Media */}
        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            title="Insert Link"
            onClick={handleInsertLink}
          >
            🔗
          </button>
          <button
            type="button"
            className="toolbar-btn"
            title="Insert Image by URL"
            onClick={handleInsertImageUrl}
          >
            🖼️ URL
          </button>
          <label className="toolbar-file-btn" title="Upload Image File">
            <span>{isUploading ? '⏳ Uploading...' : '📁 Upload Img'}</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleImageFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* View Switcher: Visual, Code, Split */}
        <div className="toolbar-group view-switcher">
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
            &lt;/&gt; Code
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
          >
            Split Preview
          </button>
        </div>
      </div>

      {/* EDITOR CONTENT AREA */}
      <div className={`editor-container view-${viewMode}`}>
        {/* VISUAL WYSIWYG EDITOR */}
        {(viewMode === 'visual' || viewMode === 'split') && (
          <div
            ref={editorRef}
            className="editor-content visual-pane"
            contentEditable
            onInput={handleInput}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
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
        <span className="tip">Tip: Highlight text to change font size, bold, heading, or colors.</span>
      </div>
    </div>
  );
}
