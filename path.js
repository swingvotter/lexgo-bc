
const path = require("path");

module.exports = {
    // MODELS
    models: {
        admin: {
            case: path.join(__dirname, "models", "admin", "adminCase.Model"),
        },
        lecturer: {
            caseQuiz: path.join(__dirname, "models", "lecturer", "caseQuiz.Model"),
            courseMaterial: path.join(__dirname, "models", "lecturer", "courseMaterial"),
            course: path.join(__dirname, "models", "lecturer", "courses.Model"),
            case: path.join(__dirname, "models", "lecturer", "lecturerCase.Model"),
            quizQuestion: path.join(__dirname, "models", "lecturer", "quizQuestions"),
            quiz: path.join(__dirname, "models", "lecturer", "quizes"),
            resource: path.join(__dirname, "models", "lecturer", "resource"),
            resourceContent: path.join(__dirname, "models", "lecturer", "resourceContent"),
            subLecturer: path.join(__dirname, "models", "lecturer", "subLecturer"),
        },
        users: {
            aiHistory: path.join(__dirname, "models", "users", "aiHitory.model"),
            caseQuizSubmission: path.join(__dirname, "models", "users", "caseQuizSubmission.Model"),
            enrollment: path.join(__dirname, "models", "users", "enrollment.Model"),
            lecturerQuizSubmission: path.join(__dirname, "models", "users", "lecturerQuizSubmission.Model"),
            note: path.join(__dirname, "models", "users", "noteModel"),
            quiz: path.join(__dirname, "models", "users", "quiz.Model"),
            user: path.join(__dirname, "models", "users", "user.Model"),
        },
    },

    // UTILS
    utils: {
        cloudinaryUploader: path.join(__dirname, "utils", "CloudinaryBufferUploader"),
        checkCourseAccess: path.join(__dirname, "utils", "checkCourseAccess"),
        cloudinaryUrlSigner: path.join(__dirname, "utils", "cloudinaryUrlSigner"),
        hashing: path.join(__dirname, "utils", "hashing"),
        mailSender: path.join(__dirname, "utils", "mailSender"),
        newLineRemover: path.join(__dirname, "utils", "newLineRemover"),
        otpGenerator: path.join(__dirname, "utils", "otpGenerator"),
        pagination: path.join(__dirname, "utils", "pagination"),
        rateLimiter: path.join(__dirname, "utils", "rateLimiter"),
        streakUtils: path.join(__dirname, "utils", "streakUtils"),
        textExtractor: path.join(__dirname, "utils", "textExtractor"),
        token: path.join(__dirname, "utils", "token"),
        cachingData: path.join(__dirname, "utils", "cachingData"),
        ai: {
            chatGpt: path.join(__dirname, "utils", "ai", "chatGpt"),
            courseCreator: path.join(__dirname, "utils", "ai", "coureCreatorGpt"),
            lecturerQuizGenerator: path.join(__dirname, "utils", "ai", "lecturerQuizGenerator"),
            quizGenerator: path.join(__dirname, "utils", "ai", "quizGenerator"),
        },
    },

    // MIDDLEWARE
    middleware: {
        admin: path.join(__dirname, "middleware", "adminMiddleware"),
        auth: path.join(__dirname, "middleware", "authMiddleware"),
        geoIp: path.join(__dirname, "middleware", "geoIpMiddleware"),
        lecturer: path.join(__dirname, "middleware", "lecturerMiddleware"),
        multer: path.join(__dirname, "middleware", "multerMiddleware"),
    },

    // QUEUES
    queues: {
        caseQuiz: path.join(__dirname, "queues", "caseQuizQueue"),
        courseMaterial: path.join(__dirname, "queues", "courseMaterialQueue"),
        lecturerQuiz: path.join(__dirname, "queues", "lecturerQuizQueue"),
        quiz: path.join(__dirname, "queues", "quizQueue"),
    },

    // VALIDATORS
    validators: {
        admin: {
            createCase: path.join(__dirname, "validators", "caseValidators", "createCaseValidator"),
            createManyCases: path.join(__dirname, "validators", "caseValidators", "createManyCasesValidator"),
            updateCase: path.join(__dirname, "validators", "caseValidators", "updateCaseValidator"),
        },
        lecturer: {
            createCourse: path.join(__dirname, "validators", "lecturer", "createCourseSchema"),
        },
        user: {
            register: path.join(__dirname, "validators", "userValidators", "registerUser"),
        },
    },
    config: {
        redis: path.join(__dirname, "config", "redis"),
        db: path.join(__dirname, "config", "db"),
        cloudinary: path.join(__dirname, "config", "cloudinary"),
    }
};
