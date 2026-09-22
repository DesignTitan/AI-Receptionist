"use client";

import { useEffect, useRef } from "react";

type MicrophoneElement = HTMLElement & {
  setConstraints: (constraints: MediaStreamConstraints) => void;
  stream: MediaStream | null;
  error?: DOMException;
};

/** The browser owns this control's permission labels and consent UI. */
export function MicrophonePermission({ onStart, onUnsupported }: { onStart: (stream: Promise<MediaStream>) => void; onUnsupported: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const start = useRef(onStart);
  start.current = onStart;
  useEffect(() => {
    const element = document.createElement("usermedia") as MicrophoneElement;
    try {
      // Omit video: native constraints accept a track settings object, not false.
      element.setConstraints({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch { onUnsupported(); return; }
    let disposed = false;
    let pending = false;
    let handedOff = false;
    let resolve: ((stream: MediaStream) => void) | undefined;
    let reject: ((reason: unknown) => void) | undefined;
    const click = () => {
      if (disposed || pending || handedOff) return;
      pending = true;
      // Runs in the physical click, so VoiceAudio can unlock playback on mobile.
      start.current(new Promise<MediaStream>((yes, no) => { resolve = yes; reject = no; }));
    };
    const stream = () => {
      const value = element.stream;
      if (!value || handedOff) return;
      if (disposed || !pending) { value.getTracks().forEach(track => track.stop()); return; }
      handedOff = true; pending = false; resolve?.(value);
    };
    const error = () => { pending = false; reject?.(element.error ?? new DOMException("Microphone access was not allowed.", "NotAllowedError")); };
    const cancel = () => { pending = false; reject?.(new DOMException("Microphone permission was dismissed. Try again when you’re ready.", "AbortError")); };
    element.addEventListener("click", click);
    element.addEventListener("stream", stream);
    element.addEventListener("streamready", stream);
    element.addEventListener("error", error);
    element.addEventListener("cancel", cancel);
    host.current?.appendChild(element);
    return () => {
      disposed = true;
      reject?.(new DOMException("Conversation cancelled.", "AbortError"));
      if (!handedOff) element.stream?.getTracks().forEach(track => track.stop());
      // Keep the stream listener on the detached element to stop a late grant.
      element.removeEventListener("click", click);
      element.remove();
    };
  }, []);
  return <div className="rc-voice-native-mic" ref={host} />;
}

export function supportsEmbeddedMicrophone() {
  return "HTMLUserMediaElement" in window && typeof (document.createElement("usermedia") as Partial<MicrophoneElement>).setConstraints === "function";
}
