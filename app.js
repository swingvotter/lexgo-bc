const express = require("express");
const app = express();
const path = require("./path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authMiddleware = require(path.middleware.auth);
const cors = require("cors");
const compression = require('compression');

const AuthRouter = require("./routes/auth.routes");
const AdminRouter = require("./routes/admin.routes");
const AiRouter = require("./routes/ai.routes");
const noteRouter = require("./routes/note.routes");
const caseRouter = require("./routes/case.routes");
const userRouter = require("./routes/user.routes");
const courseRouter = require("./routes/course.routes");
const enrollmentRouter = require("./routes/enrollment.routes");
const lecturerCaseRouter = require("./routes/lecturer_case.routes");
const lecturerQuizRouter = require("./routes/lecturer_quiz.routes");
const studentQuizRouter = require("./routes/student_quiz.routes");
const studentCaseRouter = require("./routes/student_case.routes");
const subLecturerRouter = require("./routes/subLecturer.routes");


app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(helmet());


// Compress all responses
app.use(compression());

// Limit JSON payload to 1MB
app.use(express.json({ limit: "1mb" }));

// Limit URL-encoded payloads to 1MB
app.use(express.urlencoded({ limit: "1mb", extended: true }));

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
app.use("/api/StudentCases", studentCaseRouter);
app.use("/api/SubLecturer", subLecturerRouter);




app.get("/test", authMiddleware, (req, res) => {
  res.send("hello world");
});

module.exports = app;
