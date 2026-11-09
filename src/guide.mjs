const bird = `<svg viewBox="0 0 64 54" fill="none" aria-hidden="true"><path d="M13 48h36" stroke="currentColor" stroke-opacity=".22" stroke-width="1.3" stroke-linecap="round"/><path d="m23 41-2 6h-5m19-6 2 6h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 34 4 25l16 2c5-10 10-15 18-16 8-1 13 4 14 10l8 4-8 3c-1 9-9 15-22 15-8 0-13-3-16-9Z" fill="var(--bird-fill,#eed29b)" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m20 28 18 1-10 10-8-11Z" fill="var(--bird-wing,#d8a95e)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="m32 13 1-6 5 4m-1 1 4-6 2 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="45" cy="20" r="1.8" fill="currentColor"/></svg>`;

export const guide = `<aside class="field-guide" data-field-guide hidden aria-label="Portfolio field guide">
  <div class="guide-visitor" data-guide-visitor hidden>
    <span class="guide-visitor-bird" aria-hidden="true">${bird}</span>
    <section class="guide-note" aria-label="A note from the field guide">
      <div class="guide-note-head"><span class="mono" data-guide-note-topic></span><button type="button" data-guide-dismiss aria-label="Dismiss note">×</button></div>
      <p data-guide-note-text></p>
      <button type="button" class="guide-note-action" data-guide-note-ask>Tell me more <span aria-hidden="true">↗</span></button>
    </section>
  </div>
  <button type="button" class="guide-launch" data-guide-open aria-haspopup="dialog" aria-controls="portfolio-guide" aria-expanded="false">
    <span class="guide-launch-mark">${bird}</span><span>Ask the guide</span><span class="guide-launch-arrow" aria-hidden="true">↗</span>
  </button>
  <dialog id="portfolio-guide" class="guide-panel" aria-labelledby="portfolio-guide-title">
    <header class="guide-panel-head">
      <div class="guide-panel-brand"><span class="guide-brand-mark">${bird}</span><div><p class="mono guide-kicker">CHIRAG’S PORTFOLIO</p><h2 id="portfolio-guide-title">Field guide<span>.</span></h2></div></div>
      <button type="button" class="guide-close" data-guide-close aria-label="Close field guide">×</button>
    </header>
    <div class="guide-conversation" data-guide-thread aria-label="Conversation">
      <div class="guide-welcome" data-guide-welcome>
        <div class="guide-welcome-art" aria-hidden="true"><span></span><div>${bird}</div><span></span></div>
        <p class="mono guide-kicker">A SMALL GUIDE TO THE WORK</p>
        <h3>Curious about<br>something?</h3>
        <p>Ask about a project, an engineering decision, or Chirag’s work.</p>
        <div class="guide-starters" data-guide-starters aria-label="Suggested questions"></div>
      </div>
      <div class="guide-turns" data-guide-turns></div>
    </div>
    <form class="guide-compose" data-guide-form>
      <p class="guide-status mono" data-guide-status role="status" hidden></p>
      <div class="guide-input-row"><label class="sr-only" for="portfolio-guide-input">Your question</label><input id="portfolio-guide-input" name="question" type="text" maxlength="600" placeholder="Ask a question…" autocomplete="off" required><button type="submit" class="guide-send" aria-label="Send question">↑</button></div>
      <p class="guide-disclosure">AI guide · Based on portfolio and case study notes</p>
    </form>
  </dialog>
</aside>`;
