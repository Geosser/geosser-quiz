const quiz = {
  1: {
    question: 'What does CPU stand for in computer hardware?',
    correctAnswer: 'Central Processing Unit',
    wrongAnswers: [
      'Computer Personal Unit',
      'Central Processor Unit',
      'Central Process Unit'
    ]
  },
  2: {
    question: 'What does NPU stand for in computer hardware?',
    correctAnswer: 'Neural Processing Unit',
    wrongAnswers: [
      'Neural Personal Unit',
      'Neural Processor Unit',
      'Neural Process Unit'
    ]
  },
  3: {
    question: 'What does RAM stand for in computer hardware?',
    correctAnswer: 'Random Access Memory',
    wrongAnswers: [
      'Random Accessory Memory',
      'Random Actual Memory',
      'Rate At Minutes'
    ]
  }
};

const totalQuizes = Object.keys(quiz).length;
let score = 0;
let intervalIds = {};
let timeLeft = 30;

function generateQuiz(questionNumber) {
  const percentProgress = (questionNumber / totalQuizes) * 100;

  quizHTML = `
    <div class="quiz-header">
      <div class="status">
        <div class="score js-score">
          Score: ${score}/${totalQuizes}
        </div>
        <div class="count-down">
          Time Remaining: <span class="js-count-down">30</span>s
        </div>
      </div>

      <div class="progress">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width:${percentProgress}%"></div>
          <div class="quiz-progress">
          ${questionNumber} of ${totalQuizes} Questions
        </div>
        </div>
      </div>
    </div>

    <div class="question-container">
      <div class="quiz-info">
        <p>Category: Science & Technology</p>
        <p>|</p>
        <p>Difficulty: Easy</p>
      </div>

      <div class="question-number">
        Question ${questionNumber} of ${Object.keys(quiz).length}:
      </div>

      <div class="js-question-body">
        ${generateQuestion(questionNumber)}
      </div>
    </div>
  `;

  document.querySelector('.js-quiz-container')
    .innerHTML = quizHTML;

  const nextButton = document.querySelector('.js-next-button');
  nextButton.disabled = true;

  if (Number(nextButton.dataset.nextQuestionNumber) === totalQuizes + 1) {
    nextButton.innerHTML = 'Finish';
  }

  nextButton.addEventListener('click', () => {
    const nextQuestionNumber = Number(nextButton.dataset.nextQuestionNumber);
    if (nextQuestionNumber <= totalQuizes) {
      generateQuiz(nextQuestionNumber);
    } else {
      generateScoreSummary();
    }
  });

  const answerButtons = document.querySelectorAll('.js-answer-button');

  answerButtons.forEach(button => {
      button.addEventListener('click', () => {
        nextButton.disabled = false;
        answerButtons.forEach(button => {
          button.classList.remove('correct-answer', 'wrong-answer')
          button.disabled = true;
        });

        value = button.dataset.answer;

        if (value === quiz[questionNumber].correctAnswer) {
          button.classList.add('correct-answer');
          score ++;
          updateScore();
          clearInterval(intervalIds[questionNumber]);
          timeLeft = 30;
        } else {
          button.classList.add('wrong-answer');
          clearInterval(intervalIds[questionNumber]);
          timeLeft = 30;
          answerButtons.forEach(button => {
            if (button.dataset.answer === quiz[questionNumber].correctAnswer) {
              setTimeout(() => {
                button.classList.add('correct-answer-hint');
              }, 2000);
            }
          });
        }
      })
    });

  setTimer();

  function autoAnswer() {
    answerButtons.forEach(button => {
      button.disabled = true;
      if (button.dataset.answer === quiz[questionNumber].correctAnswer) {
        button.classList.add('correct-answer-hint');
      }
    });

    nextButton.disabled = false;
  }

  function setTimer() {
    if (intervalIds[questionNumber]) {
      clearInterval(intervalIds[questionNumber]);
    }

    intervalIds[questionNumber] = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft -= 1;
        document.querySelector('.js-count-down')
          .innerHTML = timeLeft;
      } else {
        clearInterval(intervalIds[questionNumber]);
        timeLeft = 30;
        autoAnswer();
      }
    }, 1000);
  }
}

generateQuiz(1);

function generateScoreSummary() {
  scoreSummaryHTML = `
    <div class="score-summary-container">
      <h1>Congratulations</h1>
      <h2>You scored ${score} out of ${totalQuizes}</h2>
      <button class="button-primary js-play-again-button">Play again</button>
    </div>
  `;

  document.querySelector('.js-quiz-container')
    .innerHTML = scoreSummaryHTML;

  document.querySelector('.js-play-again-button')
    .addEventListener('click', () => {
      generateQuiz(1);
      score = 0;
      updateScore();
    });
}

function updateScore() {
  document.querySelector('.js-score')
    .innerHTML = `Score: ${score}/${totalQuizes}`;
}

function generateQuestion(questionNumber) {
  const quizQuestion = quiz[questionNumber];

  const answers = [];
  answers.push(quizQuestion.correctAnswer);
  for (let i = 0; i < quizQuestion.wrongAnswers.length; i++) {
    answers.push(quizQuestion.wrongAnswers[i]);
  }

  shuffle(answers);

  const questionHTML = `
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
    const randomIndex = Math.floor(Math.random() * (array.length));
    [array[randomIndex], array[i]] = [array[i], array[randomIndex]];
  }

  return array;
}
