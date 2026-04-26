// Password-protected interviews page
// The hash below is SHA-256 of your password.
// To update: run `echo -n "yourpassword" | shasum -a 256` and replace the value.
const PASSWORD_HASH = "REPLACE_WITH_YOUR_SHA256_HASH";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("password-form");
  const input = document.getElementById("password-input");
  const errorEl = document.getElementById("password-error");
  const content = document.getElementById("interviews-content");
  const gate = document.getElementById("password-gate");

  // Check session storage for already-authenticated session
  if (sessionStorage.getItem("interviews_auth") === "true") {
    gate.style.display = "none";
    content.style.display = "block";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const hash = await sha256(input.value);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem("interviews_auth", "true");
      gate.style.display = "none";
      content.style.display = "block";
    } else {
      errorEl.style.display = "block";
      input.value = "";
      input.focus();
    }
  });
});
