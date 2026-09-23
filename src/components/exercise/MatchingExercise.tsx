import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { LessonExercise, MatchingPair } from '../../types/exercise'
import './matchingExercise.css'

interface CardItem {
  id: string
  pairId: string
  text: string
  side: 'left' | 'right'
}

export interface MatchingExerciseProps {
  exercise: LessonExercise
  onAnswerChange: (matchedPairs: Array<{ left: string; right: string }>, isComplete: boolean) => void
  disabled?: boolean
  submissionResult?: {
    submitted: boolean
    correct: boolean
    feedback: string
    xp: number
  } | null
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

const getPairsFromExercise = (ex: LessonExercise): MatchingPair[] => {
  const contentObj = (ex.content || {}) as Record<string, unknown>
  const rootEx = ex as unknown as Record<string, unknown>
  if (Array.isArray(contentObj.pairs)) return contentObj.pairs as MatchingPair[]
  if (Array.isArray(rootEx.pairs)) return rootEx.pairs as MatchingPair[]
  return []
}

export const MatchingExercise: React.FC<MatchingExerciseProps> = ({
  exercise,
  onAnswerChange,
  disabled = false,
  submissionResult = null,
}) => {
  const { t } = useTranslation('learning')
  const [leftCards, setLeftCards] = useState<CardItem[]>([])
  const [rightCards, setRightCards] = useState<CardItem[]>([])
  const [selectedLeft, setSelectedLeft] = useState<CardItem | null>(null)
  const [selectedRight, setSelectedRight] = useState<CardItem | null>(null)
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([])
  const [userMatchedPairs, setUserMatchedPairs] = useState<Array<{ left: string; right: string }>>([])
  const [wrongPair, setWrongPair] = useState<{ leftId: string; rightId: string } | null>(null)
  const [isCheckingWrong, setIsCheckingWrong] = useState(false)

  // Initialize and shuffle cards whenever exercise changes
  useEffect(() => {
    const rawPairs = getPairsFromExercise(exercise)

    if (!rawPairs || rawPairs.length === 0) {
      setLeftCards([])
      setRightCards([])
      setMatchedPairIds([])
      setUserMatchedPairs([])
      setSelectedLeft(null)
      setSelectedRight(null)
      setWrongPair(null)
      return
    }

    const leftItems: CardItem[] = rawPairs.map((p, idx) => ({
      id: `left_${p.id || idx}_${p.left}`,
      pairId: p.id || `pair_${idx}`,
      text: p.left,
      side: 'left',
    }))

    const rightItems: CardItem[] = rawPairs.map((p, idx) => ({
      id: `right_${p.id || idx}_${p.right}`,
      pairId: p.id || `pair_${idx}`,
      text: p.right,
      side: 'right',
    }))

    setLeftCards(shuffleArray(leftItems))
    setRightCards(shuffleArray(rightItems))
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatchedPairIds([])
    setUserMatchedPairs([])
    setWrongPair(null)
    setIsCheckingWrong(false)
  }, [exercise])

  const evaluatePair = (leftItem: CardItem, rightItem: CardItem) => {
    if (leftItem.pairId === rightItem.pairId) {
      // Correct Match!
      const newMatchedIds = [...matchedPairIds, leftItem.pairId]
      const newMatchedPairs = [...userMatchedPairs, { left: leftItem.text, right: rightItem.text }]

      setMatchedPairIds(newMatchedIds)
      setUserMatchedPairs(newMatchedPairs)
      setSelectedLeft(null)
      setSelectedRight(null)

      const rawPairs = getPairsFromExercise(exercise)
      const totalPairsCount = rawPairs.length

      const isAllMatched = totalPairsCount > 0 && newMatchedIds.length === totalPairsCount

      onAnswerChange(newMatchedPairs, isAllMatched)
    } else {
      // Wrong Match!
      setWrongPair({ leftId: leftItem.id, rightId: rightItem.id })
      setIsCheckingWrong(true)

      setTimeout(() => {
        setWrongPair(null)
        setSelectedLeft(null)
        setSelectedRight(null)
        setIsCheckingWrong(false)
      }, 800)
    }
  }

  const handleCardClick = (card: CardItem) => {
    if (disabled || isCheckingWrong || Boolean(submissionResult) || matchedPairIds.includes(card.pairId)) {
      return
    }

    if (card.side === 'left') {
      if (selectedLeft?.id === card.id) {
        setSelectedLeft(null)
        return
      }
      setSelectedLeft(card)
      if (selectedRight) {
        evaluatePair(card, selectedRight)
      }
    } else {
      if (selectedRight?.id === card.id) {
        setSelectedRight(null)
        return
      }
      setSelectedRight(card)
      if (selectedLeft) {
        evaluatePair(selectedLeft, card)
      }
    }
  }

  const pairsList = getPairsFromExercise(exercise)

  if (pairsList.length === 0) {
    return (
      <div className="matching-exercise" style={{ textAlign: 'center', padding: '24px', color: '#dc2626' }}>
        <p style={{ fontWeight: 600 }}>{t('exercises.matchingInvalidData')}</p>
      </div>
    )
  }

  return (
    <div className="matching-exercise">
      <div className="matching-header">
        <h3 className="matching-title">
          <span>🔗</span> {exercise.question || (exercise.content?.question as string) || t('exercises.matchingPrompt')}
        </h3>
        <p className="matching-instruction">
          {t('exercises.matchingInstruction')}
        </p>
      </div>

      <div className="matching-grid">
        <div className="matching-column">
          {leftCards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId)
            const isSelected = selectedLeft?.id === card.id
            const isWrong = wrongPair?.leftId === card.id

            let className = 'matching-card'
            if (isMatched) className += ' matched'
            else if (isWrong) className += ' wrong'
            else if (isSelected) className += ' selected'

            return (
              <button
                key={card.id}
                type="button"
                className={className}
                onClick={() => handleCardClick(card)}
                disabled={disabled || isMatched || isCheckingWrong || Boolean(submissionResult)}
                aria-pressed={isSelected}
                aria-disabled={disabled || isMatched}
              >
                {card.text}
              </button>
            )
          })}
        </div>

        <div className="matching-column">
          {rightCards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId)
            const isSelected = selectedRight?.id === card.id
            const isWrong = wrongPair?.rightId === card.id

            let className = 'matching-card'
            if (isMatched) className += ' matched'
            else if (isWrong) className += ' wrong'
            else if (isSelected) className += ' selected'

            return (
              <button
                key={card.id}
                type="button"
                className={className}
                onClick={() => handleCardClick(card)}
                disabled={disabled || isMatched || isCheckingWrong || Boolean(submissionResult)}
                aria-pressed={isSelected}
                aria-disabled={disabled || isMatched}
              >
                {card.text}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
