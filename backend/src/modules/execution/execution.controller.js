import { executeCode, SUPPORTED_LANGS } from "./execution.service.js";

/**
 * POST /api/execute
 * Body: { source_code, language, stdin? }
 * Returns execution result.
 */
export const runCode = async (req, res, next) => {
  try {
    const { source_code, language, stdin } = req.body;

    if (!source_code || !language) {
      return res.status(400).json({ message: "source_code and language are required" });
    }

    if (!SUPPORTED_LANGS.includes(language)) {
      return res.status(400).json({
        message: `Unsupported language. Supported: ${SUPPORTED_LANGS.join(", ")}`,
      });
    }

    const result = await executeCode(source_code, language, stdin || "");

    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr,
      compile_output: result.compile_output,
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (err) {
    console.error("[execution] Error:", err.message);
    res.status(500).json({ message: err.message || "Execution failed" });
  }
};

/**
 * GET /api/execute/languages
 * Returns list of supported languages.
 */
export const getLanguages = (req, res) => {
  res.json({ languages: SUPPORTED_LANGS });
};
