import express, { Application, Request, Response } from "express";
import { config } from "./config";
import { errorHandler, isAuthenticated } from "./middleware";
import { authRouter } from "./module/auth";
import cookieParser from "cookie-parser";
import { userRouter } from "./module/user";
import { roleRouter } from "./module/role";
import { verifyRole } from "./middleware/verifyRole.middleware";
const app: Application = express();

app.use(express.json());
app.use(cookieParser());

if (config.NODE_ENV === "production") {
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.use(isAuthenticated);
app.use("/api/v1/role", roleRouter);

app.get(
  "/isAuth",
  [isAuthenticated, verifyRole(["role:create", "user:role:create"])],
  (req: Request, res: Response) => {
    res.status(200).send("Authenticated");
  }
);

app.all("*", (req, res) => {
  res.status(404).send("LOOKS LIKE YOU ARE LOST");
});

app.use(errorHandler);
export default app;
