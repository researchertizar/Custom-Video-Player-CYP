/**
 * Custom Video Player (CYP) TypeScript Definitions
 * Zero-runtime-dependency modern universal video player engine for HTML5 and YouTube.
 */

export type PresetId = 'glass' | 'minimal' | 'professional' | 'cyber' | 'cinema' | 'dark';
export type ThemeId = 'dark' | 'cinema' | 'glass' | 'minimal' | 'professional' | 'studio' | 'cyber' | 'light' | 'blue';

export type QualityLevel = 'auto' | 'hd2160' | 'hd1440' | 'hd1080' | 'hd720' | 'large' | 'medium' | 'small' | 'tiny' | string;

export interface CaptionTrack {
  languageCode: string;
  displayName: string;
  kind?: string;
  isDefault?: boolean;
}

export interface Chapter {
  time: number;
  title: string;
}

export interface LogoOptions {
  src?: string;
  innerHTML?: string;
  url?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  opacity?: number;
  width?: string;
}

export interface PresetModel {
  id: string;
  name: string;
  theme: ThemeId;
  accentColor: string;
  radius: number;
  trackHeight: number;
  description: string;
}

export interface PlayerOptions {
  /** Target HTML container or CSS selector */
  element: string | HTMLElement;
  /** Media source: YouTube Video ID, YouTube URL, direct video file (.mp4, .webm, .ogg), stream token, or blob */
  videoId?: string;
  url?: string;
  src?: string | object | Array<any>;
  streamToken?: string;
  /** Explicit provider override ('youtube' | 'html5') or auto-detected */
  provider?: 'youtube' | 'html5' | 'auto';
  /** UI Design Preset ('glass' | 'minimal' | 'professional' | 'cyber' | 'cinema' | 'dark') */
  preset?: PresetId;
  /** Visual Theme */
  theme?: ThemeId;
  /** Custom accent highlight color (hex/rgb) */
  accentColor?: string;
  /** Seeker track height in px */
  trackHeight?: number | string;
  /** Container corner radius in px */
  radius?: number | string;
  /** Custom poster image URL before play */
  poster?: string;
  thumbnail?: string;
  /** Watermark branding logo */
  logo?: LogoOptions | null;
  /** Autoplay video on load */
  autoplay?: boolean;
  /** Lazy load iframe upon user interaction */
  lazy?: boolean;
  /** Show controls or pass array of enabled button IDs */
  controls?: boolean | Array<'play' | 'rewind' | 'forward' | 'volume' | 'time' | 'chapters' | 'captions' | 'settings' | 'theater' | 'mini' | 'fullscreen'>;
  /** Registered plugin instances or factories */
  plugins?: Array<any>;
  /** Debug logging flag */
  debug?: boolean;
}

export class Player {
  constructor(options: PlayerOptions);

  /** Mounts underlying video player */
  mount(): Promise<Player>;

  /** Starts playback */
  play(): Promise<void>;

  /** Pauses playback */
  pause(): void;

  /** Toggles play/pause */
  togglePlay(): void;

  /** Seeks to time in seconds */
  seekTo(seconds: number): void;

  /** Seeks forward or backward by delta seconds */
  seekBy(offsetSeconds: number): void;

  /** Sets volume (0 to 100) */
  setVolume(volume: number): void;

  /** Gets volume (0 to 100) */
  getVolume(): number;

  /** Mutes audio */
  mute(): void;

  /** Unmutes audio */
  unmute(): void;

  /** Toggles audio mute */
  toggleMute(): void;

  /** Returns true if muted */
  isMuted(): boolean;

  /** Sets playback speed rate (e.g. 0.5, 1.0, 1.25, 1.5, 2.0) */
  setPlaybackRate(rate: number): void;

  /** Gets current playback rate */
  getPlaybackRate(): number;

  /** Sets stream quality level */
  setPlaybackQuality(quality: QualityLevel): void;

  /** Gets current quality level */
  getPlaybackQuality(): string;

  /** Gets array of available quality levels */
  getAvailableQualityLevels(): string[];

  /** Gets current playback time in seconds */
  getCurrentTime(): number;

  /** Gets video duration in seconds */
  getDuration(): number;

  /** Loads a new video target (ID, URL, or stream token) */
  load(target: string, startSeconds?: number): void;

  /** Updates visual theme class */
  setTheme(themeName: ThemeId | string, resetAccent?: boolean): void;

  /** Applies a complete developer UI preset model */
  applyPreset(presetName: PresetId | string): void;

  /** Sets custom accent color */
  setAccentColor(color: string): void;

  /** Sets seeker track thickness */
  setTrackHeight(height: number | string): void;

  /** Sets player corner radius */
  setRadius(radius: number | string): void;

  /** Sets watermark logo */
  setLogo(logo: LogoOptions | null): void;

  /** Sets poster image */
  setPoster(url: string | null): void;

  /** Toggles visibility of a specific control button */
  setControlVisibility(controlName: string, visible: boolean): void;

  /** Toggles closed captions on or off */
  toggleCaptions(languageCode?: string): void;

  /** Enables closed captions */
  enableCaptions(languageCode?: string): void;

  /** Disables closed captions */
  disableCaptions(): void;

  /** Sets active subtitle track */
  setCaptionTrack(languageCode: string | null): void;

  /** Gets list of available caption tracks */
  getCaptionTracks(): CaptionTrack[];

  /** Gets currently active caption track code */
  getActiveCaptionTrack(): string | null;

  /** Returns true if captions are currently active */
  isCaptionsEnabled(): boolean;

  /** Subscribes to an event */
  on(event: string, callback: (...args: any[]) => void): () => void;

  /** Unsubscribes from an event */
  off(event: string, callback: (...args: any[]) => void): void;

  /** Subscribes to an event once */
  once(event: string, callback: (...args: any[]) => void): void;

  /** Toggles floating mini-player mode */
  toggleMini(): boolean;

  /** Requests native picture-in-picture if supported, or falls back to mini-player */
  requestPictureInPicture(): Promise<any>;

  /** Cleans up DOM and timers */
  destroy(): void;
}

export const PlayerPresets: Record<PresetId, PresetModel>;

/** Factory function to create a Player instance */
export function createPlayer(options: PlayerOptions): Player;

/** Provider base class and implementations */
export class Provider {
  constructor(emitter: any);
  init(container: HTMLElement, source: any, options?: any): Promise<void>;
  play(): Promise<void> | void;
  pause(): void;
  stop(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoLoadedFraction(): number;
  setVolume(value: number): void;
  getVolume(): number;
  mute(): void;
  unmute(): void;
  isMuted(): boolean;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  loadVideo(source: any, startSeconds?: number): void;
  getVideoData(): { title: string; author: string; videoId: string };
  destroy(): void;
}
export class YouTubeProvider extends Provider {}
export class HTML5Provider extends Provider {}

export function detectSource(source: any, options?: any): { type: 'youtube' | 'html5'; target: any; startTime: number };

/** Plugins */
export function resumePlugin(options?: { storageKey?: string }): any;
export function chaptersPlugin(options?: { chapters?: Chapter[] }): any;
export function keyboardPlugin(options?: { target?: HTMLElement }): any;
export function gesturesPlugin(options?: { tapSeekSeconds?: number }): any;

/** Web Components */
export class CustomYouTubePlayerElement extends HTMLElement {
  player: Player | null;
}
export class CustomVideoPlayerElement extends CustomYouTubePlayerElement {}

/** Utilities */
export function parseYouTubeUrl(input: string): { videoId: string | null; startTime: number | null };
export function isValidVideoId(id: string): boolean;
export function encodeStreamToken(videoId: string, timestamp?: number): string;
export function decodeStreamToken(token: string): { videoId: string; timestamp?: number } | null;
export function formatTime(seconds: number): string;
export function parseTime(timeStr: string): number;

export const CustomYouTubePlayer: {
  Player: typeof Player;
  create: typeof createPlayer;
  Provider: typeof Provider;
  YouTubeProvider: typeof YouTubeProvider;
  HTML5Provider: typeof HTML5Provider;
  detectSource: typeof detectSource;
  PlayerPresets: typeof PlayerPresets;
  resumePlugin: typeof resumePlugin;
  chaptersPlugin: typeof chaptersPlugin;
  keyboardPlugin: typeof keyboardPlugin;
  gesturesPlugin: typeof gesturesPlugin;
  parseYouTubeUrl: typeof parseYouTubeUrl;
  isValidVideoId: typeof isValidVideoId;
  encodeStreamToken: typeof encodeStreamToken;
  decodeStreamToken: typeof decodeStreamToken;
  formatTime: typeof formatTime;
  parseTime: typeof parseTime;
};

export const CustomVideoPlayer: typeof CustomYouTubePlayer;

export default CustomYouTubePlayer;

