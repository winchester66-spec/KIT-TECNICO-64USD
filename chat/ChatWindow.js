/**
 * ChatWindow.js — the chat conversation window.
 */

import { Message } from './Message.js';
import { TypingIndicator } from './TypingIndicator.js';
import { initFaqEngine, getReply } from './faqEngine.js';
import { SITE } from '../config.js';

export class ChatWindow {
  constructor() {
    this.STORAGE_KEY = 'ana_chat_history';
    this.messages = [];
    this.windowEl = null;
    this.messagesEl = null;
    this.textareaEl = null;
    this.sendBtnEl = null;
    this.suggestionsEl = null;
    this.typingIndicator = null;
    this.isGeneratingResponse = false;
  }

  async init() {
    // Load the local knowledge base (knowledge/faq.json)
    await initFaqEngine();

    if (document.getElementById('ana-chat-window')) return;

    const win = document.createElement('div');
    win.id = 'ana-chat-window';
    win.className = 'ana-chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Chat with Ana');
    const avatarUrl = new URL('./ana-avatar.png', import.meta.url).href;
    win.innerHTML = `
      <div class="ana-chat-header">
        <div class="ana-chat-header-profile">
          <div class="ana-chat-avatar-container">
            <img src="${avatarUrl}" alt="Ana" class="ana-chat-avatar" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22 fill=%22%2300ff88%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22/><text x=%2250%25%22 y=%2255%25%22 font-size=%2226%22 text-anchor=%22middle%22 fill=%22%230b0f19%22 font-family=%22Outfit,sans-serif%22 font-weight=%22bold%22>A</text></svg>'"/>
            <div class="ana-chat-header-status-dot"></div>
          </div>
          <div class="ana-chat-header-info">
            <span class="ana-chat-header-name">Ana</span>
            <span class="ana-chat-header-status"><span style="font-size:8px;">●</span> Online now</span>
          </div>
        </div>
        <div class="ana-chat-header-controls">
          <button class="ana-chat-control-btn minimize" id="ana-chat-minimize" title="Minimize" aria-label="Minimize">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>
          </button>
          <button class="ana-chat-control-btn close" id="ana-chat-close" title="Close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <div class="ana-chat-messages" id="ana-chat-messages"></div>

      <div class="ana-chat-suggestions" id="ana-chat-suggestions"></div>

      <div class="ana-chat-input-area">
        <div class="ana-chat-input-wrapper">
          <textarea
            id="ana-chat-textarea"
            class="ana-chat-textarea"
            placeholder="Ask about the ${SITE.productName}..."
            rows="1"
            aria-label="Your message"></textarea>
        </div>
        <button id="ana-chat-send-btn" class="ana-chat-send-btn" title="Send message" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    `;

    document.body.appendChild(win);

    this.windowEl = win;
    this.messagesEl = win.querySelector('#ana-chat-messages');
    this.textareaEl = win.querySelector('#ana-chat-textarea');
    this.sendBtnEl = win.querySelector('#ana-chat-send-btn');
    this.suggestionsEl = win.querySelector('#ana-chat-suggestions');

    this.typingIndicator = new TypingIndicator(this.messagesEl);
    this.registerEvents();
    this.renderSuggestions();
    this.loadHistory();
  }

  registerEvents() {
    this.windowEl.querySelector('#ana-chat-minimize').addEventListener('click', () => this.close());
    this.windowEl.querySelector('#ana-chat-close').addEventListener('click', () => this.close());

    this.sendBtnEl.addEventListener('click', () => this.handleUserSend());

    this.textareaEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSend();
      }
    });

    this.textareaEl.addEventListener('input', () => {
      this.adjustTextareaHeight();
      this.toggleSendButtonState();
    });
  }

  /** Three quick questions that cover the most common buying doubts */
  renderSuggestions() {
    if (!this.suggestionsEl) return;
    const suggestions = [
      'What exactly is included?',
      'How fast do I get it?',
      'Does it work on Windows 11?',
      'Is there a free option?',
    ];
    this.suggestionsEl.innerHTML = suggestions
      .map((s) => `<button type="button" class="ana-chat-suggestion">${s}</button>`)
      .join('');

    this.suggestionsEl.querySelectorAll('.ana-chat-suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.textareaEl.value = btn.textContent;
        this.adjustTextareaHeight();
        this.toggleSendButtonState();
        this.handleUserSend();
      });
    });
  }

  adjustTextareaHeight() {
    this.textareaEl.style.height = 'auto';
    this.textareaEl.style.height = Math.min(this.textareaEl.scrollHeight, 100) + 'px';
  }

  toggleSendButtonState() {
    const hasText = this.textareaEl.value.trim().length > 0 && !this.isGeneratingResponse;
    this.sendBtnEl.classList.toggle('active', hasText);
  }

  isOpen() {
    return this.windowEl && this.windowEl.classList.contains('active');
  }

  open() {
    if (this.windowEl) {
      this.windowEl.classList.add('active');
      this.textareaEl.focus();
      this.scrollToBottom();
    }
  }

  close() {
    if (this.windowEl) this.windowEl.classList.remove('active');
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  scrollToBottom() {
    if (this.messagesEl) this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  loadHistory() {
    let raw = null;
    try {
      raw = localStorage.getItem(this.STORAGE_KEY);
    } catch (err) {
      console.warn('Could not read the chat history:', err);
    }

    if (raw) {
      try {
        this.messages = JSON.parse(raw);
        this.messages.forEach((msg) => Message.renderInstant(this.messagesEl, msg.role, msg.content));
        this.scrollToBottom();
      } catch (err) {
        console.error('Could not parse the chat history:', err);
        this.messages = [];
      }
    }

    if (this.messages.length === 0) {
      setTimeout(() => this.triggerInitialGreeting(), 900);
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages));
    } catch (err) {
      console.warn('Could not save the chat history:', err);
    }
  }

  async triggerInitialGreeting() {
    if (this.messages.length > 0) return;

    this.isGeneratingResponse = true;
    this.typingIndicator.show();
    this.scrollToBottom();

    const greetingText = `Hi there 👋

I'm Ana, the assistant for the **${SITE.productName}**.

I can explain what's included, how delivery works, how to prepare your USB drive, or help you decide whether it fits your repair work.`;

    setTimeout(async () => {
      this.typingIndicator.hide();

      const responseMsg = { role: 'assistant', content: greetingText };
      this.messages.push(responseMsg);
      this.saveHistory();

      await Message.renderTypewriter(this.messagesEl, greetingText, () => this.scrollToBottom());

      this.isGeneratingResponse = false;
      this.toggleSendButtonState();
    }, 1200);
  }

  async handleUserSend() {
    if (this.isGeneratingResponse) return;

    const text = this.textareaEl.value.trim();
    if (!text) return;

    this.textareaEl.value = '';
    this.adjustTextareaHeight();
    this.toggleSendButtonState();

    this.isGeneratingResponse = true;

    const userMsg = { role: 'user', content: text };
    this.messages.push(userMsg);
    this.saveHistory();

    Message.renderInstant(this.messagesEl, 'user', text);
    this.scrollToBottom();

    this.typingIndicator.show();
    this.scrollToBottom();

    // Small human-like delay before answering
    const typingDelay = 700 + Math.random() * 700;

    setTimeout(async () => {
      this.typingIndicator.hide();

      try {
        const matched = getReply(text);
        const replyContent = matched.followup
          ? `${matched.response}\n\n${matched.followup}`
          : matched.response;

        const assistantMsg = { role: 'assistant', content: replyContent };
        this.messages.push(assistantMsg);
        this.saveHistory();

        await Message.renderTypewriter(this.messagesEl, replyContent, () => this.scrollToBottom());
      } catch (err) {
        console.error('Local FAQ engine error:', err);
        this.typingIndicator.hide();
        const errorText = `Sorry, I hit a problem looking that up. Could you try asking again? You can also write to ${SITE.supportEmail}.`;
        Message.renderInstant(this.messagesEl, 'assistant', errorText);
        this.scrollToBottom();
      } finally {
        this.isGeneratingResponse = false;
        this.toggleSendButtonState();
        this.textareaEl.focus();
      }
    }, typingDelay);
  }
}
