import { exec } from "child_process";

export const executeJavaScript = (code) => {
  return new Promise((resolve, reject) => {
    const process = exec(
      `node -e "${code.replace(/"/g, '\\"')}"`,
      {
        timeout: 3000, // 3 seconds
        maxBuffer: 1024 * 50, // 50KB output
      },
      (error, stdout, stderr) => {
        if (error) {
          return resolve({
            success: false,
            output: stderr || error.message,
          });
        }

        resolve({
          success: true,
          output: stdout,
        });
      }
    );

    // Extra safety
    setTimeout(() => {
      process.kill("SIGKILL");
    }, 3500);
  });
};
