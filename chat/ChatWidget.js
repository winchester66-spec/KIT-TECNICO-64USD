/**
 * ChatWidget.js — launcher button + lazy loading of the chat window.
 * All user-facing strings are in English.
 */

import { SITE } from '../config.js';

(function () {
  const STORAGE_KEY = 'ana_chat_history';
  let chatWindowInstance = null;
  let hasHistory = false;
  try {
    hasHistory = localStorage.getItem(STORAGE_KEY) !== null;
  } catch (e) {
    console.warn('LocalStorage is disabled or unavailable:', e);
  }

  // 1) Inject the widget stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./chat.css', import.meta.url).href;
  document.head.appendChild(link);

  // 2) Mount the launcher once the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLauncher);
  } else {
    initLauncher();
  }

  function initLauncher() {
    const launcher = document.createElement('div');
    launcher.id = 'ana-chat-launcher';
    launcher.className = 'ana-chat-launcher';
    launcher.setAttribute('role', 'button');
    launcher.setAttribute('tabindex', '0');
    launcher.setAttribute('aria-label', 'Chat with Ana, our virtual assistant');
    launcher.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.4 9.4 0 0 1-3.5-.6L3 21l1.7-4.2A8.3 8.3 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/>
      </svg>
      <div class="ana-chat-badge"></div>
      <div class="ana-chat-badge-pulse"></div>
    `;

    document.body.appendChild(launcher);

    launcher.addEventListener('click', openChatWindow);
    launcher.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChatWindow(); }
    });

    // 3) Show the opening bubble after a few seconds (only on first visit)
    if (!hasHistory) {
      setTimeout(showInitialSpeechBubble, 3500);
    }
  }

  function showInitialSpeechBubble() {
    if (chatWindowInstance && chatWindowInstance.isOpen()) return;
    if (document.getElementById('ana-speech-bubble')) return;

    const bubble = document.createElement('div');
    bubble.id = 'ana-speech-bubble';
    bubble.className = 'ana-chat-speech-bubble';
    bubble.innerHTML = `
      <div class="bubble-header">
        <span>Ana • Product assistant</span>
        <span class="bubble-close" id="ana-bubble-close" title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </span>
      </div>
      <div>Hi 👋 I'm Ana, the assistant for the ${SITE.productName}. Questions about what's included, the price, delivery or your USB drive?</div>
      <div class="bubble-footer" id="ana-bubble-start">Chat now</div>
    `;

    document.body.appendChild(bubble);

    document.getElementById('ana-bubble-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeSpeechBubble();
    });

    document.getElementById('ana-bubble-start').addEventListener('click', (e) => {
      e.stopPropagation();
      closeSpeechBubble();
      openChatWindow();
    });
  }

  function closeSpeechBubble() {
    const bubble = document.getElementById('ana-speech-bubble');
    if (bubble) {
      bubble.style.opacity = '0';
      bubble.style.transform = 'translateY(15px)';
      bubble.style.transition = 'all 0.3s ease';
      setTimeout(() => bubble.remove(), 300);
    }
  }

  async function openChatWindow() {
    closeSpeechBubble();

    if (chatWindowInstance) {
      chatWindowInstance.toggle();
      return;
    }

    try {
      const { ChatWindow } = await import('./ChatWindow.js');
      chatWindowInstance = new ChatWindow();
      await chatWindowInstance.init();
      chatWindowInstance.open();
    } catch (err) {
      console.error('Could not load the chat window:', err);
    }
  }
})();
