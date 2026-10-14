/**
 * Message.js — chat bubble rendering and formatting.
 */

export class Message {
  /** Escapes HTML to protect against XSS. */
  static escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Formats raw text with light Markdown support and line breaks.
   * Supports **bold**, [links](url) and "- " bullet lists.
   */
  static formatText(text) {
    let escaped = this.escapeHtml(text);

    // Bold: **text** -> <strong>text</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Markdown links: [text](url)
    escaped = escaped.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Simple bullet lists
    const lines = escaped.split('\n');
    let inList = false;
    const formattedLines = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          formattedLines.push('<ul>');
          inList = true;
        }
        formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(line);
      }
    }

    if (inList) formattedLines.push('</ul>');

    let html = formattedLines.join('\n');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><ul>/g, '<ul>').replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><li>/g, '<li>').replace(/<\/li><br>/g, '</li>');

    return html;
  }

  /** Renders a message instantly (used for restored history). */
  static renderInstant(container, role, text) {
    const row = document.createElement('div');
    row.className = `ana-chat-msg-row ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'ana-chat-bubble';
    bubble.innerHTML = this.formatText(text);

    row.appendChild(bubble);
    container.appendChild(row);
  }

  /** Renders a message with a typewriter animation. */
  static renderTypewriter(container, text, onTick) {
    return new Promise((resolve) => {
      const row = document.createElement('div');
      row.className = 'ana-chat-msg-row assistant';

      const bubble = document.createElement('div');
      bubble.className = 'ana-chat-bubble ana-typewriter-cursor';
      row.appendChild(bubble);
      container.appendChild(row);

      let currentText = '';
      let index = 0;
      const speed = 12; // ms per character

      function type() {
        if (index < text.length) {
          currentText += text.charAt(index);
          bubble.innerHTML = Message.formatText(currentText);
          index++;
          if (onTick) onTick();
          setTimeout(type, speed);
        } else {
          bubble.classList.remove('ana-typewriter-cursor');
          resolve();
        }
      }

      type();
    });
  }
}
