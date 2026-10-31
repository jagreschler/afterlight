const app = document.querySelector("#app");

if (!(app instanceof HTMLElement)) {
  throw new Error("Afterlight is missing its #app element.");
}

app.dataset.ready = "true";
