export const getWordCount = (text: string): number => {
  if (!text) return 0
  const arr = text.split(" ")
  return arr.filter((word) => word !== "").length
}
