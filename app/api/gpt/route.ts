import { getWordCount } from "@/common/function/helper"
import { UserPromptResultOption } from "@/common/type"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import axios from "axios"
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
  const { userPrompt, userPromptType, userPromptResultOption } = body

  // console.log({ userPrompt })
  // console.log({ userPromptType })
  // console.log({ userPromptResultOption })
  // console.log({ userPromptExplanationLanguage })

  const openai = new OpenAIApi(configuration)

  console.log(
    `[GPT Proofread] ==== BEGIN ==== ${getWordCount(
      userPrompt
    )} words. / type: ${userPromptType} / resultOption: ${userPromptResultOption}`
  )

  const TEXT_REFERENCE = `'${userPromptType.toUpperCase()} TEXT'`
  const EDITED_MESSAGE = "Edited message:"
  const EDIT_EXPLANATION = "Edit explanation:"
  const NO_NEED_TO_CHANGE = "No need to change"

  let userChatMessage = `Please proofread below ${TEXT_REFERENCE}`

  /*********************************************
   * PROOFREAD TEXT (+ EXPLANATION)
   *********************************************/
  if (userPromptResultOption === UserPromptResultOption.ANSWER_ONLY) {
    userChatMessage += ` and return revised ${TEXT_REFERENCE} starting with "${EDITED_MESSAGE}"`
  } else if (
    userPromptResultOption === UserPromptResultOption.ANSWER_AND_EXPLANATION
  ) {
    userChatMessage += ` and explain why.
Please follow below instructions.
------------------------
1. Must return revised ${TEXT_REFERENCE} starting with "${EDITED_MESSAGE}" 
2. Explain why you made the change starting with "${EDIT_EXPLANATION}" with bullet point format.
3. If you don't make any changes at all, please say "${NO_NEED_TO_CHANGE}"`
  }

  userChatMessage += `\n------------------------\n${TEXT_REFERENCE}: ${userPrompt}`

  console.log({ userChatMessage })

  // GPT REQUEST
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional English proofreader.",
      },
      {
        role: "user",
        content: userChatMessage,
      },
    ],
    temperature: 0.2,
  })

  const gptResult = chatCompletion.data.choices[0].message?.content || ""

  console.log({ gptResult })

  /*********************************************************
   * EARLY RETURN = ANSWER ONLY = NO EXPLANATION
   *********************************************************/
  let answerResult = gptResult
  if (userPromptResultOption === UserPromptResultOption.ANSWER_ONLY) {
    // Remove EDITED_MESSAGE if exists
    if (gptResult.startsWith(EDITED_MESSAGE)) {
      answerResult = gptResult.replace(EDITED_MESSAGE, "")
    }

    /**
     * Send notification via Make
     */
    await axios.post(
      `https://hook.us1.make.com/lxgzb38fwkmthp53k5x7g8wyrt87tr6h`,
      {
        requestAt: new Date(),
        userPrompt,
        userPromptType,
        userPromptResultOption,
        answerResult,
        answerExplanation: "",
      }
    )

    return NextResponse.json({
      answerResult,
      answerExplanation: "", // nothing to explain
    })
  }

  let answerExplanation = ""

  if (gptResult.startsWith(EDITED_MESSAGE)) {
    answerResult = gptResult.replace(EDITED_MESSAGE, "")
  }

  if (answerResult.includes(EDIT_EXPLANATION)) {
    const [answer, explanation] = answerResult.split(EDIT_EXPLANATION)
    answerResult = answer.trim()
    answerExplanation = explanation.trim()
  }

  console.log(`[GPT Proofread] ==== END ====`)

  /**
   * Send notification via Make
   */
  await axios.post(
    `https://hook.us1.make.com/lxgzb38fwkmthp53k5x7g8wyrt87tr6h`,
    {
      requestAt: new Date(),
      userPrompt,
      userPromptType,
      userPromptResultOption,
      answerResult,
      answerExplanation,
    }
  )

  return NextResponse.json({
    answerResult,
    answerExplanation,
  })
}
