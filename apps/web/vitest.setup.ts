import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom implements Element.getBoundingClientRect but not Range's, and a
// component that positions something against a text selection has to call it.
// Without this the call throws inside the event handler and the feature simply
// never runs under test — which is why the passage highlighter had none.
// Layout is always 0 in jsdom; this only has to exist and return a rect.
const range = Range.prototype as Range & {
  getBoundingClientRect?: () => DOMRect;
};
if (!range.getBoundingClientRect) {
  range.getBoundingClientRect = () =>
    ({
      x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

afterEach(() => {
  cleanup();
});
