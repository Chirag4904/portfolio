const topicIcons = {
  home: '<svg class="guide-topic-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-7h6v7"/></svg>',
  car: '<svg class="guide-topic-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16 1.6-6.2A2 2 0 0 1 8.5 8h7a2 2 0 0 1 1.9 1.8L19 16"/><path d="M4 16h16v4H4Z"/><path d="M7 20v1m10-1v1M7.5 13h.01m9-.01h.01"/></svg>',
  pin: '<svg class="guide-topic-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.3-8 11-8 11S4 15.3 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  allocate: '<svg class="guide-topic-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v3H9zM9 11l1.4 1.4L13 9.8m2 2.2h2m-8 5 1.4 1.4L13 14.8m2 2.2h2"/></svg>',
  resume: '<svg class="guide-topic-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M9 12h6m-6 4h6"/></svg>',
};

export const guide = `<aside class="field-guide" data-field-guide hidden aria-label="Domi, portfolio guide">
  <div class="guide-visitor" data-guide-visitor hidden>
    <section class="guide-note" aria-label="A note from Domi">
      <div class="guide-note-head"><span class="mono" data-guide-note-topic></span><button type="button" data-guide-dismiss aria-label="Dismiss Domi's note">×</button></div>
      <p data-guide-note-text></p>
      <button type="button" class="guide-note-action" data-guide-note-ask>Tell me more <span aria-hidden="true">↗</span></button>
    </section>
  </div>
  <button type="button" class="guide-launch" data-guide-open aria-haspopup="dialog" aria-controls="portfolio-guide" aria-expanded="false" aria-label="Ask Domi" title="A / D to walk · W to jump · S to drop" aria-keyshortcuts="A D W S">
    <span class="scout-label" aria-hidden="true"><span class="scout-ask-label">Ask Domi</span><span class="scout-key-label">Move me with WASD</span></span><span class="scout-sprite" aria-hidden="true"></span>
  </button>
  <dialog id="portfolio-guide" class="guide-panel" aria-labelledby="portfolio-guide-title">
    <header class="guide-panel-head">
      <button type="button" class="guide-panel-scout" data-scout-pet aria-label="Ask Domi for a fact"><span class="guide-panel-scout-spot" data-scout-home aria-hidden="true"><span class="guide-panel-scout-sprite"></span></span><span class="guide-panel-scout-copy"><strong>Surprise me</strong></span></button>
      <div><p class="mono guide-kicker">CHIRAG AGGARWAL / PORTFOLIO</p><h2 id="portfolio-guide-title">Ask Domi<span>.</span></h2></div>
      <button type="button" class="guide-close" data-guide-close aria-label="Close Domi">×</button>
    </header>
    <div class="guide-desk">
      <nav class="guide-topics" aria-label="Guide topics">
        <p class="mono">WHERE TO?</p>
        <button type="button" data-guide-topic="site" aria-pressed="true">${topicIcons.home} Explore</button>
        <button type="button" data-guide-topic="letzgo" aria-pressed="false">${topicIcons.car} LetzGo</button>
        <button type="button" data-guide-topic="popin" aria-pressed="false">${topicIcons.pin} Popin</button>
        <button type="button" data-guide-topic="ez-allocate" aria-pressed="false">${topicIcons.allocate} EZ-Allocate</button>
        <button type="button" data-guide-topic="resume" aria-pressed="false">${topicIcons.resume} Resume</button>
      </nav>
      <div class="guide-reading">
        <section class="guide-tech" data-guide-tech aria-label="Project technologies" hidden><p class="mono">PROJECT TOOLS</p><div data-guide-tech-items></div></section>
        <div class="guide-conversation" data-guide-thread aria-label="Conversation">
          <section class="guide-chat-note" data-scout-chat-note hidden aria-label="Domi's finding"><span class="guide-panel-scout-spot" data-scout-finding aria-hidden="true"></span><div><p class="mono">DOMI FOUND THIS</p><p data-scout-chat-text aria-live="polite"></p><button type="button" data-scout-chat-ask>Tell me more <span aria-hidden="true">↗</span></button></div></section>
          <div class="guide-welcome" data-guide-welcome>
            <p class="mono guide-file-label" data-guide-topic-label>00 / OVERVIEW</p><h3 data-guide-topic-heading>There’s a story behind every build.</h3><p data-guide-topic-description>Ask about the projects, the portfolio, or Chirag’s work.</p><div class="guide-starters" data-guide-starters aria-label="Suggested questions"></div>
          </div>
          <div class="guide-turns" data-guide-turns></div>
        </div>
        <form class="guide-compose" data-guide-form><p class="guide-status mono" data-guide-status role="status" hidden></p><div class="guide-input-row"><span class="guide-panel-scout-spot" data-scout-compose aria-hidden="true"></span><label class="sr-only" for="portfolio-guide-input">Your question</label><input id="portfolio-guide-input" name="question" type="text" maxlength="600" placeholder="Ask Domi a question…" autocomplete="off" required><button type="submit" class="guide-send" aria-label="Send question">↑</button></div></form>
      </div>
    </div>
  </dialog>
</aside>`;
