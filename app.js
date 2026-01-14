require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");

const AuthRouter = require("./routes/authRoutes");
const AdminRouter = require("./routes/admin.Routes");
const AiRouter = require("./routes/Ai.Routes");
const noteRouter = require("./routes/noteRoutes");
const caseRouter = require("./routes/caseRoutes");
const userRouter = require("./routes/user.routes");
const courseRouter = require("./routes/course.route");
const enrollmentRouter = require("./routes/enrollment.routes");
const lecturerCaseRouter = require("./routes/lecturerCase.routes");
const lecturerQuizRouter = require("./routes/lecturerQuiz.routes");
const studentQuizRouter = require("./routes/studentQuiz.routes");

app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000);
  next();
});


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy - required for Render, Heroku, etc.
app.set("trust proxy", 1);

//ROUTES START HERE
app.use("/api/Auth", AuthRouter);
app.use("/api/Ai", AiRouter);
app.use("/api/Admin", AdminRouter);
app.use("/api/Notes", noteRouter);
app.use("/api/Cases", caseRouter);
app.use("/api/User", userRouter);
app.use("/api/Courses", courseRouter);
app.use("/api/Enrollments", enrollmentRouter);
app.use("/api/LecturerCases", lecturerCaseRouter);
app.use("/api/LecturerQuiz", lecturerQuizRouter);
app.use("/api/StudentQuiz", studentQuizRouter);



app.get("/test", authMiddleware, (req, res) => {
  res.send("hello world");
});

module.exports = app;
