import { getWordCount } from "@/common/function/helper"
import { TranslationRequestBody, TranslationResponse } from "@/common/type/api"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

interface CustomRequest extends Request {
  json(): Promise<TranslationRequestBody>
}

export async function POST(
  request: CustomRequest
): Promise<NextResponse<TranslationResponse>> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const openai = new OpenAIApi(configuration)
  const body = await request.json()
  const { text, sourceLanguage, targetLanguage } = body

  console.log(
    `[Translation] ==== BEGIN ==== ${getWordCount(
      text
    )} words. / From ${sourceLanguage} to ${targetLanguage}`
  )

  /**
   * Translation
   */
  const chatCompletionTranslation = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a professional translator from ${sourceLanguage} to ${targetLanguage}`,
      },
      {
        role: "user",
        content: `The text is the explanation of what have changed to fix ${sourceLanguage} grammars. Please translate this 'SOURCE TEXT' to ${targetLanguage}. Do not change the ${sourceLanguage} phrase, sentence and words wraps with "". Please keep the bullet point format style.
        -----------------
        'SOURCE TEXT': ${text}`,
      },
    ],
    temperature: 0.2,
  })

  let translatedText =
    chatCompletionTranslation.data.choices[0].message?.content || ""

  /**
   * Customized post processing
   */
  if (translatedText.startsWith(`'번역된 텍스트':`)) {
    translatedText = translatedText.replace(`'번역된 텍스트':`, "")
  }
  console.log("[Translation] ==== END ====")
  return NextResponse.json({
    translatedText,
  })
}
