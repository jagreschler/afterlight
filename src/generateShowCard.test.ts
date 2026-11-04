import { afterEach, describe, expect, it } from "vitest";
import { GenerateShowCard } from "./generateShowCard";

const ONCE = 1;

afterEach(() => {
  document.body.replaceChildren();
});

describe("generate show card", () => {
  it("calls the onEdit hook from notifyOptionsEdited", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const card = new GenerateShowCard(root);
    let calls = 0;
    card.onEdit(() => {
      calls += 1;
    });

    card.notifyOptionsEdited();

    expect(calls).toBe(ONCE);
  });
});
