"use client"
import { useState, useCallback } from "react"
import {
  Button,
  FormControl,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material"
import axios, { AxiosResponse } from "axios"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import {
  UserPromptResultOption,
  UserPromptType,
  UserPromptInputLanguage,
  UserPromptOutputLanguage,
} from "@/common/type"
import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"
import { KR, GB } from "country-flag-icons/react/3x2"

type PromptForm = {
  userPrompt: string
  userPromptType: UserPromptType
  userPromptResultOption: boolean // UserPromptResultOption
  userPromptInputLanguage: UserPromptInputLanguage
  userPromptOutputLanguage: UserPromptOutputLanguage
}

export default function Prompt() {
  const { register, control, handleSubmit, watch, formState } =
    useForm<PromptForm>({
      defaultValues: {
        userPrompt: "",
        // userPromptType: false,
        userPromptResultOption: true,
        userPromptInputLanguage: UserPromptInputLanguage.ENGLISH,
        userPromptOutputLanguage: UserPromptOutputLanguage.ENGLISH,
      },
    })

  console.log({ formState })

  const [answerResult, setAnswerResult] = useState("")
  const [answerExplanation, setAnswerExplanation] = useState("")

  const handlePrompt = useCallback(async (data: PromptForm) => {
    // submit
    const res = await axios.post<
      any,
      AxiosResponse<GPTResponse>,
      GPTRequestBody
    >("/api/gpt", {
      userPrompt: data.userPrompt,
      userPromptType: UserPromptType.MESSAGE,
      userPromptResultOption: data.userPromptResultOption
        ? UserPromptResultOption.ANSWER_AND_EXPLANATION
        : UserPromptResultOption.ANSWER_ONLY,
      userPromptInputLanguage: UserPromptInputLanguage.ENGLISH,
      userPromptOutputLanguage: data.userPromptOutputLanguage,
    })
    console.log(res)
    setAnswerResult(res.data.answerResult)
    setAnswerExplanation(res.data.answerExplanation)
  }, [])

  return (
    <>
      <form onSubmit={handleSubmit(handlePrompt)}>
        <div className="container mx-10 m-auto">
          <TextField multiline rows={5} fullWidth {...register("userPrompt")} />
        </div>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography>교정만</Typography>
          <Switch
            defaultChecked
            color="default"
            {...register("userPromptResultOption")}
          />
          <Typography>교정+설명</Typography>
          {watch().userPromptResultOption ? (
            <TextField
              select
              // fullWidth
              // label="Select"
              defaultValue={UserPromptInputLanguage.ENGLISH}
              inputProps={register("userPromptOutputLanguage")}
              size="small"
              // error={errors.currency}
              // helperText={errors.currency?.message}
            >
              <MenuItem value={UserPromptOutputLanguage.ENGLISH}>
                <span className="flex justify-center gap-1">
                  <GB className="w-4" /> English
                </span>
              </MenuItem>
              <MenuItem value={UserPromptOutputLanguage.KOREAN}>
                <span className="flex justify-center gap-1">
                  <KR className="w-4" /> 한국어
                </span>
              </MenuItem>
            </TextField>
          ) : (
            <></>
          )}

          {/* <FormControl sx={{ p: 0, minWidth: 120 }} size="small">
            <Select label="" {...register("userPromptOutputLanguage")}>
              <MenuItem value={UserPromptOutputLanguage.ENGLISH}>
                <span className="flex justify-center gap-1">
                  <GB className="w-4" /> English
                </span>
              </MenuItem>
              <MenuItem value={UserPromptOutputLanguage.userPromptResultOptionKOREAN}>
                <span className="flex justify-center gap-1">
                  <KR className="w-4" /> 한국어
                </span>
              </MenuItem>
            </Select>
          </FormControl> */}
        </Stack>
        {/* <Button onClick={() => handlePrompt(userPrompt)}>Submit</Button> */}
        {/* <Button type="submit">SUBMIT</Button> */}
        <button
          type="submit"
          className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Submit
        </button>

        <h1 className="m-2 text-1xl font-extrabold text-gray-900 dark:text-white md:text-2xl lg:text-3xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
            교정 결과
          </span>
        </h1>
        <div>{answerResult}</div>
        <h1 className="m-2 text-1xl font-extrabold text-gray-900 dark:text-white md:text-2xl lg:text-3xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
            교정 설명
          </span>
        </h1>
        <div className="whitespace-pre-wrap">{answerExplanation}</div>
      </form>
      <DevTool control={control} placement="top-right" />
    </>
  )
}
