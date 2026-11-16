(() => {

  const {
    STORAGE_KEY,
    DEFAULT_LANGUAGE,
    LANGUAGES,
    normalizeLanguage,
    buildRedeemUrl,
    uniqueCodes,
    loadSession,
    saveSession,
  } = window.PogoCodes;

  // Drawn larger than displayed so it stays sharp on phone screens; CSS sets the visible size.
  const QR_RENDER_SIZE = 660;
  const REDEEM_LOCK_MS = 700;
  const HISTORY_PREVIEW_COUNT = 3;
  const HISTORY_QR_SIZE = 170;

  const state = {
    pending: [],
    redeemed: [],
    current: null,
    language: DEFAULT_LANGUAGE,
  };

  const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

  const persistState = () => saveSession(state);

  const syncTextareaWithPending = () => {
    elements.codeInput.value = state.pending.join("\n");
  };

  const elements = {
    setupPanel: document.getElementById("setupPanel"),
    codeInput: document.getElementById("codeInput"),
    loadButton: document.getElementById("loadButton"),
    resetButton: document.getElementById("resetButton"),
    languageSelect: document.getElementById("languageSelect"),
    printButton: document.getElementById("printButton"),
    nextButton: document.getElementById("nextButton"),
    redeemNextButton: document.getElementById("redeemNextButton"),
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
  let redeemLocked = false;
  let wakeLockRequest = null;
  let historyExpanded = false;

  const redeemUrl = (code) => buildRedeemUrl(code, state.language);

  const clearQr = () => {
    if (qrCodeInstance) {
      elements.qrCanvas.innerHTML = "";
      qrCodeInstance = null;
    }
  };

  const renderQrTo = (target, text, size) => {
    target.innerHTML = "";
    return new QRCode(target, {
      text,
      width: size,
      height: size,
      colorDark: "#0f172a",
      colorLight: "#e2e8f0",
      correctLevel: QRCode.CorrectLevel.M,
    });
  };

  const renderQr = (text) => {
    qrCodeInstance = renderQrTo(elements.qrCanvas, text, QR_RENDER_SIZE);
  };

  // Keeps the screen on while a code is displayed, where the browser supports it (HTTPS only).
  const syncWakeLock = () => {
    if (!("wakeLock" in navigator)) {
      return;
    }

    const wanted = Boolean(state.current) && document.visibilityState === "visible";
    if (wanted && !wakeLockRequest) {
      const request = navigator.wakeLock
        .request("screen")
        .then((sentinel) => {
          // The browser can drop the lock on its own (tab hidden, battery saver).
          sentinel.addEventListener("release", () => {
            if (wakeLockRequest === request) {
              wakeLockRequest = null;
            }
          });
          return sentinel;
        })
        .catch(() => null);
      wakeLockRequest = request;
    } else if (!wanted && wakeLockRequest) {
      const request = wakeLockRequest;
      wakeLockRequest = null;
      request.then((sentinel) => sentinel && sentinel.release()).catch(() => {});
    }
  };

  // Open while there is nothing to hand out; closed otherwise so the pending list stays off screen.
  const syncSetupPanel = () => {
    elements.setupPanel.open = state.pending.length === 0;
  };

  const parseCodes = (rawInput) => rawInput
    .split(/[\s,;]+/)
    .map((code) => code.trim())
    .filter(Boolean);

  const setStatus = (message = "", type = "") => {
    elements.statusMessage.textContent = message;
    elements.statusMessage.dataset.type = type;
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Link and QR are only built the first time an entry is opened.
  const fillHistoryPreview = (preview, code) => {
    const url = redeemUrl(code);
    const hint = document.createElement("div");
    const codeValue = document.createElement("div");
    const link = document.createElement("a");
    const qrWrapper = document.createElement("div");
    const qrSurface = document.createElement("div");

    hint.className = "history-preview-hint";
    hint.textContent = "Redeemed code preview. Scan again if the trainer needs it.";

    codeValue.className = "history-code-value";
    codeValue.textContent = code;

    link.className = "history-redeem-link";
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    link.rel = "noreferrer noopener";

    qrWrapper.className = "history-qr-wrapper";
    qrSurface.className = "history-qr-surface";
    qrWrapper.appendChild(qrSurface);
    renderQrTo(qrSurface, url, HISTORY_QR_SIZE);

    preview.append(hint, codeValue, link, qrWrapper);
  };

  const buildHistoryEntry = (code) => {
    const listItem = document.createElement("li");
    const entry = document.createElement("details");
    const summary = document.createElement("summary");
    const preview = document.createElement("div");

    entry.className = "history-entry";
    // Entries sharing a name close each other, so only one preview is open at a time.
    entry.setAttribute("name", "redeemed-code");
    summary.className = "history-item";
    summary.textContent = code;
    preview.className = "history-preview";

    // Runs before the browser opens the entry, so the preview is ready on its first frame.
    summary.addEventListener("click", () => {
      if (entry.open) {
        return;
      }
      if (preview.childElementCount === 0) {
        fillHistoryPreview(preview, code);
      }
      if (!prefersReducedMotion.matches) {
        preview.animate(
          [{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }],
          { duration: 200, easing: "ease" },
        );
      }
    });

    entry.append(summary, preview);
    listItem.appendChild(entry);
    return listItem;
  };

  // Only the latest codes are shown until the full history is requested.
  const syncHistoryVisibility = () => {
    Array.from(elements.redeemedList.children).forEach((item, index) => {
      item.hidden = !historyExpanded && index >= HISTORY_PREVIEW_COUNT;
    });
    elements.historyToggleButton.textContent = historyExpanded
      ? "Hide full history"
      : `Show all (${state.redeemed.length})`;
  };

  const updateRedeemedList = () => {
    const hasMoreThanPreview = state.redeemed.length > HISTORY_PREVIEW_COUNT;
    if (!hasMoreThanPreview) {
      historyExpanded = false;
    }

    elements.redeemedList.replaceChildren(...state.redeemed.map(buildHistoryEntry));
    elements.noHistoryMessage.hidden = state.redeemed.length > 0;
    elements.historyToggleButton.hidden = !hasMoreThanPreview;
    syncHistoryVisibility();
  };

  const updateCurrentCode = () => {
    if (!state.current) {
      elements.currentCodeContainer.classList.remove("active");
      clearQr();
      elements.noCodesMessage.hidden = state.pending.length !== 0;
      return;
    }

    const url = redeemUrl(state.current);
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
    const showing = Boolean(state.current);
    const hasNext = showing && state.pending.length > 1;

    elements.nextButton.hidden = showing;
    elements.nextButton.disabled = state.pending.length === 0;
    elements.redeemNextButton.hidden = !hasNext;
    elements.redeemNextButton.disabled = redeemLocked;
    elements.markRedeemedButton.disabled = !showing || redeemLocked;
    elements.markRedeemedButton.classList.toggle("secondary", hasNext);
  };

  const updateUI = () => {
    elements.languageSelect.value = state.language;
    updateCounts();
    updateRedeemedList();
    updateCurrentCode();
    updateButtons();
    syncWakeLock();
  };

  const loadCodes = () => {
    const codes = parseCodes(elements.codeInput.value);

    if (codes.length === 0) {
      setStatus("Paste at least one code to get started.", "error");
      return;
    }

    const unique = uniqueCodes(codes);
    const pending = uniqueCodes(unique, state.redeemed);
    const duplicateCount = codes.length - unique.length;
    const alreadyRedeemedCount = unique.length - pending.length;

    if (pending.length === 0) {
      setStatus("Nothing to load: every code in the list was already redeemed. Use “Reset session” to start over.", "error");
      return;
    }

    // The textarea mirrors the pending list, so pasting over it would silently drop codes.
    const kept = new Set(pending);
    const droppedCount = state.pending.filter((code) => !kept.has(code)).length;
    if (
      droppedCount > 0 &&
      !window.confirm(
        `${plural(droppedCount, "pending code")} from your current session ${droppedCount === 1 ? "is" : "are"} not in this list and will be removed.\n\n` +
        "Press Cancel to keep them, then paste the new codes below the existing ones.",
      )
    ) {
      setStatus("Load cancelled. Your pending codes are unchanged.", "info");
      return;
    }

    state.pending = pending;
    if (!kept.has(state.current)) {
      state.current = null;
    }

    const notes = [];
    if (duplicateCount > 0) {
      notes.push(`${plural(duplicateCount, "duplicate")} removed`);
    }
    if (alreadyRedeemedCount > 0) {
      notes.push(`${alreadyRedeemedCount} already redeemed and skipped`);
    }
    setStatus(
      `Loaded ${plural(pending.length, "code")}. ${notes.length > 0 ? `${notes.join(", ")}.` : "Ready when you are!"}`,
      "success",
    );
    persistState();
    syncTextareaWithPending();
    syncSetupPanel();
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

  const archiveCurrentCode = () => {
    const redeemedCode = state.current;
    state.pending = state.pending.filter((code) => code !== redeemedCode);
    state.redeemed.unshift(redeemedCode);
    state.current = null;
    return redeemedCode;
  };

  const markRedeemed = () => {
    if (!state.current || redeemLocked) {
      return;
    }

    archiveCurrentCode();
    setStatus("Marked as redeemed. You can hand out the next code.", "success");
    persistState();
    syncTextareaWithPending();
    if (state.pending.length === 0) {
      syncSetupPanel();
    }
    updateUI();
  };

  const redeemAndShowNext = () => {
    if (!state.current || redeemLocked || state.pending.length < 2) {
      return;
    }

    const redeemedCode = archiveCurrentCode();
    [state.current] = state.pending;

    // The button stays in place with a new code behind it: ignore an accidental double tap.
    redeemLocked = true;
    window.setTimeout(() => {
      redeemLocked = false;
      updateButtons();
    }, REDEEM_LOCK_MS);

    setStatus(`${redeemedCode} marked as redeemed. Showing the next code.`, "success");
    persistState();
    syncTextareaWithPending();
    updateUI();
  };

  const resetSession = () => {
    const hasCodes = state.pending.length > 0 || state.redeemed.length > 0;
    if (
      hasCodes &&
      !window.confirm(
        `Reset the session? This deletes ${plural(state.pending.length, "pending code")} and ${plural(state.redeemed.length, "redeemed code")}. It cannot be undone.`,
      )
    ) {
      return;
    }

    state.pending = [];
    state.redeemed = [];
    state.current = null;

    setStatus("Session reset. Load a new batch of codes whenever you're ready.", "info");
    persistState();
    syncTextareaWithPending();
    syncSetupPanel();
    updateUI();
  };

  const restoreState = () => {
    const stored = loadSession();
    state.pending = stored ? stored.pending : [];
    state.redeemed = stored ? stored.redeemed : [];
    state.current = stored ? stored.current : null;
    if (stored) {
      state.language = stored.language;
    }
    syncTextareaWithPending();
    syncSetupPanel();
    return Boolean(stored);
  };

  const init = () => {
    LANGUAGES.forEach(([code, label]) => {
      elements.languageSelect.add(new Option(label, code));
    });

    elements.loadButton.addEventListener("click", loadCodes);
    elements.resetButton.addEventListener("click", resetSession);
    elements.printButton.addEventListener("click", () => {
      persistState();
      window.open("print.html", "_blank", "noopener");
    });
    elements.languageSelect.addEventListener("change", (event) => {
      state.language = normalizeLanguage(event.target.value);
      persistState();
      updateUI();
    });
    elements.nextButton.addEventListener("click", giveNextCode);
    elements.redeemNextButton.addEventListener("click", redeemAndShowNext);
    elements.markRedeemedButton.addEventListener("click", markRedeemed);
    document.addEventListener("visibilitychange", syncWakeLock);
    elements.historyToggleButton.addEventListener("click", () => {
      historyExpanded = !historyExpanded;
      syncHistoryVisibility();
    });
    elements.codeInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        loadCodes();
      }
    });

    elements.noCodesMessage.hidden = true;
    elements.noHistoryMessage.hidden = false;

    // Another tab (a second copy of this page, or the printable sheet) changed the session.
    window.addEventListener("storage", (event) => {
      if (event.key !== null && event.key !== STORAGE_KEY) {
        return;
      }
      restoreState();
      setStatus("Session updated from another tab.", "info");
      updateUI();
    });

    setStatus(
      restoreState() ? "Session restored. Ready to continue." : "Paste your codes to begin.",
      "info",
    );
    updateUI();
  };

  document.addEventListener("DOMContentLoaded", init);
})();
