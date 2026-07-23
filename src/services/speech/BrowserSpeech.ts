import type { SpeakOptions } from './SpeechTypes'

export class BrowserSpeech {
  private readonly speechSynthesis: SpeechSynthesis | null

  constructor() {
    this.speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null
  }

  isSupported(): boolean {
    return Boolean(this.speechSynthesis)
  }

  // Entry point for browser speech synthesis. This layer is the only place that touches Web Speech API.
  speak(text: string, options?: SpeakOptions): void {
    const trimmedText = text?.trim()
    const speechSynthesis = this.speechSynthesis

    if (!speechSynthesis || !trimmedText) {
      if (!speechSynthesis) {
        console.warn('Web Speech API is not supported in this browser.')
      }
      return
    }

    this.stop()

    const utterance = new SpeechSynthesisUtterance(trimmedText)
    const { lang, rate, pitch, volume } = options ?? {}

    utterance.lang = lang ?? 'de-DE'
    utterance.rate = rate ?? 1
    utterance.pitch = pitch ?? 1
    utterance.volume = volume ?? 1

    const availableVoices = speechSynthesis.getVoices()
    const preferredVoice = this.selectPreferredVoice(availableVoices)

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    if (availableVoices.length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = speechSynthesis.getVoices() ?? []
        const updatedVoice = this.selectPreferredVoice(updatedVoices)

        if (updatedVoice) {
          utterance.voice = updatedVoice
        }
      }
    }

    speechSynthesis.speak(utterance)
  }

  stop(): void {
    if (!this.speechSynthesis) {
      return
    }

    this.speechSynthesis.cancel()
  }

  // Prefer a German voice when available, otherwise fall back to the browser's default order.
  private selectPreferredVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
    const germanVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('de'))

    if (germanVoices.length === 0) {
      return voices[0]
    }

    const preciseGermanVoice = germanVoices.find((voice) => voice.lang.toLowerCase() === 'de-de')

    return preciseGermanVoice ?? germanVoices[0]
  }
}
