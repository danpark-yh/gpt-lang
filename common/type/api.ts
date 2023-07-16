import { UserPromptLanguage, UserPromptResultOption, UserPromptType } from "."

export type GPTRequestBody = {
  userPrompt: string
  userPromptType: UserPromptType
  userPromptResultOption: UserPromptResultOption
  userPromptExplanationLanguage: UserPromptLanguage
}

export type GPTResponse = {
  answerResult: string
  answerExplanation: string
}
