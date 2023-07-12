import { UserPromptOutputLanguage, UserPromptResultOption } from "@/common/type"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

interface CustomRequest extends Request {
  json(): Promise<GPTRequestBody>
}
export async function POST(
  request: CustomRequest
): Promise<NextResponse<GPTResponse>> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })

  //   console.log({ request })
  const body = await request.json()
  const {
    userPrompt,
    userPromptType,
    userPromptResultOption,
    userPromptInputLanguage,
    userPromptOutputLanguage,
  } = body

  console.log({ userPrompt })
  console.log({ userPromptType })
  console.log({ userPromptResultOption })
  console.log({ userPromptInputLanguage })
  console.log({ userPromptOutputLanguage })

  const openai = new OpenAIApi(configuration)

  let userChatMessage = `Please proofread for this ${userPromptType}`
  if (
    userPromptResultOption === UserPromptResultOption.ANSWER_AND_EXPLANATION
  ) {
    userChatMessage += ` and explain why. Please start the explanation of why you made change with 'GPT LANG Explanation:'`
  }

  userChatMessage += `------\n${userPrompt}`

  console.log({ userChatMessage })
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // model: "gpt-4",
    messages: [
      { role: "system", content: "You are a professional English expert." },
      {
        role: "user",
        content: userChatMessage,
      },
    ],
  })

  const gptResult = chatCompletion.data.choices[0].message?.content || ""
  let answerExplanation = ""
  const [answer, explanation] = gptResult.split("GPT LANG Explanation:")

  answerExplanation = explanation.trim()

  if (
    userPromptOutputLanguage !== UserPromptOutputLanguage.ENGLISH &&
    answerExplanation
  ) {
    console.log("TRANSLATION....")
    const chatCompletionTranslation = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator from English to ${userPromptOutputLanguage}`,
        },
        {
          role: "user",
          content: `The text is the explanation of what have changed to fix English grammars. Please translate this text to ${userPromptOutputLanguage}. Please keep the phrase, sentence and words wraps with "" in English. ----${answerExplanation}`,
        },
      ],
    })
    answerExplanation =
      chatCompletionTranslation.data.choices[0].message?.content || ""
  }

  console.log(answer.trim())
  console.log("====================")
  console.log(answerExplanation)
  return NextResponse.json({
    answerResult: answer.trim(),
    answerExplanation,
  })
}
