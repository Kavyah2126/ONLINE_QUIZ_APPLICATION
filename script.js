
"use strict";

// =====================================
// QUIZ SETTINGS
// =====================================

const QUIZ_DURATION = 10 * 60; // 10 minutes

const questions = [
    {
        question: "Which language is used to structure a web page?",
        options: ["CSS", "HTML", "JavaScript", "Python"],
        answer: 1
    },
    {
        question: "Which language is used to style a web page?",
        options: ["HTML", "Java", "CSS", "C"],
        answer: 2
    },
    {
        question: "Which keyword declares a variable that cannot be reassigned?",
        options: ["var", "let", "const", "static"],
        answer: 2
    },
    {
        question: "Which method prints a message to the browser console?",
        options: ["print()", "console.log()", "display()", "echo()"],
        answer: 1
    },
    {
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<href>", "<a>", "<url>"],
        answer: 2
    },
    {
        question: "Which CSS property changes text color?",
        options: ["font-style", "text-size", "color", "background"],
        answer: 2
    },
    {
        question: "Which symbol starts a single-line JavaScript comment?",
        options: ["<!--", "//", "**", "##"],
        answer: 1
    },
    {
        question: "Which array method removes the last element?",
        options: ["push()", "shift()", "pop()", "unshift()"],
        answer: 2
    },
    {
        question: "Which HTML tag displays an image?",
        options: ["<image>", "<picture-src>", "<img>", "<src>"],
        answer: 2
    },
    {
        question: "Which CSS layout system is designed for rows and columns?",
        options: ["CSS Grid", "HTML Forms", "JavaScript DOM", "SQL"],
        answer: 0
    }
];

// =====================================
// VARIABLES
// =====================================

let currentQuestion = 0;
let answers = Array(questions.length).fill(null);
let remainingTime = QUIZ_DURATION;
let timerInterval = null;
let submitted = false;
let student = "";
let sessionKey = "";

// =====================================
// HTML ELEMENTS
// =====================================

const loginPage = document.getElementById("loginPage");
const instructionsPage = document.getElementById("instructionsPage");
const quizPage = document.getElementById("quizPage");
const resultPage = document.getElementById("resultPage");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const captchaText = document.getElementById("captchaText");
const captchaInput = document.getElementById("captchaInput");

const timerElement = document.getElementById("timer");
const questionText = document.getElementById("questionText");
const optionsArea = document.getElementById("optionsArea");
const questionPalette = document.getElementById("questionPalette");

// =====================================
// PAGE NAVIGATION
// =====================================

function showPage(page) {
    [loginPage, instructionsPage, quizPage, resultPage]
        .forEach(function(section) {
            section.classList.add("hidden");
        });

    page.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =====================================
// CAPTCHA
// =====================================

let captchaAnswer = "";

function generateCaptcha() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    captchaAnswer = "";

    for (let i = 0; i < 5; i++) {
        captchaAnswer += characters[
            Math.floor(Math.random() * characters.length)
        ];
    }

    captchaText.textContent = captchaAnswer;
    captchaInput.value = "";
}

generateCaptcha();

document.getElementById("refreshCaptcha")
    .addEventListener("click", generateCaptcha);

// =====================================
// LOGIN
// Demo credentials: STUDENT / 12345
// =====================================

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("studentId")
        .value.trim();

    const password = document.getElementById("password")
        .value;

    const captcha = captchaInput.value.trim();

    if (id.toUpperCase() !== "STUDENT" || password !== "12345") {
        loginMessage.textContent =
            "Invalid Student ID or password.";

        generateCaptcha();
        return;
    }

    if (captcha.toUpperCase() !== captchaAnswer) {
        loginMessage.textContent =
            "Incorrect CAPTCHA. Please try again.";

        generateCaptcha();
        return;
    }

    student = id.toUpperCase();

    // Storage key for this demo student.
    sessionKey = "onlineQuiz_" + student;

    document.getElementById("welcomeName").textContent = student;
    document.getElementById("studentName").textContent =
        "Student ID: " + student;

    loginMessage.textContent = "";

    showPage(instructionsPage);
});

// =====================================
// START QUIZ
// =====================================

document.getElementById("startQuiz")
    .addEventListener("click", function() {

        clearInterval(timerInterval);

        currentQuestion = 0;
        answers = Array(questions.length).fill(null);
        remainingTime = QUIZ_DURATION;
        submitted = false;

        // Start a fresh attempt.
        localStorage.removeItem(sessionKey);

        saveProgress();

        document.getElementById("resultHeading").textContent =
            "Quiz Submitted Successfully!";

        showPage(quizPage);
        renderQuestion();
        updateTimer();

        timerInterval = setInterval(function() {
            if (submitted) return;

            remainingTime--;

            updateTimer();
            saveProgress();

            if (remainingTime <= 0) {
                submitQuiz(true);
            }
        }, 1000);
    });

// =====================================
// AUTO-SAVE
// =====================================

function saveProgress() {
    if (!sessionKey || submitted) return;

    const progress = {
        student: student,
        answers: answers,
        currentQuestion: currentQuestion,
        remainingTime: remainingTime,
        submitted: false
    };

    try {
        localStorage.setItem(
            sessionKey,
            JSON.stringify(progress)
        );

        document.getElementById("saveStatus").textContent =
            "✓ Answer saved automatically";
    } catch (error) {
        document.getElementById("saveStatus").textContent =
            "Unable to save progress in this browser.";
    }
}

// =====================================
// RENDER QUESTION
// =====================================

function renderQuestion() {
    if (submitted) return;

    const q = questions[currentQuestion];

    document.getElementById("questionCount").textContent =
        "Question " + (currentQuestion + 1) +
        " of " + questions.length;

    questionText.textContent =
        (currentQuestion + 1) + ". " + q.question;

    optionsArea.innerHTML = "";

    q.options.forEach(function(option, index) {
        const label = document.createElement("label");
        label.className = "option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "quizOption";
        radio.value = index;
        radio.checked = answers[currentQuestion] === index;

        const text = document.createElement("span");
        text.textContent = option;

        if (radio.checked) {
            label.classList.add("selected");
        }

        radio.addEventListener("change", function() {
            if (submitted) return;

            answers[currentQuestion] = index;

            saveProgress();
            renderQuestion();
        });

        label.appendChild(radio);
        label.appendChild(text);
        optionsArea.appendChild(label);
    });

    document.getElementById("previousBtn").disabled =
        currentQuestion === 0;

    document.getElementById("nextBtn").disabled =
        currentQuestion === questions.length - 1;

    document.getElementById("answeredCount").textContent =
        "Answered: " +
        answers.filter(function(answer) {
            return answer !== null;
        }).length;

    document.getElementById("progressBar").style.width =
        ((currentQuestion + 1) / questions.length * 100) + "%";

    renderPalette();
}

// =====================================
// QUESTION PALETTE
// =====================================

function renderPalette() {
    questionPalette.innerHTML = "";

    questions.forEach(function(question, index) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = index + 1;

        if (answers[index] !== null) {
            button.classList.add("answered");
        }

        if (index === currentQuestion) {
            button.classList.add("current");
        }

        button.addEventListener("click", function() {
            if (submitted) return;

            currentQuestion = index;

            saveProgress();
            renderQuestion();
        });

        questionPalette.appendChild(button);
    });
}

// =====================================
// PREVIOUS AND NEXT
// =====================================

document.getElementById("previousBtn")
    .addEventListener("click", function() {

        if (currentQuestion > 0 && !submitted) {
            currentQuestion--;

            saveProgress();
            renderQuestion();
        }
    });

document.getElementById("nextBtn")
    .addEventListener("click", function() {

        if (currentQuestion < questions.length - 1 && !submitted) {
            currentQuestion++;

            saveProgress();
            renderQuestion();
        }
    });

// =====================================
// TIMER
// =====================================

function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    timerElement.classList.toggle(
        "warning",
        remainingTime <= 60
    );
}

// =====================================
// MANUAL SUBMISSION
// =====================================

document.getElementById("submitBtn")
    .addEventListener("click", function() {

        if (submitted) return;

        const unanswered = answers.filter(function(answer) {
            return answer === null;
        }).length;

        let message =
            "Are you sure you want to submit the quiz?";

        if (unanswered > 0) {
            message = "You have " + unanswered +
                " unanswered question(s). Submit anyway?";
        }

        if (confirm(message)) {
            submitQuiz(false);
        }
    });

// =====================================
// SUBMIT QUIZ AND CALCULATE SCORE
// =====================================

function submitQuiz(autoSubmitted) {
    if (submitted) return;

    submitted = true;

    clearInterval(timerInterval);

    const correct = questions.filter(function(question, index) {
        return answers[index] === question.answer;
    }).length;

    const unanswered = answers.filter(function(answer) {
        return answer === null;
    }).length;

    const wrong = questions.length - correct - unanswered;

    const percentage = Math.round(
        (correct / questions.length) * 100
    );

    // Save final submission status.
    try {
        localStorage.setItem(
            sessionKey,
            JSON.stringify({
                student: student,
                answers: answers,
                currentQuestion: currentQuestion,
                remainingTime: remainingTime,
                submitted: true,
                score: correct
            })
        );
    } catch (error) {
        console.warn("Could not save final result.", error);
    }

    document.getElementById("resultHeading").textContent =
        autoSubmitted
            ? "Time Over! Quiz Submitted Automatically"
            : "Quiz Submitted Successfully!";

    document.getElementById("resultStudent").textContent =
        "Student ID: " + student;

    document.getElementById("scoreText").textContent =
        correct + " / " + questions.length;

    document.getElementById("percentageText").textContent =
        percentage + "%";

    document.getElementById("correctText").textContent = correct;
    document.getElementById("wrongText").textContent = wrong;
    document.getElementById("unansweredText").textContent = unanswered;

    renderReview();

    showPage(resultPage);
}

// =====================================
// ANSWER REVIEW
// =====================================

function renderReview() {
    const reviewArea = document.getElementById("reviewArea");
    reviewArea.innerHTML = "";

    questions.forEach(function(question, index) {
        const item = document.createElement("div");
        const selectedAnswer = answers[index];

        if (selectedAnswer === question.answer) {
            item.className = "review-item review-correct";
        } else if (selectedAnswer === null) {
            item.className = "review-item review-unanswered";
        } else {
            item.className = "review-item review-wrong";
        }

        const title = document.createElement("strong");
        title.textContent =
            (index + 1) + ". " + question.question;

        const yourAnswer = document.createElement("p");
        yourAnswer.textContent =
            "Your answer: " +
            (selectedAnswer === null
                ? "Not answered"
                : question.options[selectedAnswer]);

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent =
            "Correct answer: " +
            question.options[question.answer];

        item.appendChild(title);
        item.appendChild(yourAnswer);
        item.appendChild(correctAnswer);

        reviewArea.appendChild(item);
    });
}

// =====================================
// BACK TO LOGIN
// =====================================

document.getElementById("restartBtn")
    .addEventListener("click", function() {

        clearInterval(timerInterval);

        student = "";
        sessionKey = "";

        loginForm.reset();
        loginMessage.textContent = "";

        generateCaptcha();
        showPage(loginPage);
    });
