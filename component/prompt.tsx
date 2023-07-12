"use client"
import { useState, useCallback } from "react"
import { Button, TextField } from "@mui/material"
import axios, { AxiosResponse } from "axios"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import {
  UserPromptResultOption,
  UserPromptType,
  UserPromptInputLanguage,
  UserPromptOutputLanguage,
} from "@/common/type"

export default function Prompt() {
  const [userPrompt, setUserPrompt] = useState("")
  const [answerResult, setAnswerResult] = useState("")
  const [answerExplanation, setAnswerExplanation] = useState("")

  console.log({ userPrompt })

  const handlePrompt = useCallback(async (userPrompt: string) => {
    // submit
    const res = await axios.post<
      any,
      AxiosResponse<GPTResponse>,
      GPTRequestBody
    >("http://localhost:3000/api/gpt", {
      userPrompt,
      userPromptType: UserPromptType.MESSAGE,
      userPromptResultOption: UserPromptResultOption.ANSWER_AND_EXPLANATION,
      userPromptInputLanguage: UserPromptInputLanguage.ENGLISH,
      userPromptOutputLanguage: UserPromptOutputLanguage.KOREAN,
    })
    // console.log(res)
    setAnswerResult(res.data.answerResult)
    setAnswerExplanation(res.data.answerExplanation)
  }, [])

  return (
    <div>
      {/* 이메일 / 메세지 / 대화 / 학술 */}
      <div className="container">
        <TextField
          // type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          multiline
          rows={5}
          fullWidth
        />
      </div>
      <Button onClick={() => handlePrompt(userPrompt)}>Submit</Button>

      <h1>ANSWER RESULT</h1>
      <div>{answerResult}</div>
      <h1>ANSWER EXPLANATION</h1>
      <div className="whitespace-pre-wrap">{answerExplanation}</div>
    </div>
  )
}
