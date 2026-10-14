/**
 * TypingIndicator.js — the "Ana is typing" indicator.
 */

export class TypingIndicator {
  constructor(container) {
    this.container = container;
    this.element = null;
  }

  show() {
    if (this.element) return;

    const row = document.createElement('div');
    row.className = 'ana-chat-msg-row assistant';
    row.id = 'ana-typing-indicator';
    row.innerHTML = `
      <div class="ana-chat-bubble" style="padding: 8px 12px;">
        <div class="ana-typing-container">
          <div class="ana-typing-dots">
            <span class="ana-typing-dot"></span>
            <span class="ana-typing-dot"></span>
            <span class="ana-typing-dot"></span>
          </div>
          <span class="ana-typing-text">Ana is typing…</span>
        </div>
      </div>
    `;

    this.element = row;
    this.container.appendChild(row);
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}
