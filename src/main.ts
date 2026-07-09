const STORAGE_KEY = "url";
const COUNTDOWN_SECONDS = 5;

const $ = <T extends HTMLElement>(sel: string) =>
  document.querySelector<T>(sel)!;

function redirect(url: string) {
  window.location.href = url;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function showForm() {
  $("#url-form").hidden = false;
  $("#countdown").hidden = true;
}

function showCountdown(
  url: string,
  onElapsed: () => void,
  onCancel: () => void,
) {
  const form = $("#url-form");
  const countdown = $("#countdown");
  const urlEl = $<HTMLSpanElement>("#countdown-url");
  const secondsEl = $<HTMLSpanElement>("#countdown-seconds");
  const cancelBtn = $<HTMLButtonElement>("#countdown-cancel");

  form.hidden = true;
  countdown.hidden = false;
  urlEl.textContent = url;

  let remaining = COUNTDOWN_SECONDS;
  secondsEl.textContent = String(remaining);

  const cancel = () => {
    clearInterval(interval);
    cancelBtn.removeEventListener("click", onCancelClick);
    onCancel();
  };

  const onCancelClick = () => cancel();

  const interval = window.setInterval(() => {
    remaining -= 1;
    secondsEl.textContent = String(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      cancelBtn.removeEventListener("click", onCancelClick);
      onElapsed();
    }
  }, 1000);

  cancelBtn.addEventListener("click", onCancelClick);
}

function startForm() {
  const form = $<HTMLFormElement>("#url-form");
  const input = $<HTMLInputElement>("#url-input");

  showForm();
  input.value = localStorage.getItem(STORAGE_KEY) ?? "";
  input.focus();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!isValidUrl(value)) {
      input.setCustomValidity("Please enter a valid http(s) URL.");
      input.reportValidity();
      return;
    }
    input.setCustomValidity("");
    localStorage.setItem(STORAGE_KEY, value);
    redirect(value);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isValidUrl(stored)) {
    showCountdown(
      stored,
      () => redirect(stored),
      () => startForm(),
    );
    return;
  }
  startForm();
});
