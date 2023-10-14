"use client"
import { useState, useCallback } from "react"
import {
  Stack,
  Switch,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Paper,
  ToggleButton,
  Tooltip,
  Container,
} from "@mui/material"
import axios, { AxiosResponse } from "axios"
import { GPTRequestBody, GPTResponse } from "@/common/type/api"
import {
  UserPromptLanguage,
  UserPromptResultOption,
  UserPromptType,
} from "@/common/type"
import { useForm } from "react-hook-form"
import { DevTool } from "@hookform/devtools"
import { KR, GB } from "country-flag-icons/react/3x2"
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued"
import CompareIcon from "@mui/icons-material/Compare"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { SnackbarProvider, enqueueSnackbar } from "notistack"

type PromptForm = {
  userPrompt: string
  userPromptType: UserPromptType
  userPromptResultOption: boolean // UserPromptResultOption
  userPromptExplanationLanguage: UserPromptLanguage
}

export default function Prompt() {
  const { register, control, handleSubmit, watch } = useForm<PromptForm>({
    defaultValues: {
      userPrompt: "",
      userPromptType: UserPromptType.MESSAGE,
      userPromptResultOption: true,
      userPromptExplanationLanguage: UserPromptLanguage.ENGLISH,
    },
  })

  const [finalUserPrompt, setFinalUserPrompt] = useState("")
  const [compareMode, setCompareMode] = useState(false)

  /**
   * Results
   */
  const [answerResult, setAnswerResult] = useState("")
  const [explanationResult, setExplanationResult] = useState("")

  /**
   * Loading
   */
  const [loading, setLoading] = useState(false)

  const handlePrompt = useCallback(async (data: PromptForm) => {
    setLoading(true)
    try {
      setFinalUserPrompt(data.userPrompt)
      const res = await axios.post<
        any,
        AxiosResponse<GPTResponse>,
        GPTRequestBody
      >("/api/gpt", {
        userPrompt: data.userPrompt,
        userPromptType: data.userPromptType,
        // result option switch
        userPromptResultOption: data.userPromptResultOption
          ? UserPromptResultOption.ANSWER_AND_EXPLANATION
          : UserPromptResultOption.ANSWER_ONLY,
        userPromptExplanationLanguage: data.userPromptExplanationLanguage,
      })
      console.log(res)
      setAnswerResult(res.data.answerResult)
      setExplanationResult(res.data.answerExplanation)
    } catch (err) {
      // TODO: complete error handling
      console.error(err)
      let errorMessage = "There was an error processing your request."
      if (err instanceof Error) {
        errorMessage = err.message
      }
      alert(`Error!: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="grid">
      <SnackbarProvider />
      {/**
       * SECTION 1. FORM == BEGIN ==
       */}
      <form onSubmit={handleSubmit(handlePrompt)}>
        <Stack spacing={2} alignItems="center">
          <Container style={{ maxWidth: "1200px" }}>
            <TextField
              multiline
              rows={5}
              fullWidth
              {...register("userPrompt")}
            />
          </Container>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>타입</Typography>
            <TextField
              select
              defaultValue={UserPromptType.MESSAGE}
              inputProps={register("userPromptType")}
              size="small"
            >
              <MenuItem value={UserPromptType.MESSAGE}>
                메시지 (Message)
              </MenuItem>
              <MenuItem value={UserPromptType.CONVERSATION}>
                대화 (Conversation)
              </MenuItem>
              {/* <MenuItem value={UserPromptType.EMAIL}>이메일</MenuItem> */}
            </TextField>
          </Stack>
          <Stack direction="row" spacing={0} alignItems="center">
            <Typography>교정만</Typography>
            <Switch
              defaultChecked
              color="default"
              {...register("userPromptResultOption")}
            />
            <div className="flex items-center gap-2">
              <Typography>교정+설명</Typography>
              {watch().userPromptResultOption ? (
                <TextField
                  select
                  // fullWidth
                  // label="Select"
                  defaultValue={UserPromptLanguage.ENGLISH}
                  inputProps={register("userPromptExplanationLanguage")}
                  size="small"
                  // error={errors.currency}
                  // helperText={errors.currency?.message}
                >
                  <MenuItem value={UserPromptLanguage.ENGLISH}>
                    <span className="flex justify-center gap-1">
                      <GB className="w-4" /> English
                    </span>
                  </MenuItem>
                  <MenuItem value={UserPromptLanguage.KOREAN}>
                    <span className="flex justify-center gap-1">
                      <KR className="w-4" /> 한국어
                    </span>
                  </MenuItem>
                </TextField>
              ) : (
                <></>
              )}
            </div>
          </Stack>

          <button
            type="submit"
            className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 cursor-pointer disabled:opacity-50"
            disabled={!watch().userPrompt}
          >
            GPT 도와줘!
          </button>
        </Stack>
      </form>
      {/**
       * SECTION 1. FORM == END ==
       */}

      {/**
       * SECTION 2. ANSWER == BEGIN ==
       */}
      <div className="m-10">
        {
          // Case 1. Loading
          loading ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : // Case 2. Result returned
          answerResult || explanationResult ? (
            <Stack spacing={3}>
              <Paper elevation={3} className="p-5">
                <div className="flex items-center gap-1">
                  <h1 className="m-2 text-1xl font-extrabold text-gray-900 dark:text-white md:text-xl lg:text-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                      교정 결과
                    </span>
                  </h1>
                  <Tooltip title="결과 복사">
                    <ToggleButton
                      value="check"
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(answerResult)
                        enqueueSnackbar("클립보드에 복사 되었습니다.", {
                          variant: "success",
                        })
                      }}
                    >
                      <ContentPasteIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip title="결과 비교">
                    <ToggleButton
                      value="check"
                      selected={compareMode}
                      onChange={() => {
                        setCompareMode(!compareMode)
                      }}
                      size="small"
                    >
                      <CompareIcon />
                    </ToggleButton>
                  </Tooltip>
                </div>
                {compareMode ? (
                  <ReactDiffViewer
                    newValue={answerResult}
                    oldValue={finalUserPrompt}
                    compareMethod={DiffMethod.WORDS}
                    splitView={false}
                    hideLineNumbers={true}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{answerResult}</div>
                )}
              </Paper>
              {explanationResult ? (
                <Paper elevation={3} className="p-5">
                  <h1 className="m-2 text-1xl font-extrabold text-gray-900 dark:text-white md:text-xl lg:text-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                      교정 설명
                    </span>
                  </h1>
                  <div className="whitespace-pre-wrap">{explanationResult}</div>
                </Paper>
              ) : (
                <></>
              )}
            </Stack>
          ) : (
            // Case 3. No result yet
            <></>
          )
        }
      </div>
      {/**
       * SECTION 2. ANSWER == END ==
       */}

      <DevTool control={control} placement="top-right" />
    </div>
  )
}
