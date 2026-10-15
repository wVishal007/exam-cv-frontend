import { describe, expect, it } from "vitest";

import axios from "axios";
import { getErrorMessage } from "@/lib/axios";
import { makeAxiosError } from "./testUtils";

function blobOf(text: string) {
  return new Blob([text], { type: "application/json" });
}

describe("getErrorMessage", () => {
  it("prefixes a plain Error message", async () => {
    expect(await getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("falls back when no Error shape is present", async () => {
    expect(await getErrorMessage("garbage", "fallback")).toBe("fallback");
  });

  it("reads the `detail` string of a FastAPI error", async () => {
    const err = makeAxiosError(401, { detail: "Token expired" });
    expect(await getErrorMessage(err, "fallback")).toBe("Token expired (HTTP 401)");
  });

  it("flattens a FastAPI 422 detail array", async () => {
    const err = makeAxiosError(422, {
      detail: [
        { loc: ["body", "email"], msg: "email is required", type: "missing" },
        { loc: ["body", "name"], msg: "name must be a string", type: "string_type" },
      ],
    });
    expect(await getErrorMessage(err, "fallback")).toBe(
      "email is required; name must be a string (HTTP 422)"
    );
  });

  it("parses a Blob error body (blob request responses)", async () => {
    const err = makeAxiosError(404, blobOf(JSON.stringify({ detail: "Not found" })));
    expect(await getErrorMessage(err, "fallback")).toBe("Not found (HTTP 404)");
  });

  it("falls back for a Blob body that is not JSON", async () => {
    const err = makeAxiosError(500, blobOf("<html>oops</html>"));
    expect(await getErrorMessage(err, "fallback")).toBe("fallback (HTTP 500)");
  });

  it("falls back for a network error without a response", async () => {
    const err = new axios.AxiosError("Network Error");
    expect(await getErrorMessage(err, "fallback")).toBe("fallback");
  });
});