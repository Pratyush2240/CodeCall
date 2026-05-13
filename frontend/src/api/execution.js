import API from "./axios";

/**
 * Execute code snippet
 * @param {string} source_code
 * @param {string} language
 * @param {string} [stdin=""]
 */
export const executeCode = async (source_code, language, stdin = "") => {
  const { data } = await API.post("/execute", { source_code, language, stdin });
  return data;
};

/**
 * Get list of supported languages
 */
export const getSupportedLanguages = async () => {
  const { data } = await API.get("/execute/languages");
  return data.languages;
};
