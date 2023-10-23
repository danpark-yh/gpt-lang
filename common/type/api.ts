import {
  EnglishType,
  Language,
  UserPromptResultOption,
  UserPromptType,
} from "."

export type GPTRequestBody = {
  userPrompt: string
  userPromptType: UserPromptType
  userPromptResultOption: UserPromptResultOption
  advancedOptions: {
    englishType: EnglishType
  }
}

export type GPTResponse = {
  answerResult: string
  answerExplanation: string
}

export type TranslationRequestBody = {
  text: string
  sourceLanguage: Language
  targetLanguage: Language
}

export type TranslationResponse = {
  translatedText: string
}
