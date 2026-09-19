/* let backupQuizQuestions = [
  {
    category: 'Computer Hardware',
    difficulty: 'Easy',
    question: 'What does CPU stand for in computer hardware?',
    correct_answer: 'Central Processing Unit',
    incorrect_answers: [
      'Computer Personal Unit',
      'Central Processor Unit',
      'Central Process Unit'
    ]
  },
  {
    category: 'Computer Hardware',
    difficulty: 'Easy',
    question: 'What does NPU stand for in computer hardware?',
    correct_answer: 'Neural Processing Unit',
    incorrect_answers: [
      'Neural Personal Unit',
      'Neural Processor Unit',
      'Neural Process Unit'
    ]
  },
  {
    category: 'Computer Hardware',
    difficulty: 'Easy',
    question: 'What does RAM stand for in computer hardware?',
    correct_answer: 'Random Access Memory',
    incorrect_answers: [
      'Random Accessory Memory',
      'Random Actual Memory',
      'Rate At Minutes'
    ]
  }
]; */

let quizQuestions = JSON.parse(localStorage.getItem('quizQuestions')) || [];

async function loadQuestions() {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
    const responseData = await response.json();

    if (!response.ok) {
      throw responseData;
    }

    quizQuestions = responseData.results;
    localStorage.setItem('quizQuestions', JSON.stringify(quizQuestions));
  } catch (error) {
    alert(`${error}`);
    loadQuiz();
  }
}

async function loadQuiz() {
  await loadQuestions();

  if (quizState.isFinished) {
    generateScoreSummary();
  } else {
    generateQuiz();
  }
}

const totalQuizes = quizQuestions.length;
let score = JSON.parse(localStorage.getItem('score')) || 0;
let highScore = JSON.parse(localStorage.getItem('highScore')) || 0;
let timeLeft = JSON.parse(localStorage.getItem('timeLeft')) ?? 15;
let intervalId = null;

let questionNumber = JSON.parse(localStorage.getItem('questionNumber')) || 0;

let questionState = JSON.parse(localStorage.getItem('questionState')) || {
  isAnswered: false,
  selectedAnswer: undefined,
  shuffledAnswers: null
};

let quizState = JSON.parse(localStorage.getItem('quizState')) || {
  isFinished: false,
};

if (quizQuestions.length === 0) {
  loadQuiz();
} else {
  if (quizState.isFinished) {
    generateScoreSummary();
  } else {
    generateQuiz();
  }
}

function saveState() {
  localStorage.setItem('score', JSON.stringify(score));
  localStorage.setItem('questionNumber', JSON.stringify(questionNumber));
  localStorage.setItem('questionState', JSON.stringify(questionState));
  localStorage.setItem('quizState', JSON.stringify(quizState));
  localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
}

function resetState() {
  localStorage.removeItem('questionState');
  localStorage.removeItem('timeLeft');

  questionState = {
    isAnswered: false,
    selectedAnswer: undefined,
    isAnswersShuffled: null
  }

  timeLeft = 15;
}

function resetGame() {
  localStorage.removeItem('score');
  localStorage.removeItem('questionNumber');
  localStorage.removeItem('questionState');
  localStorage.removeItem('quizState');
  localStorage.removeItem('quizQuestions');
  localStorage.removeItem('timeLeft');

  score = 0;
  questionNumber = 0;
  questionState = {
    isAnswered: false,
    selectedAnswer: undefined,
    shuffledAnswers: null
  };
  quizState = {
    isFinished: false
  };
  quizQuestions = [];
  timeLeft = 15;
}

function generateQuiz() {
  saveState();

  const percentProgress = ((questionNumber + 1) / totalQuizes) * 100;

  const quizHTML = `
    <div class="quiz-header">
      <div class="status">
        <div class="score js-score">
          Score: ${score}/${totalQuizes}
        </div>
        <div class="count-down">
          Time Remaining: <span class="js-count-down">${timeLeft}</span>s
        </div>
      </div>

      <div class="progress">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width:${percentProgress}%"></div>
          <div class="quiz-progress">
          ${questionNumber + 1} of ${totalQuizes} Questions
        </div>
        </div>
      </div>
    </div>

    <div class="question-container">
      <div class="js-question-body">
        ${generateQuestion()}
      </div>
    </div>
  `;

  document.querySelector('.js-quiz-container')
    .innerHTML = quizHTML;

  const nextButton = document.querySelector('.js-next-button');
  nextButton.disabled = true;

  if (Number(nextButton.dataset.nextQuestionNumber) + 1 > totalQuizes) {
    nextButton.innerHTML = 'Finish';
  }

  nextButton.addEventListener('click', () => {
    stopTimer();
    const nextQuestionNumber = Number(nextButton.dataset.nextQuestionNumber);
    if (nextQuestionNumber + 1 <= totalQuizes) {
      questionNumber = nextQuestionNumber;
      resetState();
      generateQuiz();
    } else {
      quizState.isFinished = true;
      saveState();
      generateScoreSummary();
    }
  });

  const answerButtons = document.querySelectorAll('.js-answer-button');

  const { isAnswered, selectedAnswer } = questionState;

  if (isAnswered) {
    stopTimer();
    nextButton.disabled = false;

    answerButtons.forEach(button => {
      button.disabled = true;
      if (selectedAnswer === button.dataset.answer) {
        if (selectedAnswer === quizQuestions[questionNumber].correct_answer) {
          button.classList.add('correct-answer');
        } else {
          button.classList.add('wrong-answer');
          revealCorrectAnswer(answerButtons);
        }
      } else if (selectedAnswer === null) {
        revealCorrectAnswer(answerButtons);
      }
    });
    
  } else {
    startTimer();
  }

  answerButtons.forEach(button => {
      button.addEventListener('click', () => {
        nextButton.disabled = false;
        answerButtons.forEach(button => {
          button.classList.remove('correct-answer', 'wrong-answer')
          button.disabled = true;
        });

        const value = button.dataset.answer;

        if (value === quizQuestions[questionNumber].correct_answer) {
          handleCorrectAnswer(button);

        } else {
          handleWrongAnswer(button, answerButtons);
        }
      })
    });
}

// generate score summary

function generateScoreSummary() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  const scoreSummaryHTML = `
    <div class="score-summary-container">
      <h1>Congratulations</h1>
      <h2>You scored ${score} out of ${totalQuizes} questions</h2>
      <h3>High score: ${highScore}</h3>
      <button class="button-primary js-play-again-button">Play again</button>
    </div>
  `;

  document.querySelector('.js-quiz-container')
    .innerHTML = scoreSummaryHTML;

  document.querySelector('.js-play-again-button')
    .addEventListener('click', () => {
      resetGame();
      loadQuiz();
    });
}

function updateScore() {
  const scoreElement = document.querySelector('.js-score');
  if (scoreElement) {
    scoreElement.innerHTML = `Score: ${score}/${totalQuizes}`;
  }
}

function revealCorrectAnswer(answerButtons) {
  answerButtons.forEach(button => {
    if (button.dataset.answer === quizQuestions[questionNumber].correct_answer) {
      button.classList.add('correct-answer-hint');
    }
  });
}

function handleCorrectAnswer(button) {
  stopTimer();
  const value = button.dataset.answer;

  button.classList.add('correct-answer');
  score ++;
  updateScore();
  questionState.isAnswered = true;
  questionState.selectedAnswer = value;
  saveState();
}

function handleWrongAnswer(button, answerButtons) {
  stopTimer();
  const value = button.dataset.answer;

  button.classList.add('wrong-answer');

  setTimeout(() => {
    revealCorrectAnswer(answerButtons);
  }, 1000);
  
  questionState.isAnswered = true;
  questionState.selectedAnswer = value;
  saveState();
}

function generateQuestion() {
  const quizQuestion = quizQuestions[questionNumber];

  if (!questionState.shuffledAnswers) {
    const answers = [];
    answers.push(quizQuestion.correct_answer);
    for (let i = 0; i < quizQuestion.incorrect_answers.length; i++) {
      answers.push(quizQuestion.incorrect_answers[i]);
    }

    questionState.shuffledAnswers = shuffle(answers);
    saveState();
  }

  const answers = questionState.shuffledAnswers;

  const questionHTML = `
    <div class="quiz-info">
      <p>Category: ${quizQuestion.category}</p>
      <p>|</p>
      <p>Difficulty: ${quizQuestion.difficulty}</p>
    </div>

    <div class="question-number">
      Question ${questionNumber + 1} of ${totalQuizes}:
    </div>

    <div class="question">
      ${quizQuestion.question}
    </div>

    <div class="answers">
      <button class="answer-button js-answer-button" data-answer="${answers[0]}"><span>(A)</span>${answers[0]}</button>

      <button class="answer-button js-answer-button" data-answer="${answers[1]}"><span>(B)</span>${answers[1]}</button>

      <button class="answer-button js-answer-button" data-answer="${answers[2]}"><span>(C)</span>${answers[2]}</button>

      <button class="answer-button js-answer-button" data-answer="${answers[3]}"><span>(D)</span>${answers[3]}</button>
    </div>

    <div class="nav-buttons">
      <button class="button-primary next-button js-next-button" data-next-question-number="${questionNumber + 1}">Next</button>
    </div>
  `;

  return questionHTML;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[randomIndex], array[i]] = [array[i], array[randomIndex]];
  }

  return array;
}

function startTimer() {
  stopTimer();
  updateTimer();

  intervalId = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function updateTimer() {
  const timerElement = document.querySelector('.js-count-down');
  if (timerElement) {
    timerElement.innerHTML = timeLeft;
  }
}

function handleTimeout() {
  const answerButtons = document.querySelectorAll('.js-answer-button');
  const nextButton = document.querySelector('.js-next-button');

  answerButtons.forEach(button => {
    button.disabled = true;
  });

  revealCorrectAnswer(answerButtons);
  nextButton.disabled = false;

  questionState.isAnswered = true;
  questionState.selectedAnswer = null;
  saveState();
}
