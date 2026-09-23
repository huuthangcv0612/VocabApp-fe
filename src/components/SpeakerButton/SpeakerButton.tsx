import { useMemo, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSpeech } from '../../hooks/useSpeech'

export interface SpeakerButtonProps {
  word?: string
  text?: string
  onSpeak?: (text: string) => void
  isPlaying?: boolean
  isLoading?: boolean
  disabled?: boolean
  className?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SpeakerButton({
  word,
  text,
  onSpeak,
  isPlaying = false,
  isLoading = false,
  disabled = false,
  className = '',
  title,
  size = 'md',
}: SpeakerButtonProps) {
  const { t } = useTranslation('common')
  const { speak, stop } = useSpeech()
  const isSupported = useMemo(() => typeof window !== 'undefined' && 'speechSynthesis' in window, [])

  const contentToSpeak = text || word || ''

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (!contentToSpeak || disabled || isLoading) return

    // If custom onSpeak handler is provided (e.g. Azure TTS in AI Conversation)
    if (onSpeak) {
      onSpeak(contentToSpeak)
      return
    }

    // Default Browser Speech fallback
    if (!isSupported) {
      stop()
      return
    }

    speak(contentToSpeak, { lang: 'de-DE', rate: 0.95, pitch: 1, volume: 1 })
  }

  const isButtonDisabled = disabled || (onSpeak ? false : !isSupported)

  const defaultTitle = isPlaying
    ? t('speaker.playing')
    : isLoading
    ? t('speaker.loading')
    : isSupported || onSpeak
    ? `${t('speaker.pronounce')} ${contentToSpeak}`
    : t('speaker.unsupported')

  return (
    <button
      type="button"
      className={`speaker-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''} ${size} ${className}`.trim()}
      onClick={handleClick}
      disabled={isButtonDisabled}
      aria-label={title || defaultTitle}
      title={title || defaultTitle}
    >
      {isLoading ? (
        <span className="speaker-spinner" aria-hidden="true">⏳</span>
      ) : isPlaying ? (
        <span className="speaker-wave" aria-hidden="true">🔊</span>
      ) : (
        <span aria-hidden="true">🔊</span>
      )}
    </button>
  )
}
