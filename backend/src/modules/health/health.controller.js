export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const readinessCheck = async (req, res) => {
  try {
    // Example future check
    // await db.query("SELECT 1");

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      error: error.message,
    });
  }
};