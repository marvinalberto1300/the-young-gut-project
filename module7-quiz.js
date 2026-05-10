(function () {
  var TOTAL_QUESTIONS = 10;
  var PASSING_SCORE = 8;

  var ANSWER_KEY = {
    q1: "a",
    q2: "c",
    q3: "b",
    q4: "a",
    q5: "a",
    q6: "a",
    q7: "a",
    q8: "b",
    q9: "c",
    q10: "c"
  };

  var QUESTION_TEXT = {
    q1: "Q1: Trend in under-50 diagnoses",
    q2: "Q2: Recommended screening age",
    q3: "Q3: Growth that often starts CRC",
    q4: "Q4: Processed meat classification",
    q5: "Q5: Fiber and risk",
    q6: "Q6: Physical activity and risk",
    q7: "Q7: Warning signs",
    q8: "Q8: Meaning of risk factors",
    q9: "Q9: Modifiable factor",
    q10: "Q10: Purpose of Module 4 questionnaire"
  };

  function getSelectedValue(name) {
    var selected = document.querySelector('input[name="' + name + '"]:checked');
    return selected ? selected.value : "";
  }

  function getAllResponses() {
    var responses = {};
    Object.keys(ANSWER_KEY).forEach(function (questionId) {
      responses[questionId] = getSelectedValue(questionId);
    });
    return responses;
  }

  function getMissingQuestions(responses) {
    return Object.keys(responses).filter(function (questionId) {
      return !responses[questionId];
    });
  }

  function gradeQuiz(responses) {
    var score = 0;
    var missed = [];

    Object.keys(ANSWER_KEY).forEach(function (questionId) {
      if (responses[questionId] === ANSWER_KEY[questionId]) {
        score += 1;
      } else {
        missed.push(QUESTION_TEXT[questionId]);
      }
    });

    return {
      score: score,
      passed: score >= PASSING_SCORE,
      missed: missed
    };
  }

  function renderMissedList(missedQuestions) {
    if (!missedQuestions.length) {
      return "";
    }

    var listItems = missedQuestions
      .map(function (questionText) {
        return "<li>" + questionText + "</li>";
      })
      .join("");

    return "<p>Review these questions before retrying:</p><ul>" + listItems + "</ul>";
  }

  function updateFeedback(result, missingQuestions, statusEl, scoreEl, summaryEl, missedEl) {
    if (missingQuestions.length) {
      statusEl.textContent =
        "Please answer all 10 questions before submitting. Missing: " + missingQuestions.length + ".";
      scoreEl.textContent = "";
      summaryEl.textContent = "";
      missedEl.innerHTML = "";
      return;
    }

    scoreEl.textContent = "Score: " + result.score + " / " + TOTAL_QUESTIONS;

    if (result.passed) {
      statusEl.textContent = "Pass";
      summaryEl.textContent =
        "Great work. You passed the Check on Learning quiz and earned a Certificate of Completion.";
      missedEl.innerHTML = "";
      return;
    }

    statusEl.textContent = "Not yet passing";
    summaryEl.textContent =
      "You need at least " + PASSING_SCORE +
      " correct answers to pass. Review the modules and retry the quiz.";
    missedEl.innerHTML = renderMissedList(result.missed);
  }

  function updateCertificate(result, learnerName, certificateSection, nameEl, dateEl) {
    if (!result.passed) {
      certificateSection.hidden = true;
      return;
    }

    var completionDate = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    nameEl.textContent = learnerName || "Learner";
    dateEl.textContent = "Date of Completion: " + completionDate;
    certificateSection.hidden = false;
  }

  function updateNavigationVisibility(result, navigationEl) {
    if (!navigationEl) return;
    
    if (result.passed) {
      navigationEl.style.display = "block";
    } else {
      navigationEl.style.display = "none";
    }
  }

  function clearQuiz(form, feedbackEl, scoreEl, summaryEl, missedEl, certificateSection, statusEl, navigationEl) {
    form.reset();
    feedbackEl.scrollIntoView({ behavior: "smooth", block: "start" });
    statusEl.textContent = "Submit the quiz to see your score.";
    scoreEl.textContent = "";
    summaryEl.textContent = "";
    missedEl.innerHTML = "";
    certificateSection.hidden = true;
    if (navigationEl) navigationEl.style.display = "none";
  }

  function initQuiz() {
    var form = document.getElementById("learning-quiz");
    var statusEl = document.getElementById("quiz-status");
    var scoreEl = document.getElementById("quiz-score");
    var summaryEl = document.getElementById("quiz-summary");
    var missedEl = document.getElementById("quiz-missed");
    var feedbackEl = document.getElementById("quiz-feedback");
    var retryButton = document.getElementById("retry-quiz");
    var navigationEl = document.getElementById("quiz-navigation");

    var learnerNameInput = document.getElementById("learner-name");
    var certificateSection = document.getElementById("completion-certificate");
    var certificateName = document.getElementById("certificate-name");
    var certificateDate = document.getElementById("certificate-date");
    var printButton = document.getElementById("print-certificate");

    if (!form || !statusEl || !scoreEl || !summaryEl || !missedEl || !feedbackEl) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var responses = getAllResponses();
      var missingQuestions = getMissingQuestions(responses);
      var result = gradeQuiz(responses);
      var learnerName = learnerNameInput ? learnerNameInput.value.trim() : "";

      updateFeedback(result, missingQuestions, statusEl, scoreEl, summaryEl, missedEl);
      updateNavigationVisibility(result, navigationEl);

      if (!missingQuestions.length && certificateSection && certificateName && certificateDate) {
        updateCertificate(result, learnerName, certificateSection, certificateName, certificateDate);
      }

      feedbackEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (retryButton && certificateSection) {
      retryButton.addEventListener("click", function () {
        clearQuiz(form, feedbackEl, scoreEl, summaryEl, missedEl, certificateSection, statusEl, navigationEl);
      });
    }

    if (printButton) {
      printButton.addEventListener("click", function () {
        window.print();
      });
    }

    // Update certificate name as user types
    if (learnerNameInput && certificateName) {
      learnerNameInput.addEventListener("input", function () {
        certificateName.textContent = learnerNameInput.value.trim() || "Learner";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initQuiz);
  } else {
    initQuiz();
  }
})();
