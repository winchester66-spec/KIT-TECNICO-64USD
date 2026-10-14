/**
 * script.js — page behaviour for the Tech Toolkit landing page.
 * 1) Injects config.js values into the page (checkout links, price, support e-mail)
 * 2) Smooth scrolling
 * 3) FAQ accordion
 * 4) Scroll reveal + sticky header state
 */

import { SITE, PRICE_LABEL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initSmoothScroll();
  initFaqAccordion();
  initScrollReveal();
  initHeaderState();
});

/* ------------------------------------------------------------------ *
 * 1) Pull the values from config.js into the DOM
 * ------------------------------------------------------------------ */
function applyConfig() {
  // Checkout links
  document.querySelectorAll('[data-checkout]').forEach((el) => {
    if (SITE.checkoutUrl && SITE.checkoutUrl !== 'PASTE-YOUR-CHECKOUT-LINK-HERE') {
      el.setAttribute('href', SITE.checkoutUrl);
      el.setAttribute('rel', 'noopener');
      el.removeAttribute('data-checkout-pending');
    } else {
      // Not configured yet: keep the visitor on the offer section instead of a dead link
      el.setAttribute('href', '#offer');
    }
  });

  // Price placeholders
  document.querySelectorAll('[data-price]').forEach((el) => {
    el.textContent = PRICE_LABEL;
  });

  // Compare-at price (only when a real previous price is set)
  document.querySelectorAll('[data-compare-price]').forEach((el) => {
    if (SITE.compareAtPrice) {
      el.textContent = `${SITE.currencySymbol}${SITE.compareAtPrice}`;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Billing / notes
  document.querySelectorAll('[data-billing]').forEach((el) => { el.textContent = SITE.billing; });
  document.querySelectorAll('[data-product-name]').forEach((el) => { el.textContent = SITE.productName; });
  document.querySelectorAll('[data-usb-size]').forEach((el) => { el.textContent = SITE.usbSize; });
  document.querySelectorAll('[data-program-count]').forEach((el) => { el.textContent = SITE.programCount; });

  // Support e-mail
  document.querySelectorAll('[data-support-email]').forEach((el) => {
    el.textContent = SITE.supportEmail;
    if (el.tagName === 'A') el.setAttribute('href', `mailto:${SITE.supportEmail}?subject=${encodeURIComponent(SITE.productName + ' — support')}`);
  });

  // Refund / guarantee badge
  document.querySelectorAll('[data-guarantee]').forEach((el) => {
    if (SITE.guaranteeDays) {
      el.textContent = `${SITE.guaranteeDays}-day money-back guarantee`;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

/* ------------------------------------------------------------------ *
 * 2) Smooth scroll for in-page anchors
 * ------------------------------------------------------------------ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileNav();
      }
    });
  });
}

/* ------------------------------------------------------------------ *
 * 3) FAQ accordion (accessible: <button> based)
 * ------------------------------------------------------------------ */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const q = other.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

/* ------------------------------------------------------------------ *
 * 4) Reveal-on-scroll + sticky header
 * ------------------------------------------------------------------ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach((t) => observer.observe(t));
}

function initHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
}

function closeMobileNav() {
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (nav) nav.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
}
