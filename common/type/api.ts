import {
  UserPromptInputLanguage,
  UserPromptOutputLanguage,
  UserPromptResultOption,
  UserPromptType,
} from "."

export type GPTRequestBody = {
  userPrompt: string
  userPromptType: UserPromptType
  userPromptResultOption: UserPromptResultOption
  userPromptInputLanguage: UserPromptInputLanguage
  userPromptOutputLanguage: UserPromptOutputLanguage
}

export type GPTResponse = {
  answerResult: string
  answerExplanation: string
}
