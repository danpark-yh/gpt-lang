import { UserPromptLanguage, UserPromptResultOption } from "@/common/type"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

/**
 * Please proof read below message by following the instructions.

----
Instructions:

1. Please start with "Edited message: " for proofread message
2. Explain why you made the change starting with "Edit explanation: " with bullet point format.
3. If you don't make any changes, please say "No need to change"
----

----
message:
""" Hi my name is Daniel Park, I want need to talk about my life espeically about my elementary school ages. Please listen to me carefully today!"""
----
 */
interface CustomRequest extends Request {
  json(): Promise<GPTRequestBody>
}
export async function POST(
  request: CustomRequest
): Promise<NextResponse<GPTResponse>> {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const body = await request.json()
  const {
    userPrompt,
    userPromptType,
    userPromptResultOption,
    userPromptExplanationLanguage,
  } = body

  console.log({ userPrompt })
  console.log({ userPromptType })
  console.log({ userPromptResultOption })
  console.log({ userPromptExplanationLanguage })

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

  // EARLY RETURN
  if (userPromptResultOption === UserPromptResultOption.ANSWER_ONLY) {
    return NextResponse.json({
      answerResult: gptResult.trim(),
      answerExplanation: "",
    })
  }

  let answerExplanation = ""
  const [answer, explanation] = gptResult.split("GPT LANG Explanation:")

  answerExplanation = explanation.trim()

  if (
    userPromptExplanationLanguage !== UserPromptLanguage.ENGLISH &&
    answerExplanation
  ) {
    console.log("TRANSLATION....")
    const chatCompletionTranslation = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator from English to ${userPromptExplanationLanguage}`,
        },
        {
          role: "user",
          content: `The text is the explanation of what have changed to fix English grammars. Please translate this text to ${userPromptExplanationLanguage}. Please keep the phrase, sentence and words wraps with "" in English. ----${answerExplanation}`,
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
