
const path = require("path");

module.exports = {
    // MODELS (Unversioned - Single source of truth for database schema)
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

    // ERROR HELPERS
    error: {
        appError: path.join(__dirname, "error", "appError"),
    },

    // SERVICES
    services: {
        v1: {
            auth: {
                user: path.join(__dirname, "services", "v1", "auth", "user.service"),
                register: path.join(__dirname, "services", "v1", "auth", "register.service"),
                login: path.join(__dirname, "services", "v1", "auth", "login.service"),
                token: path.join(__dirname, "services", "v1", "auth", "token.service"),
                logout: path.join(__dirname, "services", "v1", "auth", "logout.service"),
                sendOtp: path.join(__dirname, "services", "v1", "auth", "sendOtp.service"),
                verifyOtp: path.join(__dirname, "services", "v1", "auth", "verifyOtp.service"),
                resetPassword: path.join(__dirname, "services", "v1", "auth", "resetPassword.service"),
            },
        },
        v2: {}
    },

    // UTILS
    utils: {
        cloudinaryUploader: path.join(__dirname, "utils", "CloudinaryBufferUploader"),
        checkCourseAccess: path.join(__dirname, "utils", "checkCourseAccess"),
        cloudinaryUrlSigner: path.join(__dirname, "utils", "cloudinaryUrlSigner"),
        hashing: path.join(__dirname, "utils", "hashing"),
        asyncHandler: path.join(__dirname, "utils", "asyncHandler"),
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
            chatGptStream: path.join(__dirname, "utils", "ai", "chatGpt"),
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
        globalError: path.join(__dirname, "middleware", "globalError"),
    },

    // QUEUES
    queues: {
        v1: {
            caseQuiz: path.join(__dirname, "queues", "v1", "caseQuizQueue"),
            courseMaterial: path.join(__dirname, "queues", "v1", "courseMaterialQueue"),
            lecturerQuiz: path.join(__dirname, "queues", "v1", "lecturerQuizQueue"),
            quiz: path.join(__dirname, "queues", "v1", "quizQueue"),
        },
        v2: {},
    },

    // VALIDATORS
    validators: {
        v1: {
            admin: {
                createCase: path.join(__dirname, "validators", "v1", "caseValidators", "createCaseValidator"),
                createManyCases: path.join(__dirname, "validators", "v1", "caseValidators", "createManyCasesValidator"),
                updateCase: path.join(__dirname, "validators", "v1", "caseValidators", "updateCaseValidator"),
            },
            lecturer: {
                createCourse: path.join(__dirname, "validators", "v1", "lecturer", "createCourseSchema"),
            },
            user: {
                register: path.join(__dirname, "validators", "v1", "userValidators", "registerUser"),
            },
        },
        v2: {
            admin: {},
            lecturer: {},
            user: {},
        },
    },

    // WORKERS
    workers: {
        v1: {
            caseQuiz: path.join(__dirname, "workers", "v1", "caseQuizWorker"),
            courseMaterial: path.join(__dirname, "workers", "v1", "courseMaterialWorker"),
            lecturerQuiz: path.join(__dirname, "workers", "v1", "lecturerQuizWorker"),
            quiz: path.join(__dirname, "workers", "v1", "quizWorker"),
        },
        v2: {},
    },
    config: {
        redis: path.join(__dirname, "config", "redis"),
        db: path.join(__dirname, "config", "db"),
        cloudinary: path.join(__dirname, "config", "cloudinary"),
        logger: path.join(__dirname, "config", "logger"),
    }
};
