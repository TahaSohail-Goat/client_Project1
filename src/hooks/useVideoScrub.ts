import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { videoHero } from "../content/videoHero";

/** Coalesce scroll updates into one exact, paused seek; never queue stale frames. */
export function useVideoScrub(
  videoRef: RefObject<HTMLVideoElement | null>,
  progress: RefObject<number>,
  source: string | null,
  onFailure: () => void,
) {
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const request = useRef<(() => void) | null>(null);
  const requestSeek = useCallback(() => request.current?.(), []);
  useEffect(() => {
    const video = videoRef.current;
    setReady(false);
    setBuffering(false);
    if (!source || !video) return;
    let alive = true;
    let raf = 0;
    let frameCallback = 0;
    let waitTimer = 0;
    let failureTimer = 0;
    let displayed = false;
    const markReady = () => {
      if (!alive || video.readyState < 2) return;
      if (!displayed) { displayed = true; setReady(true); }
      clearTimeout(waitTimer);
      setBuffering(false);
      clearTimeout(failureTimer);
    };
    const observeFrame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      if (!alive) return;
      video.dataset.frameTime = metadata.mediaTime.toFixed(3);
      markReady();
      frameCallback = video.requestVideoFrameCallback(observeFrame);
    };
    const seek = () => {
      raf = 0;
      if (!alive || video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return;
      const end = Math.max(0, video.duration - 1 / videoHero.fps);
      const target = Math.min(end, Math.max(0, Math.round(progress.current * end * videoHero.fps) / videoHero.fps));
      video.dataset.targetTime = target.toFixed(3);
      if (Math.abs(video.currentTime - target) < 0.5 / videoHero.fps) return;
      try { video.currentTime = target; } catch { /* A pending metadata update will retry the latest target. */ }
    };
    const queue = () => {
      if (!alive || raf || video.seeking || document.hidden) return;
      raf = requestAnimationFrame(seek);
    };
    const onData = () => {
      // loadeddata is also the fallback for browsers without video-frame callbacks.
      markReady();
      queue();
    };
    const onSeeked = () => { markReady(); queue(); };
    const onWaiting = () => {
      clearTimeout(waitTimer);
      waitTimer = window.setTimeout(() => { if (alive && displayed) setBuffering(true); }, 650);
    };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else queue();
    };
    const failed = () => { if (alive) onFailure(); };
    request.current = queue;
    video.pause();
    video.muted = true;
    video.addEventListener("loadedmetadata", queue);
    video.addEventListener("loadeddata", onData);
    video.addEventListener("canplay", onData);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", failed);
    document.addEventListener("visibilitychange", onVisibility);
    if (typeof video.requestVideoFrameCallback === "function") frameCallback = video.requestVideoFrameCallback(observeFrame);
    if (video.getAttribute("src") !== source) video.src = source;
    if (video.readyState === 0) video.load();
    else onData();
    failureTimer = window.setTimeout(() => { if (!displayed) failed(); }, 30000);
    return () => {
      alive = false;
      request.current = null;
      cancelAnimationFrame(raf);
      if (frameCallback && typeof video.cancelVideoFrameCallback === "function") video.cancelVideoFrameCallback(frameCallback);
      clearTimeout(waitTimer);
      clearTimeout(failureTimer);
      video.removeEventListener("loadedmetadata", queue);
      video.removeEventListener("loadeddata", onData);
      video.removeEventListener("canplay", onData);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", failed);
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [videoRef, progress, source, onFailure]);
  return { ready, buffering, requestSeek };
}
