(() => {

  const SUPPORTED_LANGUAGES = ["en", "es", "pt", "de", "fr"];
  const DEFAULT_LANGUAGE = "en";
  const HISTORY_PREVIEW_COUNT = 3;

  const state = {
    pending: [],
    redeemed: [],
    current: null,
    language: DEFAULT_LANGUAGE,
  };

  const STORAGE_KEY = "pogo-code-helper-state";
  const storage = {
    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw);
        if (
          !parsed ||
          !Array.isArray(parsed.pending) ||
          !Array.isArray(parsed.redeemed)
        ) {
          return null;
        }

        const current =
          typeof parsed.current === "string" ? parsed.current : null;
        const rawLanguage = typeof parsed.language === "string" ? parsed.language : DEFAULT_LANGUAGE;
        const language = SUPPORTED_LANGUAGES.includes(rawLanguage) ? rawLanguage : DEFAULT_LANGUAGE;

        return {
          pending: parsed.pending,
          redeemed: parsed.redeemed,
          current,
          language,
        };
      } catch (error) {
        console.warn("Unable to load stored giveaway session.", error);
        return null;
      }
    },
    save(snapshot) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(snapshot),
        );
      } catch (error) {
        console.warn("Unable to persist giveaway session.", error);
      }
    },
  };

  const persistState = () => {
    storage.save({
      pending: state.pending,
      redeemed: state.redeemed,
      current: state.current,
      language: state.language,
    });
  };

  const syncTextareaWithPending = () => {
    elements.codeInput.value = state.pending.join("\n");
  };

  const elements = {
    codeInput: document.getElementById("codeInput"),
    loadButton: document.getElementById("loadButton"),
    resetButton: document.getElementById("resetButton"),
    languageSelect: document.getElementById("languageSelect"),
    printButton: document.getElementById("printButton"),
    nextButton: document.getElementById("nextButton"),
    markRedeemedButton: document.getElementById("markRedeemedButton"),
    currentCodeContainer: document.getElementById("currentCodeContainer"),
    currentCodeValue: document.getElementById("currentCodeValue"),
    redeemLink: document.getElementById("redeemLink"),
    qrCanvas: document.getElementById("qrCanvas"),
    statusMessage: document.getElementById("statusMessage"),
    pendingCount: document.getElementById("pendingCount"),
    redeemedCount: document.getElementById("redeemedCount"),
    redeemedList: document.getElementById("redeemedList"),
    noCodesMessage: document.getElementById("noCodesMessage"),
    noHistoryMessage: document.getElementById("noHistoryMessage"),
    historyToggleButton: document.getElementById("historyToggleButton"),
  };

  let qrCodeInstance = null;
  let historyExpanded = false;

  const buildRedeemUrl = (code) => {
    const lang = SUPPORTED_LANGUAGES.includes(state.language) ? state.language : DEFAULT_LANGUAGE;
    return `https://store.pokemongo.com/${lang}/offer-redemption?passcode=${encodeURIComponent(code)}`;
  };

  const clearQr = () => {
    if (qrCodeInstance) {
      elements.qrCanvas.innerHTML = "";
      qrCodeInstance = null;
    }
  };

  const renderQr = (text) => {
    elements.qrCanvas.innerHTML = "";
    qrCodeInstance = new QRCode(elements.qrCanvas, {
      text,
      width: 220,
      height: 220,
      colorDark: "#0f172a",
      colorLight: "#e2e8f0",
      correctLevel: QRCode.CorrectLevel.H,
    });
  };

  const parseCodes = (rawInput) => rawInput
    .split(/[\s,;]+/)
    .map((code) => code.trim())
    .filter(Boolean);

  const setStatus = (message = "", type = "") => {
    elements.statusMessage.textContent = message;
    elements.statusMessage.dataset.type = type;
  };

  const updateRedeemedList = () => {
    elements.redeemedList.innerHTML = "";

    if (state.redeemed.length === 0) {
      elements.noHistoryMessage.hidden = false;
      elements.historyToggleButton.hidden = true;
      historyExpanded = false;
      return;
    }

    elements.noHistoryMessage.hidden = true;

    const hasMoreThanPreview = state.redeemed.length > HISTORY_PREVIEW_COUNT;
    if (!hasMoreThanPreview) {
      historyExpanded = false;
    }

    const codesToShow = historyExpanded
      ? state.redeemed
      : state.redeemed.slice(0, HISTORY_PREVIEW_COUNT);

    codesToShow.forEach((code) => {
      const listItem = document.createElement("li");
      listItem.textContent = code;
      elements.redeemedList.appendChild(listItem);
    });

    elements.historyToggleButton.hidden = !hasMoreThanPreview;
    if (hasMoreThanPreview) {
      elements.historyToggleButton.textContent = historyExpanded
        ? "Hide full history"
        : `Show all (${state.redeemed.length})`;
    }
  };

  const updateCurrentCode = () => {
    if (!state.current) {
      elements.currentCodeContainer.classList.remove("active");
      clearQr();
      elements.noCodesMessage.hidden = state.pending.length !== 0;
      return;
    }

    const url = buildRedeemUrl(state.current);
    elements.currentCodeValue.textContent = state.current;
    elements.redeemLink.href = url;
    elements.redeemLink.textContent = url;

    renderQr(url);

    elements.currentCodeContainer.classList.add("active");
    elements.noCodesMessage.hidden = true;
  };

  const updateCounts = () => {
    elements.pendingCount.textContent = `Available codes: ${state.pending.length}`;
    elements.redeemedCount.textContent = `Redeemed codes: ${state.redeemed.length}`;
  };

  const updateButtons = () => {
    const hasCodes = state.pending.length > 0;
    elements.nextButton.disabled = !hasCodes || Boolean(state.current);
    elements.markRedeemedButton.disabled = !state.current;
  };

  const updateUI = () => {
    elements.languageSelect.value = state.language;
    updateCounts();
    updateRedeemedList();
    updateCurrentCode();
    updateButtons();
  };

  const loadCodes = () => {
    const input = elements.codeInput.value.trim();
    const codes = parseCodes(input);

    if (codes.length === 0) {
      setStatus("Paste at least one code to get started.", "error");
      return;
    }

    state.pending = codes;
    state.redeemed = [];
    state.current = null;

    setStatus(`Loaded ${codes.length} code${codes.length === 1 ? "" : "s"}. Ready when you are!`, "success");
    persistState();
    syncTextareaWithPending();
    updateUI();
  };

  const giveNextCode = () => {
    if (state.current || state.pending.length === 0) {
      return;
    }

    [state.current] = state.pending;
    setStatus("Share this code with the next trainer.", "success");
    persistState();
    updateUI();
  };

  const markRedeemed = () => {
    if (!state.current) {
      return;
    }

    const [redeemedCode] = state.pending;
    state.pending = state.pending.slice(1);
    state.redeemed.unshift(redeemedCode);
    state.current = null;

    setStatus("Marked as redeemed. You can hand out the next code.", "success");
    persistState();
    syncTextareaWithPending();
    updateUI();
  };

  const resetSession = () => {
    state.pending = [];
    state.redeemed = [];
    state.current = null;

    setStatus("Session reset. Load a new batch of codes whenever you're ready.", "info");
    persistState();
    syncTextareaWithPending();
    updateUI();
  };

  const init = () => {
    elements.loadButton.addEventListener("click", loadCodes);
    elements.resetButton.addEventListener("click", resetSession);
    elements.printButton.addEventListener("click", () => {
      persistState();
      window.open("print.html", "_blank", "noopener");
    });
    elements.languageSelect.addEventListener("change", (event) => {
      const selected = event.target.value;
      state.language = SUPPORTED_LANGUAGES.includes(selected) ? selected : DEFAULT_LANGUAGE;
      persistState();
      updateUI();
    });
    elements.nextButton.addEventListener("click", giveNextCode);
        elements.markRedeemedButton.addEventListener("click", markRedeemed);
        elements.historyToggleButton.addEventListener("click", () => {
          historyExpanded = !historyExpanded;
          updateRedeemedList();
        });

    elements.codeInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        loadCodes();
      }
    });

    elements.noCodesMessage.hidden = true;
    elements.noHistoryMessage.hidden = false;

    const restoredState = storage.load();
    if (restoredState) {
      state.pending = restoredState.pending;
      state.redeemed = restoredState.redeemed;
      state.current = restoredState.current;
      state.language = restoredState.language;
      setStatus("Session restored. Ready to continue.", "info");
      syncTextareaWithPending();
    } else {
      setStatus("Paste your codes to begin.", "info");
      syncTextareaWithPending();
    }
    elements.languageSelect.value = state.language;

    updateUI();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
