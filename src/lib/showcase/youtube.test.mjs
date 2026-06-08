import assert from "node:assert/strict";
import test from "node:test";

import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  isValidYouTubeUrl,
} from "./youtube.ts";

test("getYouTubeVideoId extracts the id from a watch URL", () => {
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
});

test("getYouTubeVideoId extracts the id from a short youtu.be URL", () => {
  assert.equal(
    getYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?si=abc123"),
    "dQw4w9WgXcQ"
  );
});

test("getYouTubeVideoId extracts the id from an embed URL", () => {
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
});

test("getYouTubeEmbedUrl returns a stable privacy-enhanced embed URL", () => {
  assert.equal(
    getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
  );
});

test("isValidYouTubeUrl rejects non-YouTube URLs and empty values", () => {
  assert.equal(isValidYouTubeUrl("https://vimeo.com/123"), false);
  assert.equal(isValidYouTubeUrl(""), false);
  assert.equal(isValidYouTubeUrl(null), false);
});
