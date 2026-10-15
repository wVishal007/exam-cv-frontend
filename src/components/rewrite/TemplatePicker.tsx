import { useMemo } from "react";
import { Check, Search, Sparkles } from "lucide-react";

import type { TemplateOption } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { StepHeading } from "./UploadStep";

interface TemplatePickerProps {
  templates: TemplateOption[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  templateId: number | null;
  onSelect: (id: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  generating: boolean;
  generateError: string | null;
  hasFile: boolean;
}

export function TemplatePicker({
  templates,
  isLoading,
  hasError,
  onRetry,
  templateId,
  onSelect,
  search,
  onSearchChange,
  onGenerate,
  canGenerate,
  generating,
  generateError,
  hasFile,
}: TemplatePickerProps) {
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    const query = search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) =>
      template.name.toLowerCase().includes(query)
    );
  }, [templates, search]);

  const selectedTemplate = templates?.find(
    (template) => template.template_id === templateId
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <StepHeading
            number={2}
            title="Choose a template"
            description={`${templates?.length ?? 0} professional ATS-safe templates`}
          />

          <div className="relative w-full sm:w-56">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted dark:text-ink-muted-dark"
              aria-hidden="true"
            />
            <Input
              type="search"
              aria-label="Search templates"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search templates…"
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <TemplateSkeleton />
        ) : hasError ? (
          <div className="soft-inset-sm rounded-xl border border-danger/20 bg-danger-soft px-4 py-6 text-center dark:border-danger-dark/30 dark:bg-danger-soft-dark">
            <p role="alert" className="text-sm font-medium text-danger dark:text-danger-dark">
              Could not load templates.
            </p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="soft-inset-sm rounded-xl border border-dashed border-line/80 px-5 py-10 text-center dark:border-line-dark/60">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted dark:bg-paper-dark dark:text-ink-muted-dark">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink dark:text-ink-dark">
              No templates found
            </p>
            <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div
            role="radiogroup"
            aria-labelledby="template-group-label"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            onKeyDown={(e) => {
              // Single-select group: arrow keys move the selection, matching
              // native radio-group behaviour.
              if (!filteredTemplates.length) return;

              const count = filteredTemplates.length;
              const index = filteredTemplates.findIndex(
                (t) => t.template_id === templateId
              );

              let next: number;
              switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                  next = (index + 1 + count) % count;
                  break;
                case "ArrowLeft":
                case "ArrowUp":
                  next = (index - 1 + count) % count;
                  break;
                case "Home":
                  next = 0;
                  break;
                case "End":
                  next = count - 1;
                  break;
                default:
                  return;
              }

              e.preventDefault();
              const target = filteredTemplates[next];
              if (!target) return;
              onSelect(target.template_id);
              document
                .getElementById(`template-option-${target.template_id}`)
                ?.focus();
            }}
          >
            {filteredTemplates.map((template) => {
              const selected = templateId === template.template_id;

              return (
                <button
                  key={template.template_id}
                  id={`template-option-${template.template_id}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  // Roving tabindex: the grid is one tab stop, and the arrow
                  // keys move between templates.
                  tabIndex={
                    selected ||
                    (templateId === null &&
                      template.template_id === filteredTemplates[0]?.template_id)
                      ? 0
                      : -1
                  }
                  onClick={() => onSelect(template.template_id)}
                  title={`Select ${template.name}`}
                  className={`group relative overflow-hidden rounded-xl text-left transition-all duration-200 ${
                    selected
                      ? "soft-inset-sm ring-2 ring-accent/30 dark:ring-accent-dark/30"
                      : "soft-sm bg-card hover:soft-hover dark:bg-card"
                  }`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-paper dark:bg-paper-dark">
                    <img
                      src={template.preview_img}
                      alt={`${template.name} resume template preview`}
                      loading="lazy"
                      onError={(e) => {
                        // A missing preview file would otherwise render a bare
                        // broken-image glyph inside the button.
                        e.currentTarget.style.visibility = "hidden";
                      }}
                      className={`h-full w-full object-cover object-top transition-transform duration-300 ${
                        selected
                          ? "scale-[1.01]"
                          : "group-hover:scale-[1.025]"
                      }`}
                    />

                    <div
                      className={`pointer-events-none absolute inset-0 transition-opacity ${
                        selected
                          ? "bg-accent/5 opacity-100"
                          : "bg-black/0 opacity-0 group-hover:bg-black/5 group-hover:opacity-100"
                      }`}
                    />

                    {selected && (
                      <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white dark:bg-accent-dark">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2.5">
                    <span
                      className={`truncate text-xs font-semibold ${
                        selected
                          ? "text-accent dark:text-accent-dark"
                          : "text-ink dark:text-ink-dark"
                      }`}
                    >
                      {template.name}
                    </span>

                    {selected && (
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-accent dark:text-accent-dark">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {selectedTemplate && (
          <div className="soft-inset-sm mt-5 flex items-center justify-between gap-4 rounded-xl border border-accent/15 bg-accent-soft/40 px-4 py-3 dark:border-accent-dark/15 dark:bg-accent-soft-dark/30">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent dark:bg-accent-dark/10 dark:text-accent-dark">
                <Check className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
                  Selected template
                </p>
                <p className="truncate text-sm font-semibold text-ink dark:text-ink-dark">
                  {selectedTemplate.name}
                </p>
              </div>
            </div>

            <span className="hidden shrink-0 text-[11px] font-medium text-ink-muted dark:text-ink-muted-dark sm:block">
              Ready to generate
            </span>
          </div>
        )}

        <div className="mt-5">
          <Button
            onClick={onGenerate}
            disabled={!canGenerate || generating}
            loading={generating}
            className="h-11 w-full"
          >
            {generating ? (
              "Generating your resume…"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generate rewritten resume
              </span>
            )}
          </Button>

          {!canGenerate && !generating && (
            <p className="mt-2 text-center text-[11px] text-ink-muted dark:text-ink-muted-dark">
              {hasFile ? "Select a template" : "Upload a resume"} to continue
            </p>
          )}

          {generateError && (
            <p
              role="alert"
              className="soft-inset-sm mt-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-xs leading-5 text-danger dark:border-danger-dark/30 dark:bg-danger-soft-dark dark:text-danger-dark"
            >
              {generateError}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function TemplateSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="soft-sm overflow-hidden rounded-xl bg-card"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="p-3">
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}