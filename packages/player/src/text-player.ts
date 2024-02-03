/**
 * Copyright © 2021 Progyan Bhattacharya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See LICENSE file in the root directory for more details.
 */

import { IDisposable } from "@otjs/types";
import { Handler } from "mitt";

/**
 * @public
 * Text Player Events - Events exposed by Text Player.
 */
export enum TextPlayerEvent {
  Abort = "abort",
  Ended = "ended",
  Error = "error",
  Pause = "pause",
  Play = "play",
  Playing = "playing",
  RateChange = "ratechange",
  Seeked = "seeked",
  Seeking = "seeking",
  TimeUpdate = "timeupdate",
}

/**
 * @internal
 * Event Arguments for Text Player Events.
 */
export type TTextPlayerEventArgs = {
  [TextPlayerEvent.Abort]: void;
  [TextPlayerEvent.Ended]: void;
};

/**
 * @internal
 * Text Player Event Emitter Interface - Interface that handles raising Event for Text Player to outside world.
 */
export interface ITextPlayerEventEmitter {
  /**
   * Add listener to Text Player.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof TTextPlayerEventArgs>(
    event: Key,
    listener: Handler<TTextPlayerEventArgs[Key]>,
  ): void;
  /**
   * Remove listener to Text Player.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof TTextPlayerEventArgs>(
    event: Key,
    listener?: Handler<TTextPlayerEventArgs[Key]>,
  ): void;
}

/**
 * @internal
 * Valid doubles that indicates the rate at which the content is being played back.
 */
export type PlaybackRate = 0.25 | 0.5 | 1.0 | 2.0 | 4.0;

/**
 * @public
 * Text Player Interface - Interface that handles playback of Collaborative Text Content.
 */
export interface ITextPlayer extends IDisposable, ITextPlayerEventEmitter {
  /**
   * A double-precision floating-point value indicating the current playback time in seconds;
   * if the content has not started to play and has not been seeked, this value is the content's
   * initial playback time. Setting this value seeks the content to the new time.
   * The time is specified relative to the content's timeline.
   */
  readonly currentTime: number;
  /** A `double` indicating the default playback rate for the content. */
  readonly defaultPlaybackRate: 1.0;
  /**
   * A read-only double-precision floating-point value indicating the total duration of the content
   * in seconds. If no content is available, the returned value is `NaN`. If the content is of
   * indefinite length (such as streamed live content, a WebRTC call's content, or similar), the value is `+Infinity`.
   */
  readonly duration: number;
  /** Returns a `boolean` that indicates whether the content element has finished playing. */
  readonly ended: boolean;
  /** Returns a `boolean` that indicates whether the content element is paused. */
  readonly paused: boolean;
  /** Returns a `TimeRanges` object that contains the time ranges that the user is able to seek to, if any. */
  readonly seekable: TimeRanges;

  /**
   * A `boolean` value that indicates whether playback should automatically begin
   * as soon as enough content is available to do so without interruption.
   */
  autoplay: boolean;
  /** A `double` that indicates the rate at which the content is being played back. */
  playbackRate: PlaybackRate;

  /** Pauses the media playback. */
  pause(): void;
  /** Begins playback of the media. */
  play(): Promise<void>;
  /** Seeks to the given time with low precision. */
  seek(timeInMs: number): void;
}

/**
 * @public
 * Live Text Player Interface - Interface that handles live playback of Collaborative Text Content.
 */
export interface ILiveTextPlayer extends ITextPlayer {
  /** Seeks to the live streaming. */
  seek(live: true): void;
  /** Seeks to the given time with low precision. */
  seek(timeInMs: number): void;
}

export { IDisposable };
