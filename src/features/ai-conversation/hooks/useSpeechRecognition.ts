import { useState, useRef, useEffect, useCallback } from 'react'

interface ISpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface ISpeechRecognitionResult {
  isFinal: boolean
  length: number
  [index: number]: ISpeechRecognitionAlternative
}

interface ISpeechRecognitionResultList {
  length: number
  [index: number]: ISpeechRecognitionResult
}

interface ISpeechRecognitionEvent {
  resultIndex: number
  results: ISpeechRecognitionResultList
}

interface ISpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface ISpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: ISpeechRecognitionConstructor
  webkitSpeechRecognition?: ISpeechRecognitionConstructor
}


export interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(onResult?: (transcript: string) => void): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null)
  const isMountedRef = useRef(true)

  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as unknown as IWindowWithSpeech).SpeechRecognition ||
    (window as unknown as IWindowWithSpeech).webkitSpeechRecognition
  )

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore if already stopped
      }
      recognitionRef.current = null
    }
    if (isMountedRef.current) {
      setIsListening(false)
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói.')
      return
    }

    stopListening()
    setError(null)

    const SpeechRecognitionConstructor =
      (window as unknown as IWindowWithSpeech).SpeechRecognition ||
      (window as unknown as IWindowWithSpeech).webkitSpeechRecognition

    if (!SpeechRecognitionConstructor) return

    try {
      const recognition = new SpeechRecognitionConstructor()
      recognitionRef.current = recognition

      recognition.lang = 'de-DE'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        if (isMountedRef.current) {
          setIsListening(true)
          setError(null)
        }
      }

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          if (item.isFinal) {
            finalTranscript += item[0].transcript
          } else {
            interimTranscript += item[0].transcript
          }
        }

        const combined = (finalTranscript || interimTranscript).trim()
        if (combined && isMountedRef.current) {
          setTranscript(combined)
          if (onResult) {
            onResult(combined)
          }
        }
      }

      recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {

        if (!isMountedRef.current) return
        if (event.error === 'no-speech') {
          // User did not speak, simply stop without noisy alert
          setIsListening(false)
          return
        }
        if (event.error === 'aborted') {
          setIsListening(false)
          return
        }
        console.warn('[STT] Speech recognition error:', event.error)
        setError('Không thể nhận diện giọng nói. Bạn có thể gõ câu trả lời.')
        setIsListening(false)
      }

      recognition.onend = () => {
        if (isMountedRef.current) {
          setIsListening(false)
        }
        recognitionRef.current = null
      }

      recognition.start()
    } catch (err: unknown) {
      console.warn('[STT] Error starting speech recognition:', err)
      if (isMountedRef.current) {
        setIsListening(false)
        setError('Không thể kích hoạt micro.')
      }
    }
  }, [isSupported, onResult, stopListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      stopListening()
    }
  }, [stopListening])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

export default useSpeechRecognition
