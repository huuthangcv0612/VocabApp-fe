import { useCallback } from 'react'
import { SpeechService } from '../services/speech'
import type { SpeakOptions } from '../services/speech'

export function useSpeech() {
  const speak = useCallback((text: string, options?: SpeakOptions) => {
    SpeechService.speak(text, options)
  }, [])

  const stop = useCallback(() => {
    SpeechService.stop()
  }, [])

  return { speak, stop }
}
