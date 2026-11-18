import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Loader2, ChevronUp, ChevronDown } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import soberanaLogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import soberanaLogoWide from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { usePodcastStore } from '@/shared/stores/usePodcastStore';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const BAR_COUNT = 48;

function generateBarHeights(): number[] {
  const bars: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const t = i / BAR_COUNT;
    const wave = Math.sin(t * Math.PI * 3.5) * 0.4 + 0.5;
    const noise = Math.random() * 0.3;
    bars.push(Math.max(0.15, Math.min(1, wave + noise)));
  }
  return bars;
}

interface WaveformProps {
  progress: number;
  isPlaying: boolean;
  onSeek: (fraction: number) => void;
}

function Waveform({ progress, isPlaying, onSeek }: WaveformProps) {
  const barHeights = useMemo(() => generateBarHeights(), []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(fraction);
  };

  return (
    <div
      className="flex items-end gap-[2px] h-8 cursor-pointer group"
      onClick={handleClick}
    >
      {barHeights.map((h, i) => {
        const barProgress = i / BAR_COUNT;
        const isPast = barProgress < progress / 100;

        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-colors duration-150"
            style={{
              height: `${h * 100}%`,
              minWidth: 2,
              background: isPast
                ? `hsl(${180 + barProgress * 120}, 70%, 60%)`
                : 'color-mix(in oklch, var(--muted-foreground) 20%, transparent)',
              animation:
                isPlaying && isPast
                  ? `waveformPulse ${0.4 + Math.random() * 0.6}s ease-in-out ${Math.random() * 0.3}s infinite alternate`
                  : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function PodcastAudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { pathname } = useLocation();
  const { setIsPlaying, setCurrentTime, setDuration, setIsLoading } = usePodcastStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnd = () => setIsPlaying(false);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('error', onError);
    };
  }, [setIsPlaying, setCurrentTime, setDuration, setIsLoading]);

  // Autoplay on first visit to /docs in this session (silent fail if blocked, e.g. iOS)
  useEffect(() => {
    if (!pathname.startsWith('/docs')) return;
    if (typeof sessionStorage === 'undefined') return;
    if (sessionStorage.getItem('soberana-podcast-autoplay-done')) return;

    sessionStorage.setItem('soberana-podcast-autoplay-done', '1');

    const audio = audioRef.current;
    if (!audio || !audio.paused) return;

    audio.play().catch(() => {
      // Browsers that block autoplay (e.g. iOS Safari); user can tap Play manually
    });
  }, [pathname]);

  useEffect(() => {
    if (audioRef.current) {
      (window as unknown as Record<string, unknown>).__podcastAudio = audioRef.current;
    }
    return () => {
      (window as unknown as Record<string, unknown>).__podcastAudio = undefined;
    };
  }, []);

  return (
    <audio ref={audioRef} preload="metadata" playsInline>
      <source src="/audio/sentinel-podcast.m4a" type="audio/mp4" />
      <source src="/audio/sentinel-podcast.m4a" type="audio/x-m4a" />
    </audio>
  );
}

function getAudioEl(): HTMLAudioElement | null {
  return ((window as unknown as Record<string, unknown>).__podcastAudio as HTMLAudioElement) ?? null;
}

function PodcastPlayerUI() {
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    isMinimized,
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
    toggleMinimized,
  } = usePodcastStore();

  useEffect(() => {
    const id = 'waveform-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes waveformPulse {
        0% { transform: scaleY(1); }
        100% { transform: scaleY(0.6); }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = getAudioEl();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        setIsLoading(true);
        if (audio.readyState < 2) audio.load();
        await audio.play();
      } catch {
        setIsPlaying(false);
        setIsLoading(false);
        try {
          audio.load();
          await audio.play();
        } catch {
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    }
  }, [isPlaying, setIsLoading, setIsPlaying]);

  const seek = useCallback(
    (time: number) => {
      const audio = getAudioEl();
      if (!audio) return;
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [setCurrentTime],
  );

  const seekFraction = useCallback(
    (fraction: number) => {
      if (!duration) return;
      seek(fraction * duration);
    },
    [duration, seek],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const playButton = (size: 'sm' | 'md') => {
    const cls =
      size === 'sm'
        ? 'flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm'
        : 'flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm';
    const iconCls = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
      <button onClick={togglePlay} className={cls}>
        {isLoading ? (
          <Loader2 className={`${iconCls} animate-spin`} />
        ) : isPlaying ? (
          <Pause className={iconCls} />
        ) : (
          <Play className={`${iconCls} ml-0.5`} />
        )}
      </button>
    );
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isMinimized ? (
        <motion.div
          key="mini"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 px-4 py-2 bg-card/95 backdrop-blur-md border-t border-border/30"
        >
          {playButton('sm')}
          <p className="text-xs font-heading font-semibold text-foreground truncate flex-1">
            Soberana Podcast
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)}
          </span>
          <button
            onClick={toggleMinimized}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="full"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="relative border-t border-border/30 bg-card/95 backdrop-blur-md px-4 py-3"
        >
          <button
            onClick={toggleMinimized}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 z-10"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Branding */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-2.5 pr-7">
            <img
              src={soberanaLogoCompact}
              alt="Soberana"
              className="h-4 sm:h-5 w-auto shrink-0 dark:hidden"
            />
            <img
              src={soberanaLogoWide}
              alt="Soberana"
              className="h-4 sm:h-5 w-auto shrink-0 hidden dark:block"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-heading font-semibold text-foreground truncate">
                Soberana Podcast{' '}
                <span className="font-normal text-muted-foreground">by Loopay Media</span>
              </p>
            </div>
            <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
              <span className="hidden sm:inline"> / {formatTime(duration)}</span>
            </div>
          </div>

          {/* Waveform */}
          <div className="mb-2">
            <Waveform progress={progress} isPlaying={isPlaying} onSeek={seekFraction} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => seek(Math.max(0, currentTime - 15))}
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            {playButton('md')}

            <button
              onClick={() => seek(Math.min(duration, currentTime + 15))}
              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GlobalPodcastPlayer() {
  const { pathname } = useLocation();
  const isVisible =
    (pathname.startsWith('/docs') || pathname.startsWith('/os')) &&
    !pathname.startsWith('/docs/soberana-vaults');

  return (
    <>
      <PodcastAudioEngine />

      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <PodcastPlayerUI />
        </div>
      )}
    </>
  );
}
