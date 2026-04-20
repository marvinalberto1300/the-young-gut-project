(function () {
  var STORAGE_KEY = "crc-home-checklist-v1";
  var TOTAL_TOPICS = 5;

  function getCompletedTopics() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveCompletedTopics(topics) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }

  function markTopicCompleted(topic) {
    var completed = getCompletedTopics();
    if (completed.indexOf(topic) === -1) {
      completed.push(topic);
      saveCompletedTopics(completed);
    }
  }

  function renderChecklist() {
    var completed = getCompletedTopics();
    var cards = document.querySelectorAll(".home-card[data-topic]");
    var completedCount = completed.length;

    cards.forEach(function (card) {
      var topic = card.getAttribute("data-topic");
      var isDone = completed.indexOf(topic) !== -1;
      card.classList.toggle("completed", isDone);
    });

    var countElement = document.getElementById("checklist-count");
    if (countElement) {
      countElement.textContent = String(completedCount);
    }

    var progressFill = document.getElementById("checklist-progress-fill");
    if (progressFill) {
      var percent = Math.min((completedCount / TOTAL_TOPICS) * 100, 100);
      progressFill.style.width = percent + "%";
    }

    var progressTrack = document.querySelector(".progress-track");
    if (progressTrack) {
      progressTrack.setAttribute("aria-valuenow", String(completedCount));
    }
  }

  function resetChecklist() {
    localStorage.removeItem(STORAGE_KEY);
    renderChecklist();
  }

  function initChecklist() {
    var links = document.querySelectorAll(".topic-link[data-topic]");
    var resetButton = document.getElementById("reset-checklist");

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var topic = link.getAttribute("data-topic");
        if (!topic) {
          return;
        }

        markTopicCompleted(topic);
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        resetChecklist();
      });
    }

    renderChecklist();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChecklist);
  } else {
    initChecklist();
  }
})();
