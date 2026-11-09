const form = document.querySelector('#letzgo-chat-form');
const transcript = document.querySelector('#letzgo-chat-transcript');
const status = document.querySelector('#letzgo-chat-status');
const field = form.elements.question;
const submit = form.querySelector('button[type="submit"]');
let previous = '';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = field.value.trim();
  if (!question || submit.disabled) return;

  submit.disabled = true;
  field.readOnly = true;
  status.textContent = 'Looking through the case study…';
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, previous }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);

    const exchange = document.createElement('article');
    const prompt = document.createElement('h3');
    prompt.textContent = question;
    const answer = document.createElement('p');
    answer.textContent = result.answer;
    exchange.append(prompt, answer);
    if (result.sources.length) {
      const sources = document.createElement('ul');
      sources.setAttribute('aria-label', 'Related sections');
      for (const source of result.sources) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.href;
        link.textContent = source.title;
        item.append(link);
        sources.append(item);
      }
      exchange.append(sources);
    }
    transcript.append(exchange);
    previous = question;
    field.value = '';
    status.textContent = '';
  } catch (error) {
    status.textContent = error instanceof SyntaxError
      ? 'The assistant is temporarily unavailable. Try again later.'
      : error.message || 'The assistant is temporarily unavailable. Try again later.';
  } finally {
    submit.disabled = false;
    field.readOnly = false;
  }
});
