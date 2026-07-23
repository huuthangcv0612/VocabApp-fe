import { BrowserSpeech } from './BrowserSpeech'
import type { SpeakOptions } from './SpeechTypes'

export interface SpeechEngine {
  isSupported(): boolean
  speak(text: string, options?: SpeakOptions): void
  stop(): void
}

// Application-facing facade that keeps UI code independent from the browser implementation.
class SpeechService {
  private static engine: SpeechEngine = new BrowserSpeech()

  static setEngine(engine: SpeechEngine): void {
    SpeechService.engine = engine
  }

  static speak(text: string, options?: SpeakOptions): void {
    SpeechService.engine.speak(text, options)
  }

  static stop(): void {
    SpeechService.engine.stop()
  }

  static isSupported(): boolean {
    return SpeechService.engine.isSupported()
  }
}

export { SpeechService }
