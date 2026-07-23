import { useMemo, type MouseEvent } from 'react'
import { useSpeech } from '../../hooks/useSpeech'

interface SpeakerButtonProps {
  word: string
}

export function SpeakerButton({ word }: SpeakerButtonProps) {
  const { speak, stop } = useSpeech()
  const isSupported = useMemo(() => typeof window !== 'undefined' && 'speechSynthesis' in window, [])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (!word) return

    if (!isSupported) {
      stop()
      return
    }

    speak(word, { lang: 'de-DE', rate: 0.95, pitch: 1, volume: 1 })
  }

  return (
    <button
      type="button"
      className="speaker-button"
      onClick={handleClick}
      disabled={!isSupported}
      aria-label={`Phát âm từ ${word}`}
      title={isSupported ? `Phát âm: ${word}` : 'Trình duyệt không hỗ trợ phát âm'}
    >
      🔊
    </button>
  )
}
