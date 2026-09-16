import type { LessonExercise } from '../types/exercise'

export interface NormalizedExercise extends LessonExercise {
  question: string
  optionsList: string[]
  wordTokens: string[]
  correctAnswer: string
  rawAnswerFormat: 'text' | 'index' | 'array'
  explanation: string
  hint?: string
  sentenceTranslation?: string
}

export const normalizeExercise = (ex: LessonExercise): NormalizedExercise => {
  const contentObj = (ex.content || {}) as Record<string, unknown>
  const rawAnswer = (ex.answer || {}) as Record<string, unknown>

  // 1. Question extraction
  const vocabObj = typeof ex.vocabulary_id === 'object' && ex.vocabulary_id !== null ? ex.vocabulary_id : null
  const questionText =
    (typeof contentObj.question === 'string' && contentObj.question.trim().length > 0 ? contentObj.question.trim() : '') ||
    ex.question ||
    (typeof contentObj.prompt === 'string' ? contentObj.prompt : '') ||
    (typeof contentObj.sentence === 'string' ? contentObj.sentence : '') ||
    (vocabObj ? `Câu hỏi từ vựng: "${vocabObj.word}" (${vocabObj.meaning || ''})` : '') ||
    'Bài tập'

  // 2. Options list extraction (always string[])
  let optionsList: string[] = []
  if (Array.isArray(contentObj.options)) {
    optionsList = contentObj.options.map((opt: unknown) => {
      if (typeof opt === 'string') return opt
      if (opt && typeof opt === 'object' && 'text' in opt && typeof (opt as { text: unknown }).text === 'string') {
        return (opt as { text: string }).text
      }
      return String(opt)
    })
  } else if (Array.isArray(ex.options)) {
    optionsList = ex.options.map((opt) => (typeof opt === 'string' ? opt : opt.text))
  }

  // 3. Word tokens extraction for word_arrangement
  let wordTokens: string[] = []
  const rawWords = contentObj.words ?? (ex as unknown as Record<string, unknown>).words
  if (Array.isArray(rawWords)) {
    wordTokens = rawWords
      .filter((w) => w !== null && w !== undefined)
      .map((w) => String(w))
  }

  // 4. Correct Answer & Answer Format Determination
  let correctAnswer = ''
  let rawAnswerFormat: 'text' | 'index' | 'array' = ex.type === 'word_arrangement' ? 'array' : ex.type === 'fill_blank' ? 'text' : 'text'

  const rootEx = (ex as unknown) as Record<string, unknown>

  // Check backend format variants
  const correctAnswerVal = rawAnswer.correct_answer ?? rootEx.correct_answer ?? contentObj.correct_answer
  const correctOptionVal = rawAnswer.correct_option ?? rootEx.correct_option ?? contentObj.correct_option
  const correctOptionIndexVal = rawAnswer.correct_option_index ?? rootEx.correct_option_index ?? contentObj.correct_option_index
  const valueVal = rawAnswer.value ?? rootEx.value ?? contentObj.value
  const expectedAnswerVal = rawAnswer.expected_answer ?? rootEx.expected_answer ?? contentObj.expected_answer
  const blankAnswerVal = rawAnswer.blank_answer ?? rootEx.blank_answer ?? contentObj.blank_answer
  const correctSentenceVal = rawAnswer.correct_sentence ?? rootEx.correct_sentence ?? contentObj.correct_sentence

  if (Array.isArray(correctAnswerVal)) {
    correctAnswer = correctAnswerVal.map((item) => String(item)).join(' ')
    if (ex.type === 'word_arrangement') {
      rawAnswerFormat = 'array'
    }
  } else if (typeof correctAnswerVal === 'string' && correctAnswerVal.trim().length > 0) {
    correctAnswer = correctAnswerVal.trim()
  } else if (typeof correctOptionVal === 'string' && correctOptionVal.trim().length > 0) {
    correctAnswer = correctOptionVal.trim()
  } else if (typeof valueVal === 'string' && valueVal.trim().length > 0) {
    correctAnswer = valueVal.trim()
  } else if (correctOptionIndexVal !== undefined && correctOptionIndexVal !== null && ex.type !== 'fill_blank' && ex.type !== 'word_arrangement') {
    rawAnswerFormat = 'index'
    const idx = Number(correctOptionIndexVal)
    if (!Number.isNaN(idx) && idx >= 0 && idx < optionsList.length) {
      correctAnswer = optionsList[idx]
    } else {
      console.warn(`[ExerciseAdapter] Invalid correct_option_index ${idx} is out of bounds for options length ${optionsList.length}`)
      correctAnswer = ''
    }
  } else if (typeof expectedAnswerVal === 'string' && expectedAnswerVal.trim().length > 0) {
    correctAnswer = expectedAnswerVal.trim()
  } else if (typeof blankAnswerVal === 'string' && blankAnswerVal.trim().length > 0) {
    correctAnswer = blankAnswerVal.trim()
  } else if (typeof correctSentenceVal === 'string' && correctSentenceVal.trim().length > 0) {
    correctAnswer = correctSentenceVal.trim()
  } else if (Array.isArray(ex.options)) {
    const foundCorrect = ex.options.find((opt) => typeof opt === 'object' && opt !== null && 'isCorrect' in opt && opt.isCorrect)
    if (foundCorrect && 'text' in foundCorrect && typeof foundCorrect.text === 'string') {
      correctAnswer = foundCorrect.text
    }
  }

  if (ex.type === 'fill_blank') {
    rawAnswerFormat = 'text'
  } else if (ex.type === 'word_arrangement') {
    rawAnswerFormat = 'array'
  }

  // 5. Explanation & Hint extraction
  const explanationText =
    ex.explanation ||
    (typeof rawAnswer.explanation === 'string' ? rawAnswer.explanation : '') ||
    (typeof contentObj.explanation === 'string' ? contentObj.explanation : '') ||
    ''

  const hintText =
    ex.hint ||
    (typeof contentObj.hint === 'string' ? contentObj.hint : '') ||
    ''

  const sentenceTranslationText =
    ex.sentence_translation ||
    (typeof contentObj.sentence_translation === 'string' ? contentObj.sentence_translation : '') ||
    ''

  return {
    ...ex,
    question: questionText,
    optionsList,
    wordTokens,
    correctAnswer,
    rawAnswerFormat,
    explanation: explanationText,
    hint: hintText,
    sentenceTranslation: sentenceTranslationText,
  }
}

/**
 * Prepares the payload format for sending to backend submit API.
 * - If word_arrangement (rawAnswerFormat === 'array'), returns string[].
 * - If backend exercise requires index (rawAnswerFormat === 'index'), converts selected text string to index number.
 * - If backend exercise requires text (rawAnswerFormat === 'text'), sends selected text string.
 */
export const formatSubmitAnswer = (
  exercise: LessonExercise | NormalizedExercise,
  selectedAnswer: string | string[],
): string | number | string[] => {
  const normEx = 'optionsList' in exercise && exercise.optionsList ? (exercise as NormalizedExercise) : normalizeExercise(exercise)

  if (normEx.type === 'word_arrangement' || normEx.rawAnswerFormat === 'array') {
    if (Array.isArray(selectedAnswer)) {
      return [...selectedAnswer]
    }
    if (typeof selectedAnswer === 'string') {
      return selectedAnswer ? [selectedAnswer] : []
    }
    return []
  }

  const selectedAnswerText = typeof selectedAnswer === 'string' ? selectedAnswer : Array.isArray(selectedAnswer) ? selectedAnswer.join(' ') : String(selectedAnswer)

  if (normEx.type === 'fill_blank') {
    return selectedAnswerText
  }

  if (normEx.rawAnswerFormat === 'index') {
    const idx = normEx.optionsList.indexOf(selectedAnswerText)
    if (idx !== -1) {
      return idx
    }
    const numericIdx = Number(selectedAnswerText)
    if (!Number.isNaN(numericIdx) && numericIdx >= 0 && numericIdx < normEx.optionsList.length) {
      return numericIdx
    }
    return -1
  }

  return selectedAnswerText
}

/**
 * Helper to check local answer correctness.
 */
export const evaluateAnswerLocally = (
  exercise: LessonExercise | NormalizedExercise,
  userAnswerText: string,
): boolean => {
  const normEx = 'correctAnswer' in exercise && exercise.correctAnswer !== undefined ? (exercise as NormalizedExercise) : normalizeExercise(exercise)
  if (!normEx.correctAnswer) return false
  return userAnswerText.trim().toLowerCase() === normEx.correctAnswer.trim().toLowerCase()
}
