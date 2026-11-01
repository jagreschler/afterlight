import { afterEach, describe, expect, it } from "vitest";
import { PreviewPlayerCard } from "./previewPlayerCard";

afterEach(() => {
  document.body.replaceChildren();
});

describe("PreviewPlayerCard", () => {
  it("starts hidden, with Play disabled, at 0:00", () => {
    const { root, card } = mount();

    expect(root.hidden).toBe(true);
    expect(card.button.disabled).toBe(true);
    expect(card.button.textContent).toBe("Play");
    expect(root.querySelector(".preview-time")?.textContent).toBe("0:00 / 0:00");
  });

  it("shows Pause while playing and Play while stopped", () => {
    const { card } = mount();

    card.setPlaying(true);
    expect(card.button.textContent).toBe("Pause");
    expect(card.button.getAttribute("aria-pressed")).toBe("true");

    card.setPlaying(false);
    expect(card.button.textContent).toBe("Play");
    expect(card.button.getAttribute("aria-pressed")).toBe("false");
  });

  it("draws the elapsed time and the progress bar", () => {
    const { root, card } = mount();

    card.setTime(65, 90);

    const progress = root.querySelector("progress");
    expect(progress?.value).toBe(65);
    expect(progress?.max).toBe(90);
    expect(root.querySelector(".preview-time")?.textContent).toBe("1:05 / 1:30");
  });

  it("resets to a ready Play button at the start of the clip", () => {
    const { root, card } = mount();

    card.setPlaying(true);
    card.setTime(10, 30);
    card.reset();

    expect(root.hidden).toBe(false);
    expect(card.button.disabled).toBe(false);
    expect(card.button.textContent).toBe("Play");
    expect(root.querySelector(".preview-time")?.textContent).toBe("0:00 / 0:00");
    expect(root.querySelector("progress")?.value).toBe(0);
  });
});

function mount(): { root: HTMLElement; card: PreviewPlayerCard } {
  const root = document.createElement("div");
  document.body.append(root);
  return { root, card: new PreviewPlayerCard(root) };
}
