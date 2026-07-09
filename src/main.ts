const STORAGE_KEY = "url";

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

window.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isValidUrl(stored)) {
    redirect(stored);
    return;
  }

  const form = document.querySelector<HTMLFormElement>("#url-form")!;
  const input = document.querySelector<HTMLInputElement>("#url-input")!;

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
});
