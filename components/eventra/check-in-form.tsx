"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, ScanLine, XCircle } from "lucide-react";

import {
  checkInTicketAction,
  type CheckInFormState,
} from "@/app/actions/tickets";
import { AuthSubmitButton } from "@/components/eventra/auth-submit-button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/use-i18n";

const initialState: CheckInFormState = {};
const scannerDebounceMs = 450;

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function playCheckInTone(kind: "success" | "error") {
  const AudioContextConstructor =
    window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const audioContext = new AudioContextConstructor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = kind === "success" ? "sine" : "sawtooth";
  oscillator.frequency.setValueAtTime(
    kind === "success" ? 880 : 180,
    audioContext.currentTime
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    kind === "success" ? 1320 : 90,
    audioContext.currentTime + 0.16
  );
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.24);
}

export function CheckInForm() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(checkInTicketAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedCodeRef = useRef("");

  useEffect(() => {
    if (state.success) {
      playCheckInTone("success");
      lastSubmittedCodeRef.current = "";
    }

    if (state.message) {
      playCheckInTone("error");
      lastSubmittedCodeRef.current = "";
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [state.message, state.success]);

  function submitScannerValue(value: string) {
    const normalizedCode = value.trim().toUpperCase();

    if (normalizedCode.length < 6 || normalizedCode === lastSubmittedCodeRef.current) {
      return;
    }

    lastSubmittedCodeRef.current = normalizedCode;
    formRef.current?.requestSubmit();
  }

  const feedbackTone = state.success
    ? "success"
    : state.message
      ? "error"
      : "idle";

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div
        className={
          feedbackTone === "success"
            ? "flex min-h-64 flex-col justify-between rounded-[2rem] bg-emerald-500 p-6 text-white shadow-2xl shadow-emerald-500/30"
            : feedbackTone === "error"
              ? "flex min-h-64 flex-col justify-between rounded-[2rem] bg-rose-600 p-6 text-white shadow-2xl shadow-rose-500/30"
              : "flex min-h-64 flex-col justify-between rounded-[2rem] border border-black/5 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20"
        }
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
            {feedbackTone === "success" ? (
              <CheckCircle2 className="size-7" />
            ) : feedbackTone === "error" ? (
              <XCircle className="size-7" />
            ) : (
              <ScanLine className="size-7" />
            )}
          </div>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
            {feedbackTone === "success"
              ? t("checkInDesk.valid")
              : feedbackTone === "error"
                ? t("checkInDesk.invalid")
                : t("checkInDesk.scannerReady")}
          </span>
        </div>
        <div>
          <p className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {state.success ?? state.message ?? t("checkInDesk.scanPrompt")}
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
            {feedbackTone === "success"
              ? t("checkInDesk.successHelp")
              : feedbackTone === "error"
                ? t("checkInDesk.errorHelp")
                : t("checkInDesk.idleHelp")}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticketCode">{t("checkInDesk.ticketCode")}</Label>
        <input
          ref={inputRef}
          id="ticketCode"
          name="ticketCode"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          autoFocus
          className="h-14 w-full rounded-2xl border border-black/10 bg-white px-4 font-mono text-base uppercase tracking-[0.18em] outline-none transition focus:border-[#d46d42] focus:ring-4 focus:ring-[#d46d42]/15"
          placeholder="TKT-XXXXXXXX"
          onChange={(event) => {
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }

            const value = event.currentTarget.value;
            debounceRef.current = setTimeout(() => {
              submitScannerValue(value);
            }, scannerDebounceMs);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitScannerValue(event.currentTarget.value);
            }
          }}
        />
      </div>
      <AuthSubmitButton loadingLabel={t("checkInDesk.checking")}>
        {t("checkInDesk.submit")}
      </AuthSubmitButton>

      {state.ticketCode ? (
        <div className="rounded-3xl border border-black/5 bg-slate-50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-slate-950">{state.ticketCode}</p>
          <p className="mt-1">{state.attendeeName}</p>
          <p>{state.eventTitle}</p>
          <p className="mt-2">{t("checkInDesk.checkedAt")} {state.checkedInAt}</p>
        </div>
      ) : null}
    </form>
  );
}
