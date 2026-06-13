"use client";

import {
  getPipelineStepIndex,
  PIPELINE_STEPS,
} from "@/lib/document-utils";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";

type ProcessingPipelineProps = {
  status: string;
};

export function ProcessingPipeline({ status }: ProcessingPipelineProps) {
  const currentIndex = getPipelineStepIndex(status);
  const isCompleted = status === "completed";

  return (
    <div className="space-y-3">
      <div className="hidden gap-2 md:grid md:grid-cols-9">
        {PIPELINE_STEPS.map((step, index) => {
          const isDone = isCompleted || index < currentIndex;
          const isCurrent = !isCompleted && index === currentIndex;

          return (
            <PipelineStepCell
              key={step.key}
              stepNumber={index + 1}
              label={step.label}
              description={step.description}
              isDone={isDone}
              isCurrent={isCurrent}
              showConnector={false}
              layout="grid"
            />
          );
        })}
      </div>

      <div className="space-y-0 md:hidden">
        {PIPELINE_STEPS.map((step, index) => {
          const isDone = isCompleted || index < currentIndex;
          const isCurrent = !isCompleted && index === currentIndex;
          const isLast = index === PIPELINE_STEPS.length - 1;

          return (
            <PipelineStepCell
              key={step.key}
              stepNumber={index + 1}
              label={step.label}
              description={step.description}
              isDone={isDone}
              isCurrent={isCurrent}
              showConnector={!isLast}
              layout="list"
            />
          );
        })}
      </div>
    </div>
  );
}

function PipelineStepCell({
  stepNumber,
  label,
  description,
  isDone,
  isCurrent,
  showConnector,
  layout,
}: {
  stepNumber: number;
  label: string;
  description: string;
  isDone: boolean;
  isCurrent: boolean;
  showConnector: boolean;
  layout: "grid" | "list";
}) {
  if (layout === "grid") {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center",
          isCurrent && "border-primary bg-primary/10",
          isDone && !isCurrent && "border-primary/30 bg-primary/5",
          !isDone && !isCurrent && "border-border bg-background/50"
        )}
      >
        <StepIcon isDone={isDone} isCurrent={isCurrent} stepNumber={stepNumber} />
        <div className="space-y-1">
          <p
            className={cn(
              "text-xs font-semibold leading-tight",
              isCurrent && "text-primary",
              isDone && !isCurrent && "text-foreground",
              !isDone && !isCurrent && "text-muted-foreground"
            )}
          >
            {label}
          </p>
          <p className="text-[10px] leading-snug text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", showConnector ? "pb-3" : "")}>
      <div className="flex flex-col items-center">
        <StepIcon isDone={isDone} isCurrent={isCurrent} stepNumber={stepNumber} />
        {showConnector && (
          <div
            className={cn(
              "mt-1 min-h-4 w-px flex-1",
              isDone ? "bg-primary" : "bg-border"
            )}
          />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 rounded-lg border px-3 py-2 transition-colors",
          isCurrent && "border-primary bg-primary/10",
          isDone && !isCurrent && "border-primary/30 bg-primary/5",
          !isDone && !isCurrent && "border-border bg-background/50"
        )}
      >
        <p
          className={cn(
            "text-sm font-medium leading-tight",
            isCurrent && "text-primary",
            isDone && !isCurrent && "text-foreground",
            !isDone && !isCurrent && "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StepIcon({
  isDone,
  isCurrent,
  stepNumber,
}: {
  isDone: boolean;
  isCurrent: boolean;
  stepNumber: number;
}) {
  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
        isDone && "border-primary bg-primary text-primary-foreground",
        isCurrent && "border-primary bg-primary/15 text-primary",
        !isDone && !isCurrent && "border-border bg-background text-muted-foreground"
      )}
    >
      {isDone ? (
        <CheckCircle2 className="size-4" />
      ) : isCurrent ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
  );
}
