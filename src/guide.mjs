const signal = `<svg viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M22 3v6m0 26v6M3 22h6m26 0h6" stroke="currentColor" stroke-width="1.5" opacity=".5"/><circle cx="22" cy="22" r="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="36 8 9 10"/><path d="m30 14-4 12-12 4 4-12 12-4Z" fill="currentColor"/><circle cx="22" cy="22" r="2" fill="#1c211c"/></svg>`;

export const guide = `<aside class="field-guide" data-field-guide hidden aria-label="Portfolio guide">
  <div class="guide-visitor" data-guide-visitor hidden>
    <span class="guide-visitor-mark" aria-hidden="true">${signal}</span>
    <section class="guide-note" aria-label="A portfolio field note">
      <div class="guide-note-head"><span class="mono" data-guide-note-topic></span><button type="button" data-guide-dismiss aria-label="Dismiss note">×</button></div>
      <p data-guide-note-text></p>
      <button type="button" class="guide-note-action" data-guide-note-ask>Tell me more <span aria-hidden="true">↗</span></button>
    </section>
  </div>
  <button type="button" class="guide-launch" data-guide-open aria-haspopup="dialog" aria-controls="portfolio-guide" aria-expanded="false" aria-label="Ask the guide">
    <span class="guide-launch-mark">${signal}</span><span class="guide-launch-label"><small class="mono">FIELD NOTES</small><strong>Ask the guide</strong></span><span class="guide-launch-arrow" aria-hidden="true">↗</span>
  </button>
  <dialog id="portfolio-guide" class="guide-panel" aria-labelledby="portfolio-guide-title">
    <header class="guide-panel-head">
      <div class="guide-panel-brand"><span class="guide-brand-mark">${signal}</span><div><p class="mono guide-kicker">CHIRAG AGGARWAL / PORTFOLIO</p><h2 id="portfolio-guide-title">Field notes<span>.</span></h2></div></div>
      <button type="button" class="guide-close" data-guide-close aria-label="Close field guide">×</button>
    </header>
    <div class="guide-desk">
      <nav class="guide-topics" aria-label="Guide topics">
        <p class="mono">INDEX</p>
        <button type="button" data-guide-topic="site" aria-pressed="true"><span aria-hidden="true">00</span> Explore</button>
        <button type="button" data-guide-topic="letzgo" aria-pressed="false"><span aria-hidden="true">01</span> LetzGo</button>
        <button type="button" data-guide-topic="popin" aria-pressed="false"><span aria-hidden="true">02</span> Popin</button>
        <button type="button" data-guide-topic="resume" aria-pressed="false"><span aria-hidden="true">03</span> Resume</button>
        <div class="guide-rail-caption"><span aria-hidden="true"></span><p>AI guide<br>Project notes &amp; portfolio</p></div>
      </nav>
      <div class="guide-reading">
        <section class="guide-tech" data-guide-tech aria-label="Project technologies" hidden>
          <p class="mono">TECH STACK</p>
          <div data-guide-tech-items></div>
        </section>
        <div class="guide-conversation" data-guide-thread aria-label="Conversation">
          <div class="guide-welcome" data-guide-welcome>
            <p class="mono guide-file-label" data-guide-topic-label>00 / OVERVIEW</p>
            <h3 data-guide-topic-heading>There’s a story behind every build.</h3>
            <p data-guide-topic-description>Ask about the projects, the portfolio, or Chirag’s work.</p>
            <div class="guide-starters" data-guide-starters aria-label="Suggested questions"></div>
          </div>
          <div class="guide-turns" data-guide-turns></div>
        </div>
        <form class="guide-compose" data-guide-form>
          <p class="guide-status mono" data-guide-status role="status" hidden></p>
          <div class="guide-input-row"><span class="guide-input-symbol" aria-hidden="true">↳</span><label class="sr-only" for="portfolio-guide-input">Your question</label><input id="portfolio-guide-input" name="question" type="text" maxlength="600" placeholder="Ask a question…" autocomplete="off" required><button type="submit" class="guide-send" aria-label="Send question">↑</button></div>
        </form>
      </div>
    </div>
  </dialog>
</aside>`;
