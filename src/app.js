const express = require("express");
const app = express();
const path = require("./path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authMiddleware = require(path.middleware.auth);
const cors = require("cors");
const compression = require('compression');
const globalErrorHandler = require(path.middleware.globalError);

const AuthRouter = require("./routes/v1/auth.routes");
const AdminRouter = require("./routes/v1/admin.routes");
const AiRouter = require("./routes/v1/ai.routes");
const noteRouter = require("./routes/v1/note.routes");
const caseRouter = require("./routes/v1/case.routes");
const userRouter = require("./routes/v1/user.routes");
const courseRouter = require("./routes/v1/course.routes");
const enrollmentRouter = require("./routes/v1/enrollment.routes");
const lecturerCaseRouter = require("./routes/v1/lecturer_case.routes");
const lecturerQuizRouter = require("./routes/v1/lecturer_quiz.routes");
const studentQuizRouter = require("./routes/v1/student_quiz.routes");
const studentCaseRouter = require("./routes/v1/student_case.routes");
const subLecturerRouter = require("./routes/v1/subLecturer.routes");
const healthRouter = require("./routes/v1/health.routes");


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(helmet());



// Limit JSON payload to 1MB
app.use(express.json({ limit: "200kb" }));

// Limit URL-encoded payloads to 1MB
app.use(express.urlencoded({ limit: "200kb", extended: true }));

// Compress all responses
app.use(compression());

app.use(cookieParser());


// Trust proxy - required for Render, Heroku, etc.
app.set("trust proxy", 1);

//ROUTES START HERE
app.use("/api/v1/Auth", AuthRouter);
app.use("/api/v1/Ai", AiRouter);
app.use("/api/v1/Admin", AdminRouter);
app.use("/api/v1/Notes", noteRouter);
app.use("/api/v1/Cases", caseRouter);
app.use("/api/v1/User", userRouter);
app.use("/api/v1/Courses", courseRouter);
app.use("/api/v1/Enrollments", enrollmentRouter);
app.use("/api/v1/LecturerCases", lecturerCaseRouter);
app.use("/api/v1/LecturerQuiz", lecturerQuizRouter);
app.use("/api/v1/StudentQuiz", studentQuizRouter);
app.use("/api/v1/StudentCases", studentCaseRouter);
app.use("/api/v1/SubLecturer", subLecturerRouter);
app.use("/api/v1/Health", healthRouter);
app.use(globalErrorHandler);



app.get("/test", authMiddleware, (req, res) => {
  res.send("hello world");
});


module.exports = app;
