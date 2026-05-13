import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

/** Judge0 language IDs */
const LANG_MAP = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  java: 62,        // Java (OpenJDK 13)
  cpp: 54,         // C++ (GCC 9.2)
};

const SUPPORTED_LANGS = Object.keys(LANG_MAP);

/**
 * Submit code to Judge0 and poll until completion.
 * Returns { stdout, stderr, compile_output, status, time, memory }.
 */
async function executeCode(source_code, language, stdin = "") {
  if (!LANG_MAP[language]) {
    throw new Error(`Unsupported language: ${language}. Supported: ${SUPPORTED_LANGS.join(", ")}`);
  }

  // 1. Submit
  const { data: submission } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    {
      source_code,
      language_id: LANG_MAP[language],
      stdin,
    },
    { headers: { "Content-Type": "application/json" }, timeout: 10000 }
  );

  const token = submission.token;
  if (!token) throw new Error("Judge0 did not return a submission token");

  // 2. Poll for result (max 30s, 1.5s interval)
  const MAX_POLLS = 20;
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, 1500));

    const { data: result } = await axios.get(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
      { timeout: 10000 }
    );

    // status.id: 1=In Queue, 2=Processing, 3+=Done
    if (result.status && result.status.id >= 3) {
      return {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compile_output: result.compile_output || "",
        status: result.status,
        time: result.time,
        memory: result.memory,
      };
    }
  }

  throw new Error("Execution timed out — Judge0 did not return a result in time");
}

export { executeCode, SUPPORTED_LANGS, LANG_MAP };
