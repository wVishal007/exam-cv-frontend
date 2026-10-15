import { describe, expect, it, vi, beforeEach } from "vitest";
import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useGeneratedResumePdf } from "@/hooks/useResume";
import { getErrorMessage } from "@/lib/axios";
import { renderApp, makeAxiosError } from "./testUtils";

vi.mock("@/api/resume", () => ({
  analyzeResume: vi.fn(),
  rewriteResume: vi.fn(),
  getGeneratedResumePdf: vi.fn(),
  fetchTemplates: vi.fn(),
  fetchAnalysisHistory: vi.fn(),
  fetchRewriteHistory: vi.fn(),
}));

import { getGeneratedResumePdf } from "@/api/resume";

function PdfProbe() {
  const mutation = useGeneratedResumePdf();
  const [outcome, setOutcome] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          try {
            const blob = await mutation.mutateAsync(12);
            setOutcome(`ok:${blob.size}`);
          } catch (err) {
            setOutcome(`err:${await getErrorMessage(err, "blocked")}`);
          }
        }}
      >
        fetch
      </button>
      <p data-testid="outcome">{outcome}</p>
    </div>
  );
}

describe("useGeneratedResumePdf", () => {
  beforeEach(() => {
    vi.mocked(getGeneratedResumePdf).mockReset();
  });

  it("resolves to the PDF blob for a resume id", async () => {
    const user = userEvent.setup();
    vi.mocked(getGeneratedResumePdf).mockResolvedValue(
      new Blob(["%PDF-1.4"], { type: "application/pdf" })
    );

    renderApp(<PdfProbe />);

    await user.click(screen.getByRole("button", { name: "fetch" }));

    expect(await screen.findByTestId("outcome")).toHaveTextContent("ok:");
    expect(getGeneratedResumePdf).toHaveBeenCalledWith(12);
  });

  it("surfaces a 404 from the PDF endpoint", async () => {
    const user = userEvent.setup();
    vi.mocked(getGeneratedResumePdf).mockRejectedValue(
      makeAxiosError(404, { detail: "Generated resume PDF not found" })
    );

    renderApp(<PdfProbe />);

    await user.click(screen.getByRole("button", { name: "fetch" }));

    expect(await screen.findByTestId("outcome")).toHaveTextContent(
      "err:Generated resume PDF not found (HTTP 404)"
    );
  });
});