import { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { aiConversationService } from '../services/aiConversation.service'

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error'

export interface UseAITextToSpeechReturn {
  audioStatus: AudioStatus
  isAISpeaking: boolean
  isAutoplayBlocked: boolean
  error: string | null
  currentSpeakingText: string | null
  speak: (text: string) => Promise<void>
  retryAutoplay: () => void
  stop: () => void
}

export function useAITextToSpeech(): UseAITextToSpeechReturn {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [currentSpeakingText, setCurrentSpeakingText] = useState<string | null>(null)
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef<number>(0)
  const pendingAutoplayTextRef = useRef<string | null>(null)


  /**
   * Stop current audio playback, revoke any active Blob URL, and cancel pending API requests
   */
  const stop = useCallback(() => {
    // Invalidate any in-flight requests
    requestIdRef.current += 1

    // Abort pending network fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Stop and destroy audio element
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      } catch (e) {
        console.warn('[TTS] Error stopping audio:', e)
      }
      audioRef.current = null
    }

    // Revoke Blob URL to free memory
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }

    setAudioStatus('idle')
    setCurrentSpeakingText(null)
  }, [])

  /**
   * Request Azure TTS for German text and play the returned audio Blob
   */
  const speak = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text?.trim()
      if (!trimmed) return

      // Stop previous audio and invalidate prior requests
      stop()

      const currentReqId = ++requestIdRef.current
      const controller = new AbortController()
      abortControllerRef.current = controller

      setAudioStatus('loading')
      setError(null)
      setCurrentSpeakingText(trimmed)

      try {
        const blob = await aiConversationService.textToSpeech(trimmed, controller.signal)

        // If another request started while waiting, discard this one
        if (requestIdRef.current !== currentReqId) {
          return
        }

        // Create Blob URL
        const objectUrl = URL.createObjectURL(blob)
        blobUrlRef.current = objectUrl

        const audio = new Audio(objectUrl)
        audioRef.current = audio

        audio.onplay = () => {
          if (requestIdRef.current === currentReqId) {
            setAudioStatus('playing')
            setIsAutoplayBlocked(false)
            pendingAutoplayTextRef.current = null
          }
        }

        audio.onended = () => {
          if (requestIdRef.current === currentReqId) {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current)
              blobUrlRef.current = null
            }
            audioRef.current = null
            setAudioStatus('idle')
            setCurrentSpeakingText(null)
          }
        }

        audio.onerror = () => {
          if (requestIdRef.current === currentReqId) {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current)
              blobUrlRef.current = null
            }
            audioRef.current = null
            setAudioStatus('error')
            setError('Không thể phát âm thanh. Bạn có thể đọc câu trả lời trên màn hình.')
            setCurrentSpeakingText(null)
          }
        }

        try {
          await audio.play()
          if (requestIdRef.current === currentReqId) {
            setIsAutoplayBlocked(false)
            pendingAutoplayTextRef.current = null
          }
        } catch (playErr: unknown) {
          if (requestIdRef.current !== currentReqId) return

          // Handle browser autoplay policy gracefully
          if (playErr instanceof Error && playErr.name === 'NotAllowedError') {
            console.warn('[TTS] Autoplay was blocked by browser policy. Interaction required.')
            setAudioStatus('idle')
            setIsAutoplayBlocked(true)
            pendingAutoplayTextRef.current = trimmed
          } else if (playErr instanceof Error && playErr.name === 'AbortError') {
            // Playback was aborted by new play call, ignore
          } else {
            console.error('[TTS] Audio playback error:', playErr)
            setAudioStatus('error')
            setError('Không thể phát âm thanh. Bạn có thể đọc câu trả lời trên màn hình.')
            setCurrentSpeakingText(null)
          }
        }
      } catch (err: unknown) {
        if (requestIdRef.current !== currentReqId) return

        // If request was aborted deliberately, don't show error
        if (axios.isCancel(err) || (err instanceof Error && err.name === 'CanceledError')) {
          return
        }

        console.error('[TTS] Failed to fetch TTS audio:', err)
        setAudioStatus('error')
        setError('Không thể phát âm thanh. Bạn có thể đọc câu trả lời trên màn hình.')
        setCurrentSpeakingText(null)
      }
    },
    [stop],
  )

  /**
   * Re-trigger speech playback after user interaction if autoplay was initially blocked
   */
  const retryAutoplay = useCallback(() => {
    setIsAutoplayBlocked(false)
    if (pendingAutoplayTextRef.current) {
      const textToPlay = pendingAutoplayTextRef.current
      pendingAutoplayTextRef.current = null
      speak(textToPlay)
    }
  }, [speak])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  const isAISpeaking = audioStatus === 'loading' || audioStatus === 'playing'

  return {
    audioStatus,
    isAISpeaking,
    isAutoplayBlocked,
    error,
    currentSpeakingText,
    speak,
    retryAutoplay,
    stop,
  }
}


export default useAITextToSpeech
