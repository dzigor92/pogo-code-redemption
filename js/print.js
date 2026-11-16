(() => {
  const { loadSession, saveSession, buildRedeemUrl } = window.PogoCodes;

  const message = document.getElementById("message");
  const sheet = document.getElementById("sheet");
  const printAction = document.getElementById("printAction");
  const markAction = document.getElementById("markAction");
  let printedCodes = [];

  const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;

  const showMessage = (text) => {
    message.textContent = text;
    message.hidden = false;
  };

  const buildCard = (code, language) => {
    const card = document.createElement("article");
    card.className = "card";

    const qrContainer = document.createElement("div");
    card.appendChild(qrContainer);

    const codeText = document.createElement("div");
    codeText.className = "code-text";
    codeText.textContent = code;
    card.appendChild(codeText);

    // Level H: paper gets folded and stained, so the extra error correction is worth the density.
    new QRCode(qrContainer, {
      text: buildRedeemUrl(code, language),
      width: 160,
      height: 160,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    return card;
  };

  printAction.addEventListener("click", () => {
    window.print();
  });

  // Moves the printed codes to the redeemed list so the giveaway page stops offering them.
  markAction.addEventListener("click", () => {
    const count = printedCodes.length;
    if (!window.confirm(`Move ${plural(count, "printed code")} to the redeemed list? The giveaway page will stop offering ${count === 1 ? "it" : "them"}.`)) {
      return;
    }

    // Read the session again: some of these codes may have been redeemed since the sheet was built.
    const session = loadSession();
    const printed = new Set(printedCodes);
    const moved = session ? session.pending.filter((code) => printed.has(code)) : [];
    const saved = session && saveSession({
      ...session,
      pending: session.pending.filter((code) => !printed.has(code)),
      redeemed: [...moved].reverse().concat(session.redeemed),
      current: printed.has(session.current) ? null : session.current,
    });

    if (!saved) {
      showMessage("Could not update the saved session. Mark these codes as redeemed from the giveaway page instead.");
      return;
    }

    markAction.disabled = true;
    showMessage(`Done: ${plural(moved.length, "code")} moved to the redeemed list. The giveaway page will not offer ${moved.length === 1 ? "it" : "them"} again.`);
  });

  const init = () => {
    const session = loadSession();
    if (!session) {
      showMessage("No stored session detected. Go back, load your codes, and try again.");
      return;
    }

    if (session.pending.length === 0) {
      showMessage("All caught up! There are no pending codes to print right now.");
      return;
    }

    session.pending.forEach((code) => {
      sheet.appendChild(buildCard(code, session.language));
    });

    printedCodes = session.pending;
    markAction.hidden = false;

    showMessage(`Generated ${plural(printedCodes.length, "printable card")} for your pending codes (store language: ${session.language.toUpperCase()}, loaded from your saved session). These codes are still pending on the giveaway page: if you hand them out on paper, press “Mark all as handed out” so they are not offered again.`);
  };

  document.addEventListener("DOMContentLoaded", init);
})();
