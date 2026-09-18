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

export const cleanFillBlankText = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/^Điền từ\s*(thích hợp|vào|còn thiếu)*\s*(vào)?\s*chỗ trống:?\s*/i, '')
    .trim()
}

export interface ExtractedExerciseFormState {
  question: string
  mcQuestion: string
  mcAudioUrl: string
  mcOptions: Array<{ text: string; isCorrect: boolean }>
  translationPrompt: string
  translationExpected: string
  fillSentence: string
  fillAnswer: string
  arrangeWords: string[]
  arrangeCorrectSentence: string
  explanation: string
  xp: number
  status: 'active' | 'draft' | 'inactive'
}

export const extractExerciseFormState = (ex: LessonExercise): ExtractedExerciseFormState => {
  const content = (ex.content || {}) as Record<string, unknown>
  const answer = (ex.answer || {}) as Record<string, unknown>
  const rootEx = (ex as unknown) as Record<string, unknown>

  // XP & Status & Explanation
  const xp = ex.xp || 5
  const status = ((ex.status as string) || 'active') as 'active' | 'draft' | 'inactive'
  const explanation =
    ex.explanation ||
    (typeof answer.explanation === 'string' ? answer.explanation : '') ||
    (typeof content.explanation === 'string' ? content.explanation : '') ||
    ''

  // Question & Audio
  const question = ex.question || (typeof content.question === 'string' ? content.question : '') || ''
  const mcQuestion =
    ex.question ||
    (typeof content.question === 'string' ? content.question : '') ||
    (typeof content.prompt === 'string' ? content.prompt : '') ||
    (typeof content.sentence === 'string' ? content.sentence : '') ||
    ''
  const mcAudioUrl =
    typeof content.audio_url === 'string'
      ? content.audio_url
      : typeof rootEx.audio_url === 'string'
      ? (rootEx.audio_url as string)
      : typeof rootEx.audioUrl === 'string'
      ? (rootEx.audioUrl as string)
      : ''

  // Options & Correct option for MCQ / Listening
  let rawOptions: Array<{ text: string; isCorrect: boolean }> = []

  if (Array.isArray(ex.options) && ex.options.length >= 2) {
    rawOptions = ex.options.map((opt) => {
      if (typeof opt === 'string') return { text: opt, isCorrect: false }
      return { text: opt.text || '', isCorrect: Boolean(opt.isCorrect) }
    })
  } else if (Array.isArray(content.options) && content.options.length >= 2) {
    rawOptions = content.options.map((opt: unknown) => {
      if (typeof opt === 'string') return { text: opt, isCorrect: false }
      if (opt && typeof opt === 'object') {
        const o = opt as Record<string, unknown>
        return { text: typeof o.text === 'string' ? o.text : String(opt), isCorrect: Boolean(o.isCorrect) }
      }
      return { text: String(opt), isCorrect: false }
    })
  } else {
    rawOptions = [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  }

  // Determine correct option for MCQ / Listening
  let correctIdx = -1

  // 1. Check if an option already has isCorrect === true
  const existingCorrectIdx = rawOptions.findIndex((o) => o.isCorrect)

  // 2. Index from answer / rootEx / content
  const idxFromAnswer =
    typeof answer.correct_option_index === 'number'
      ? answer.correct_option_index
      : typeof rootEx.correct_option_index === 'number'
      ? (rootEx.correct_option_index as number)
      : typeof content.correct_option_index === 'number'
      ? (content.correct_option_index as number)
      : -1

  // 3. Text string candidates for matching
  const targetText =
    (typeof answer.correct_option === 'string' && answer.correct_option.trim() ? answer.correct_option.trim() : '') ||
    (typeof rootEx.correct_option === 'string' && (rootEx.correct_option as string).trim() ? (rootEx.correct_option as string).trim() : '') ||
    (typeof content.correct_option === 'string' && (content.correct_option as string).trim() ? (content.correct_option as string).trim() : '') ||
    (typeof answer.correct_answer === 'string' && answer.correct_answer.trim() ? answer.correct_answer.trim() : '') ||
    (typeof rootEx.correct_answer === 'string' && (rootEx.correct_answer as string).trim() ? (rootEx.correct_answer as string).trim() : '') ||
    (typeof content.correct_answer === 'string' && (content.correct_answer as string).trim() ? (content.correct_answer as string).trim() : '') ||
    (typeof ex.correctAnswer === 'string' && ex.correctAnswer.trim() ? ex.correctAnswer.trim() : '') ||
    (typeof answer.value === 'string' && answer.value.trim() ? answer.value.trim() : '') ||
    (typeof rootEx.value === 'string' && (rootEx.value as string).trim() ? (rootEx.value as string).trim() : '')

  if (idxFromAnswer >= 0 && idxFromAnswer < rawOptions.length) {
    correctIdx = idxFromAnswer
  } else if (targetText) {
    const textIdx = rawOptions.findIndex((o) => o.text.trim().toLowerCase() === targetText.toLowerCase())
    if (textIdx !== -1) {
      correctIdx = textIdx
    }
  }

  if (correctIdx === -1 && existingCorrectIdx !== -1) {
    correctIdx = existingCorrectIdx
  }

  if (correctIdx === -1 && rawOptions.length > 0) {
    correctIdx = 0
  }

  const mcOptions = rawOptions.map((opt, idx) => ({
    ...opt,
    isCorrect: idx === correctIdx,
  }))

  // Translation
  const translationPrompt =
    (typeof content.prompt === 'string' ? content.prompt : '') ||
    (typeof content.question === 'string' ? content.question : '') ||
    ex.question ||
    ''

  const translationExpected =
    (typeof answer.expected_answer === 'string' ? answer.expected_answer : '') ||
    (typeof answer.correct_answer === 'string' ? answer.correct_answer : '') ||
    (typeof answer.value === 'string' ? answer.value : '') ||
    (typeof ex.correctAnswer === 'string' ? ex.correctAnswer : '') ||
    (typeof rootEx.expected_answer === 'string' ? (rootEx.expected_answer as string) : '') ||
    (typeof rootEx.correct_answer === 'string' ? (rootEx.correct_answer as string) : '') ||
    ''

  // Fill Blank
  const fillSentence = cleanFillBlankText(
    (typeof content.sentence === 'string' ? content.sentence : '') ||
    (typeof content.question === 'string' ? content.question : '') ||
    ex.question ||
    '',
  )

  const fillAnswer =
    (typeof answer.blank_answer === 'string' ? answer.blank_answer : '') ||
    (typeof answer.correct_answer === 'string' ? answer.correct_answer : '') ||
    (typeof answer.value === 'string' ? answer.value : '') ||
    (typeof answer.expected_answer === 'string' ? answer.expected_answer : '') ||
    (typeof ex.correctAnswer === 'string' ? ex.correctAnswer : '') ||
    (typeof rootEx.blank_answer === 'string' ? (rootEx.blank_answer as string) : '') ||
    (typeof rootEx.correct_answer === 'string' ? (rootEx.correct_answer as string) : '') ||
    (typeof content.blank_answer === 'string' ? (content.blank_answer as string) : '') ||
    (typeof content.correct_answer === 'string' ? (content.correct_answer as string) : '') ||
    ''

  // Sentence Arrangement
  const rawWords = content.words ?? ex.wordTokens ?? rootEx.words ?? content.tokens
  let arrangeWords: string[] = []
  if (Array.isArray(rawWords)) {
    arrangeWords = rawWords.map((w) => String(w))
  } else if (typeof rawWords === 'string' && rawWords.trim()) {
    arrangeWords = rawWords.includes('/') ? rawWords.split('/').map((s) => s.trim()) : rawWords.split(' ')
  } else {
    arrangeWords = ['', '', '']
  }

  const arrangeCorrectSentence =
    (typeof answer.correct_sentence === 'string' ? answer.correct_sentence : '') ||
    (typeof answer.correct_answer === 'string' ? answer.correct_answer : '') ||
    (Array.isArray(answer.correct_answer) ? answer.correct_answer.join(' ') : '') ||
    (typeof ex.correctAnswer === 'string' ? ex.correctAnswer : '') ||
    (typeof rootEx.correct_sentence === 'string' ? (rootEx.correct_sentence as string) : '') ||
    (typeof rootEx.correct_answer === 'string' ? (rootEx.correct_answer as string) : '') ||
    (Array.isArray(rootEx.correct_answer) ? (rootEx.correct_answer as string[]).join(' ') : '') ||
    ''

  return {
    question,
    mcQuestion,
    mcAudioUrl,
    mcOptions,
    translationPrompt,
    translationExpected,
    fillSentence,
    fillAnswer,
    arrangeWords: arrangeWords.length > 0 ? arrangeWords : ['', '', ''],
    arrangeCorrectSentence,
    explanation,
    xp,
    status,
  }
}

export const normalizeExercise = (ex: LessonExercise): NormalizedExercise => {
  const contentObj = (ex.content || {}) as Record<string, unknown>
  const rawAnswer = (ex.answer || {}) as Record<string, unknown>

  // 1. Question extraction
  const vocabObj = typeof ex.vocabulary_id === 'object' && ex.vocabulary_id !== null ? ex.vocabulary_id : null
  let questionText =
    (typeof contentObj.question === 'string' && contentObj.question.trim().length > 0 ? contentObj.question.trim() : '') ||
    ex.question ||
    (typeof contentObj.prompt === 'string' ? contentObj.prompt : '') ||
    (typeof contentObj.sentence === 'string' ? contentObj.sentence : '') ||
    (vocabObj ? `Câu hỏi từ vựng: "${vocabObj.word}" (${vocabObj.meaning || ''})` : '') ||
    'Bài tập'

  if (ex.type === 'fill_blank' || (ex.type as string) === 'fill_in_blank') {
    questionText = cleanFillBlankText(questionText)
  }

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
