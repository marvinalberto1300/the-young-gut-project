(function () {
  "use strict";

  function getUniqueRequiredRadioNames(container) {
    var radios = Array.prototype.slice.call(container.querySelectorAll(":scope > fieldset input[type='radio'][name]"));
    var seen = {};
    var names = [];

    for (var i = 0; i < radios.length; i += 1) {
      var name = radios[i].name;
      if (name && !seen[name]) {
        seen[name] = true;
        names.push(name);
      }
    }

    return names;
  }

  function isFormStepComplete(form) {
    if (!form || form.tagName !== "FORM") {
      return true;
    }

    var requiredRadioNames = getUniqueRequiredRadioNames(form);
    if (!requiredRadioNames.length) {
      return true;
    }

    for (var i = 0; i < requiredRadioNames.length; i += 1) {
      if (!form.querySelector("input[name='" + requiredRadioNames[i] + "']:checked")) {
        return false;
      }
    }

    return true;
  }

  function createButton(text, type, className) {
    var button = document.createElement("button");
    button.type = type || "button";
    button.className = className;
    button.textContent = text;
    return button;
  }

  function initFieldsetFlow(form) {
    var fieldsets = Array.prototype.slice.call(form.querySelectorAll(":scope > fieldset"));
    if (fieldsets.length < 2) {
      return;
    }

    var current = 0;
    var controls = document.createElement("div");
    controls.className = "learning-flow-fieldset-controls";

    var indicator = document.createElement("p");
    indicator.className = "learning-flow-fieldset-indicator";
    indicator.setAttribute("aria-live", "polite");

    var prev = createButton("Previous", "button", "button-link secondary");
    var next = createButton("Next", "button", "button-link");

    function renderFieldset(index) {
      current = index;
      for (var i = 0; i < fieldsets.length; i += 1) {
        var isActive = i === current;
        fieldsets[i].classList.toggle("learning-flow-fieldset-hidden", !isActive);
        fieldsets[i].setAttribute("aria-hidden", String(!isActive));
      }

      prev.disabled = current === 0;
      next.disabled = current === fieldsets.length - 1;
      indicator.textContent = "Question " + (current + 1) + " of " + fieldsets.length;
    }

    prev.addEventListener("click", function () {
      if (current > 0) {
        renderFieldset(current - 1);
      }
    });

    next.addEventListener("click", function () {
      if (current < fieldsets.length - 1) {
        renderFieldset(current + 1);
      }
    });

    controls.appendChild(indicator);
    controls.appendChild(prev);
    controls.appendChild(next);

    var insertBeforeEl = form.querySelector(":scope > .quiz-controls") || form.querySelector(":scope > .action-links");
    if (insertBeforeEl) {
      form.insertBefore(controls, insertBeforeEl);
    } else {
      form.appendChild(controls);
    }

    renderFieldset(0);
  }

  function initMainFlow(main) {
    var steps = Array.prototype.slice
      .call(main.children)
      .filter(function (el) {
        return el.tagName === "SECTION" || el.tagName === "FORM";
      });

    var host = main;
    if (steps.length < 2) {
      var nestedHost = main.querySelector(".watch-gate");
      if (!nestedHost) {
        return null;
      }

      steps = Array.prototype.slice
        .call(nestedHost.children)
        .filter(function (el) {
          return (
            el.tagName === "SECTION" ||
            el.tagName === "ARTICLE" ||
            el.classList.contains("action-links") ||
            el.classList.contains("helper-text")
          );
        });

      if (steps.length < 2) {
        return null;
      }
      host = nestedHost;
    }

    var current = 0;

    var controls = document.createElement("nav");
    controls.className = "learning-flow-controls";
    controls.setAttribute("aria-label", "Section navigation");

    var indicator = document.createElement("p");
    indicator.className = "learning-flow-indicator";
    indicator.setAttribute("aria-live", "polite");

    var prev = createButton("Previous Section", "button", "button-link secondary");
    var next = createButton("Next Section", "button", "button-link");

    function updateNextState() {
      var currentStep = steps[current];
      var lockedByIncompleteForm = currentStep && currentStep.tagName === "FORM" && !isFormStepComplete(currentStep);
      next.disabled = current === steps.length - 1 || lockedByIncompleteForm;
    }

    function setStep(index) {
      current = index;
      for (var i = 0; i < steps.length; i += 1) {
        var isActive = i === current;
        steps[i].classList.toggle("learning-flow-step-hidden", !isActive);
        steps[i].setAttribute("aria-hidden", String(!isActive));
      }

      indicator.textContent = "Section " + (current + 1) + " of " + steps.length;
      prev.disabled = current === 0;
      updateNextState();
      next.textContent = current === steps.length - 1 ? "Last Section" : "Next Section";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function goToElement(element) {
      if (!element) {
        return false;
      }

      for (var i = 0; i < steps.length; i += 1) {
        if (steps[i] === element || steps[i].contains(element)) {
          setStep(i);
          return true;
        }
      }

      return false;
    }

    prev.addEventListener("click", function () {
      if (current > 0) {
        setStep(current - 1);
      }
    });

    next.addEventListener("click", function () {
      if (current < steps.length - 1) {
        setStep(current + 1);
      }
    });

    controls.appendChild(indicator);
    controls.appendChild(prev);
    controls.appendChild(next);
    host.appendChild(controls);

    for (var j = 0; j < steps.length; j += 1) {
      if (steps[j].tagName === "FORM") {
        steps[j].addEventListener("change", updateNextState);
        steps[j].addEventListener("input", updateNextState);
      }
    }

    setStep(0);

    return {
      goToElement: goToElement
    };
  }

  function initModuleInteractionHooks(flow) {
    if (!flow) {
      return;
    }

    var scoreBtn = document.getElementById("score-quiz");
    if (scoreBtn) {
      scoreBtn.addEventListener("click", function () {
        var scoreForm = scoreBtn.closest("form");
        if (scoreForm && !isFormStepComplete(scoreForm)) {
          return;
        }

        setTimeout(function () {
          flow.goToElement(document.getElementById("quiz-results"));
        }, 50);
      });
    }

    var quizForm = document.getElementById("learning-quiz");
    if (quizForm) {
      quizForm.addEventListener("submit", function () {
        setTimeout(function () {
          flow.goToElement(document.getElementById("quiz-feedback"));
        }, 50);
      });
    }

    var cert = document.getElementById("completion-certificate");
    if (cert) {
      var observer = new MutationObserver(function () {
        if (!cert.hidden) {
          flow.goToElement(cert);
        }
      });

      observer.observe(cert, {
        attributes: true,
        attributeFilter: ["hidden"]
      });
    }
  }

  function init() {
    var main = document.getElementById("main-content");
    if (!main) {
      return;
    }

    var forms = Array.prototype.slice.call(main.querySelectorAll("form"));
    for (var i = 0; i < forms.length; i += 1) {
      initFieldsetFlow(forms[i]);
    }

    var flow = initMainFlow(main);
    initModuleInteractionHooks(flow);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();