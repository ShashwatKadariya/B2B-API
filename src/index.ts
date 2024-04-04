import app from "./app";
import { config } from "./config";
import { logger } from "./utils";

const server = app.listen(config.PORT, () => {
  logger.info(`SERVER running on PORT: ${config.PORT}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received");
  logger.info("Shutting down the server");
  server.close((err) => {
    logger.info("Sever shut down");
    process.exit(err ? 1 : 0);
  });
});
