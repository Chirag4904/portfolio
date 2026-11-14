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
        <button type="button" data-guide-topic="site" aria-pressed="true"><span aria-hidden="true">⌂</span> Explore</button>
        <button type="button" data-guide-topic="letzgo" aria-pressed="false"><span aria-hidden="true">↗</span> LetzGo</button>
        <button type="button" data-guide-topic="popin" aria-pressed="false"><span aria-hidden="true">◌</span> Popin</button>
        <button type="button" data-guide-topic="ez-allocate" aria-pressed="false"><span aria-hidden="true">+</span> EZ-Allocate</button>
        <button type="button" data-guide-topic="resume" aria-pressed="false"><span aria-hidden="true">□</span> Resume</button>
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
