const bird = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M5 26 18 27 26 12a8 8 0 0 1 14 4l5 3-5 2c0 11-8 16-18 16-8 0-13-4-17-11Z" fill="var(--bird-fill,#9cb0ff)"/><path d="m17 27 15-5-5 12-10-7Z" fill="var(--bird-wing,#5865e7)"/><path d="M24 38v3m8-4v4" stroke="var(--bird-fill,#9cb0ff)" stroke-width="2" stroke-linecap="round"/><circle cx="35.5" cy="15.5" r="1.6" fill="#20244c"/><path d="M7 21h8m-5-5h5" stroke="var(--bird-fill,#9cb0ff)" stroke-width="1.6" stroke-linecap="round" opacity=".7"/></svg>`;

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
      <div class="guide-panel-brand"><span class="guide-brand-mark">${bird}</span><div><h2 id="portfolio-guide-title">Portfolio guide</h2><p class="guide-kicker"><span aria-hidden="true"></span> AI assistant</p></div></div>
      <button type="button" class="guide-close" data-guide-close aria-label="Close field guide">×</button>
    </header>
    <div class="guide-conversation" data-guide-thread aria-label="Conversation">
      <div class="guide-welcome" data-guide-welcome>
        <span class="guide-welcome-mark">${bird}</span>
        <h3>Explore the work.</h3>
        <p>Ask about LetzGo, Popin, or Chirag’s experience.</p>
        <p class="guide-suggestions-label">Suggested questions</p>
        <div class="guide-starters" data-guide-starters aria-label="Suggested questions"></div>
      </div>
      <div class="guide-turns" data-guide-turns></div>
    </div>
    <form class="guide-compose" data-guide-form>
      <p class="guide-status mono" data-guide-status role="status" hidden></p>
      <div class="guide-input-row"><label class="sr-only" for="portfolio-guide-input">Your question</label><input id="portfolio-guide-input" name="question" type="text" maxlength="600" placeholder="Ask a question…" autocomplete="off" required><button type="submit" class="guide-send" aria-label="Send question">↑</button></div>
      <p class="guide-disclosure">Answers from case studies and the latest résumé</p>
    </form>
  </dialog>
</aside>`;
