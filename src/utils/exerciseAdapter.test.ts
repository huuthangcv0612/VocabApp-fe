import { normalizeExercise, formatSubmitAnswer, evaluateAnswerLocally, extractExerciseFormState, getArrangementSentence, cleanArrangementText } from './exerciseAdapter'
import type { LessonExercise } from '../types/exercise'

export const runExerciseAdapterTests = () => {
  const results: Array<{ name: string; passed: boolean; error?: string }> = []

  const assert = (condition: boolean, message: string) => {
    if (!condition) {
      throw new Error(message)
    }
  }

  const testCase = (name: string, fn: () => void) => {
    try {
      fn()
      results.push({ name, passed: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ name, passed: false, error: msg })
    }
  }

  // Sample data from prompt:
  // Options: ["der Krankenpfleger", "gesund", "krank", "der Arzt"]
  const sampleOptions = ['der Krankenpfleger', 'gesund', 'krank', 'der Arzt']

  // Test 1: correct_option = "der Arzt", selected = "der Arzt" -> correct
  testCase('correct_option = "der Arzt", selected = "der Arzt" -> correct', () => {
    const rawEx: LessonExercise = {
      _id: 'ex1',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Từ tiếng Đức nào có nghĩa là “Bác sĩ nam”?',
      content: {
        options: sampleOptions,
      },
      answer: {
        correct_option: 'der Arzt',
        explanation: 'der Arzt = Bác sĩ nam',
      },
    }

    const norm = normalizeExercise(rawEx)
    assert(norm.correctAnswer === 'der Arzt', `Expected correctAnswer to be 'der Arzt', got '${norm.correctAnswer}'`)
    assert(norm.rawAnswerFormat === 'text', `Expected rawAnswerFormat to be 'text', got '${norm.rawAnswerFormat}'`)

    const isCorrect = evaluateAnswerLocally(norm, 'der Arzt')
    assert(isCorrect === true, 'Expected evaluation of "der Arzt" to be true')

    const payload = formatSubmitAnswer(norm, 'der Arzt')
    assert(payload === 'der Arzt', `Expected payload to be text "der Arzt", got '${payload}'`)
  })

  // Test 2: correct_option = "der Arzt", selected = "krank" -> incorrect
  testCase('correct_option = "der Arzt", selected = "krank" -> incorrect', () => {
    const rawEx: LessonExercise = {
      _id: 'ex1',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Từ tiếng Đức nào có nghĩa là “Bác sĩ nam”?',
      content: {
        options: sampleOptions,
      },
      answer: {
        correct_option: 'der Arzt',
        explanation: 'der Arzt = Bác sĩ nam',
      },
    }

    const norm = normalizeExercise(rawEx)
    const isCorrect = evaluateAnswerLocally(norm, 'krank')
    assert(isCorrect === false, 'Expected evaluation of "krank" to be false')

    const payload = formatSubmitAnswer(norm, 'krank')
    assert(payload === 'krank', `Expected payload to be text "krank", got '${payload}'`)
  })

  // Test 3: correct_option_index = 0 -> maps to options[0]
  testCase('correct_option_index = 0 -> maps to options[0]', () => {
    const rawEx: LessonExercise = {
      _id: 'ex2',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Test Index 0',
      content: {
        options: sampleOptions,
      },
      answer: {
        correct_option_index: 0,
      },
    }

    const norm = normalizeExercise(rawEx)
    assert(norm.correctAnswer === 'der Krankenpfleger', `Expected options[0] 'der Krankenpfleger', got '${norm.correctAnswer}'`)
    assert(norm.rawAnswerFormat === 'index', `Expected rawAnswerFormat 'index', got '${norm.rawAnswerFormat}'`)

    const payload = formatSubmitAnswer(norm, 'der Krankenpfleger')
    assert(payload === 0, `Expected payload to be index 0, got '${payload}'`)
  })

  // Test 4: correct_option_index = 3 -> maps to options[3]
  testCase('correct_option_index = 3 -> maps to options[3]', () => {
    const rawEx: LessonExercise = {
      _id: 'ex3',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Test Index 3',
      content: {
        options: sampleOptions,
      },
      answer: {
        correct_option_index: 3,
      },
    }

    const norm = normalizeExercise(rawEx)
    assert(norm.correctAnswer === 'der Arzt', `Expected options[3] 'der Arzt', got '${norm.correctAnswer}'`)
    assert(norm.rawAnswerFormat === 'index', `Expected rawAnswerFormat 'index', got '${norm.rawAnswerFormat}'`)

    const payload = formatSubmitAnswer(norm, 'der Arzt')
    assert(payload === 3, `Expected payload to be index 3, got '${payload}'`)
  })

  // Test 5: selected text is converted to index ONLY when exercise requires index submission
  testCase('selected text is converted to index ONLY when exercise requires index submission', () => {
    const textEx: LessonExercise = {
      _id: 'ex_text',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Text Question',
      content: { options: sampleOptions },
      answer: { correct_option: 'der Arzt' },
    }

    const indexEx: LessonExercise = {
      _id: 'ex_index',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Index Question',
      content: { options: sampleOptions },
      answer: { correct_option_index: 3 },
    }

    const textPayload = formatSubmitAnswer(textEx, 'der Arzt')
    assert(typeof textPayload === 'string' && textPayload === 'der Arzt', `Expected string "der Arzt", got ${typeof textPayload} '${textPayload}'`)

    const indexPayload = formatSubmitAnswer(indexEx, 'der Arzt')
    assert(typeof indexPayload === 'number' && indexPayload === 3, `Expected number 3, got ${typeof indexPayload} '${indexPayload}'`)
  })

  // Test 6: Invalid correct_option_index out of bounds
  testCase('invalid correct_option_index out of bounds does not crash or guess', () => {
    const invalidEx: LessonExercise = {
      _id: 'ex_invalid',
      order: 1,
      type: 'multiple_choice',
      xp: 5,
      question: 'Out of bounds test',
      content: { options: sampleOptions },
      answer: { correct_option_index: 99 },
    }

    const norm = normalizeExercise(invalidEx)
    assert(norm.correctAnswer === '', `Expected empty string for out of bounds index, got '${norm.correctAnswer}'`)
  })

  // Test 7: fill_blank canonical structure normalization & payload formatting
  testCase('fill_blank canonical structure normalization & formatSubmitAnswer string payload', () => {
    const fillEx: LessonExercise = {
      _id: '6aaab0961613afc60d0bf803',
      lesson_id: 'l123',
      type: 'fill_blank',
      order: 1,
      xp: 2,
      question: 'Bài tập',
      content: {
        question: 'Ich habe eine ___ .',
        hint: 'Em gái',
        sentence_translation: 'Tôi có một em gái.',
      },
      answer: {
        correct_answer: 'Schwester',
        explanation: 'die Schwester = chị/em gái',
      },
    }

    const norm = normalizeExercise(fillEx)
    assert(norm.question === 'Ich habe eine ___ .', `Expected question 'Ich habe eine ___ .', got '${norm.question}'`)
    assert(norm.hint === 'Em gái', `Expected hint 'Em gái', got '${norm.hint}'`)
    assert(norm.sentenceTranslation === 'Tôi có một em gái.', `Expected sentenceTranslation 'Tôi có một em gái.', got '${norm.sentenceTranslation}'`)
    assert(norm.correctAnswer === 'Schwester', `Expected correctAnswer 'Schwester', got '${norm.correctAnswer}'`)
    assert(norm.rawAnswerFormat === 'text', `Expected rawAnswerFormat 'text', got '${norm.rawAnswerFormat}'`)

    const payload = formatSubmitAnswer(norm, 'Schwester')
    assert(typeof payload === 'string', `Expected string payload for fill_blank, got ${typeof payload}`)
    assert(payload === 'Schwester', `Expected payload 'Schwester', got '${payload}'`)
  })

  // Test 8: fill_blank without answer payload (Learner API format)
  testCase('fill_blank without answer payload (Learner API) preserves text format and hint', () => {
    const fillExLearner: LessonExercise = {
      _id: '6aaab0961613afc60d0bf803',
      lesson_id: 'l123',
      type: 'fill_blank',
      order: 1,
      xp: 2,
      question: 'Bài tập',
      content: {
        question: 'Ich habe eine ___ .',
        hint: 'Em gái',
        sentence_translation: 'Tôi có một em gái.',
      },
    }

    const norm = normalizeExercise(fillExLearner)
    assert(norm.question === 'Ich habe eine ___ .', `Expected question 'Ich habe eine ___ .', got '${norm.question}'`)
    assert(norm.rawAnswerFormat === 'text', `Expected rawAnswerFormat 'text', got '${norm.rawAnswerFormat}'`)
    assert(norm.hint === 'Em gái', `Expected hint 'Em gái', got '${norm.hint}'`)

    const payload = formatSubmitAnswer(norm, 'schwester')
    assert(payload === 'schwester', `Expected payload 'schwester', got '${payload}'`)
  })

  // Test 8b: fill_blank with generic instruction question extracts sentence or fallback
  testCase('fill_blank with generic instruction question extracts sentence or fallback', () => {
    const fillExGeneric: LessonExercise = {
      _id: 'ex_generic_1',
      lesson_id: 'l123',
      type: 'fill_blank',
      order: 1,
      xp: 2,
      question: 'Điền từ còn thiếu vào chỗ trống',
      content: {
        question: 'Điền từ còn thiếu vào chỗ trống',
        sentence: 'Das ___ ist neu.',
        hint: 'Bệnh viện',
      },
    }

    const norm1 = normalizeExercise(fillExGeneric)
    assert(norm1.question === 'Das ___ ist neu.', `Expected question 'Das ___ ist neu.', got '${norm1.question}'`)

    const fillExOnlyInstruction: LessonExercise = {
      _id: 'ex_generic_2',
      lesson_id: 'l123',
      type: 'fill_blank',
      order: 2,
      xp: 2,
      question: 'Điền từ còn thiếu vào chỗ trống',
      content: {
        question: 'Điền từ còn thiếu vào chỗ trống',
        hint: 'Bệnh viện',
      },
    }

    const norm2 = normalizeExercise(fillExOnlyInstruction)
    assert(norm2.question === '___', `Expected fallback question '___', got '${norm2.question}'`)
  })

  // Test 9: word_arrangement canonical structure normalization & wordTokens extraction
  testCase('word_arrangement canonical structure normalization & wordTokens extraction', () => {
    const rawWords = ['Ich', 'habe', 'einen', 'Bruder']
    const wordEx: LessonExercise = {
      _id: 'ex_word_arr_1',
      lesson_id: 'l123',
      type: 'word_arrangement',
      order: 1,
      xp: 2,
      question: 'Bài tập',
      content: {
        question: 'Sắp xếp các từ thành câu đúng:',
        words: rawWords,
      },
      answer: {
        correct_answer: ['Ich', 'habe', 'einen', 'Bruder'],
        explanation: 'Ich habe einen Bruder.',
      },
    }

    const norm = normalizeExercise(wordEx)
    assert(norm.question === 'Sắp xếp các từ thành câu đúng:', `Expected question 'Sắp xếp các từ thành câu đúng:', got '${norm.question}'`)
    assert(norm.rawAnswerFormat === 'array', `Expected rawAnswerFormat 'array', got '${norm.rawAnswerFormat}'`)
    assert(Array.isArray(norm.wordTokens), 'Expected wordTokens to be an array')
    assert(norm.wordTokens.length === 4, `Expected wordTokens length 4, got ${norm.wordTokens.length}`)
    assert(norm.wordTokens[0] === 'Ich' && norm.wordTokens[3] === 'Bruder', 'Expected wordTokens to match content.words')
  })

  // Test 10: formatSubmitAnswer returns string[] for word_arrangement and does not stringify or convert to indexes
  testCase('formatSubmitAnswer returns string[] for word_arrangement, not string or index', () => {
    const wordEx: LessonExercise = {
      _id: 'ex_word_arr_2',
      order: 1,
      type: 'word_arrangement',
      xp: 2,
      question: 'Sắp xếp câu',
      content: { words: ['Ich', 'habe', 'einen', 'Bruder'] },
    }

    const selected = ['Ich', 'habe', 'einen', 'Bruder']
    const payload = formatSubmitAnswer(wordEx, selected) as string[]

    assert(Array.isArray(payload), `Expected payload to be Array, got ${typeof payload}`)
    assert(payload.length === 4, `Expected array of length 4, got ${payload.length}`)
    assert(typeof payload[0] === 'string' && payload[0] === 'Ich', `Expected payload[0] to be 'Ich', got '${payload[0]}'`)
    assert(typeof (payload as unknown) !== 'string', 'Expected payload NOT to be a string')
  })

  // Test 11: Duplicate tokens are preserved in exact order
  testCase('word_arrangement duplicate tokens are preserved in exact order', () => {
    const wordEx: LessonExercise = {
      _id: 'ex_dup',
      order: 1,
      type: 'word_arrangement',
      xp: 2,
      question: 'Sắp xếp từ',
      content: { words: ['Ich', 'habe', 'habe', 'Bruder'] },
    }

    const selectedWithDups = ['Ich', 'habe', 'habe', 'Bruder']
    const payload = formatSubmitAnswer(wordEx, selectedWithDups) as string[]

    assert(Array.isArray(payload), 'Expected array payload')
    assert(payload.length === 4, `Expected 4 items, got ${payload.length}`)
    assert(payload[1] === 'habe' && payload[2] === 'habe', 'Expected both duplicate "habe" tokens to be preserved')
  })

  // Test 12: Empty array selection and malformed content handle safely without crashing
  testCase('word_arrangement handles empty array selection and malformed content safely', () => {
    const malformedEx: LessonExercise = {
      _id: 'ex_malformed',
      order: 1,
      type: 'word_arrangement',
      xp: 2,
      question: '',
      content: { words: null as unknown as string[] },
    }

    const norm = normalizeExercise(malformedEx)
    assert(Array.isArray(norm.wordTokens) && norm.wordTokens.length === 0, 'Expected empty wordTokens array for null words')
    assert(norm.rawAnswerFormat === 'array', 'Expected rawAnswerFormat array')

    const emptyPayload = formatSubmitAnswer(norm, []) as string[]
    assert(Array.isArray(emptyPayload) && emptyPayload.length === 0, 'Expected empty array payload')
  })

  // Test 13: Source content.words array is not mutated by normalization or formatting
  testCase('word_arrangement does not mutate source content.words array', () => {
    const originalWords = ['Ich', 'habe', 'einen', 'Bruder']
    const sourceWordsCopy = [...originalWords]
    const wordEx: LessonExercise = {
      _id: 'ex_immutable',
      order: 1,
      type: 'word_arrangement',
      xp: 2,
      question: 'Test immutability',
      content: { words: sourceWordsCopy },
    }

    normalizeExercise(wordEx)
    formatSubmitAnswer(wordEx, ['Bruder', 'Ich'])

    assert(sourceWordsCopy.length === 4, 'Expected source array length unchanged')
    assert(sourceWordsCopy[0] === 'Ich' && sourceWordsCopy[3] === 'Bruder', 'Expected source array elements unchanged')
  })

  // Test 14: extractExerciseFormState for MCQ matching correct option string when options have isCorrect = false
  testCase('extractExerciseFormState for MCQ matching correct_answer text', () => {
    const rawMcq: LessonExercise = {
      _id: 'ex_mcq',
      order: 1,
      type: 'multiple_choice',
      xp: 2,
      question: 'Từ tiếng Đức nào có nghĩa là “mắt”?',
      options: [
        { text: 'die Hand, -ä,e', isCorrect: false },
        { text: 'das Auge, -n', isCorrect: false },
        { text: 'der Körper, -', isCorrect: false },
        { text: 'der Kopf, -ö,e', isCorrect: false },
      ],
      answer: {
        correct_answer: 'das Auge, -n',
        explanation: 'das Auge, -n = mắt',
      },
    }

    const state = extractExerciseFormState(rawMcq)
    assert(state.mcOptions[1].text === 'das Auge, -n', 'Expected option index 1 to be das Auge, -n')
    assert(state.mcOptions[1].isCorrect === true, 'Expected option index 1 to be correct')
    assert(state.mcOptions[0].isCorrect === false, 'Expected option index 0 to be incorrect')
  })

  // Test 15: extractExerciseFormState for fill_blank extracting correct_answer into fillAnswer
  testCase('extractExerciseFormState for fill_blank extracting correct_answer into fillAnswer', () => {
    const rawFill: LessonExercise = {
      _id: 'ex_fill',
      order: 1,
      type: 'fill_blank',
      xp: 2,
      question: 'Điền từ vào chỗ trống: Das ist ___.',
      content: {
        sentence: 'Das ist ___.',
      },
      answer: {
        correct_answer: 'der Vater',
        explanation: 'der Vater = bố',
      },
    }

    const state = extractExerciseFormState(rawFill)
    assert(state.fillSentence === 'Das ist ___.', `Expected fillSentence 'Das ist ___.', got '${state.fillSentence}'`)
    assert(state.fillAnswer === 'der Vater', `Expected fillAnswer 'der Vater', got '${state.fillAnswer}'`)
  })

  // Test 16: matching exercise formatSubmitAnswer returns pair array
  testCase('formatSubmitAnswer for matching exercise type returns array of pairs', () => {
    const rawMatching: LessonExercise = {
      _id: 'ex_match_1',
      order: 1,
      type: 'matching',
      xp: 10,
      question: 'Ghép các cặp từ tương ứng',
      content: {
        pairs: [
          { id: 'pair_1', left: 'có chuyện gì vậy', right: 'was ist los' },
          { id: 'pair_2', left: 'không', right: 'nicht' },
        ],
      },
    }

    const userAns = [
      { left: 'có chuyện gì vậy', right: 'was ist los' },
      { left: 'không', right: 'nicht' },
    ]

    const formatted = formatSubmitAnswer(rawMatching, userAns)
    assert(Array.isArray(formatted), 'Expected formatted answer to be an array')
    assert((formatted as Array<{ left: string; right: string }>).length === 2, 'Expected formatted answer length to be 2')
    assert(
      (formatted as Array<{ left: string; right: string }>)[0].left === 'có chuyện gì vậy' &&
        (formatted as Array<{ left: string; right: string }>)[0].right === 'was ist los',
      'Expected first pair to match user answer',
    )
  })

  // Test 17: getArrangementSentence displays complete sentence and ignores "Sắp xếp các từ thành câu đúng:"
  testCase('getArrangementSentence extracts complete sentence from answer.correct_sentence', () => {
    const rawArr: LessonExercise = {
      _id: 'ex_arr_1',
      order: 1,
      type: 'sentence_arrangement',
      xp: 15,
      question: 'Sắp xếp các từ thành câu đúng:',
      content: {
        question: 'Sắp xếp các từ thành câu đúng:',
        words: ['Ich', 'wohne', 'in', 'Berlin.'],
      },
      answer: {
        correct_sentence: 'Ich wohne in Berlin.',
        correct_answer: 'Ich wohne in Berlin.',
      },
    }

    const sentence = getArrangementSentence(rawArr)
    assert(sentence === 'Ich wohne in Berlin.', `Expected 'Ich wohne in Berlin.', got '${sentence}'`)
  })

  // Test 18: getArrangementSentence handles array correct_answer
  testCase('getArrangementSentence extracts complete sentence from array answer.correct_answer', () => {
    const rawArr: LessonExercise = {
      _id: 'ex_arr_2',
      order: 1,
      type: 'word_arrangement',
      xp: 15,
      question: 'Sắp xếp các từ thành câu đúng:',
      content: {
        words: ['Ich', 'habe', 'einen', 'Bruder.'],
      },
      answer: {
        correct_answer: ['Ich', 'habe', 'einen', 'Bruder.'],
      },
    }

    const sentence = getArrangementSentence(rawArr)
    assert(sentence === 'Ich habe einen Bruder.', `Expected 'Ich habe einen Bruder.', got '${sentence}'`)
  })

  // Test 19: cleanArrangementText strips various prefixes
  testCase('cleanArrangementText strips prompt prefixes correctly', () => {
    assert(cleanArrangementText('Sắp xếp các từ thành câu đúng:') === '', 'Expected empty string')
    assert(cleanArrangementText('Sắp xếp các từ thành câu đúng: Ich lerne Deutsch.') === 'Ich lerne Deutsch.', 'Expected sentence without prefix')
    assert(cleanArrangementText('Sắp xếp các từ: Das ist gut.') === 'Das ist gut.', 'Expected sentence without prefix')
  })

  return results
}
