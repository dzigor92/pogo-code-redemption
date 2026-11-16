// Shared by index.html and print.html.
// A plain script rather than an ES module, so both pages also work when opened straight from disk.
window.PogoCodes = (() => {
  const STORAGE_KEY = "pogo-code-helper-state";
  const DEFAULT_LANGUAGE = "en";

  // Store languages offered in the dropdown, as [code, label]. Kept short on purpose.
  // store.pokemongo.com also serves: es-MX, pl, tr, ru, zh-Hant, id, th, hi.
  const LANGUAGES = [
    ["en", "English"],
    ["es", "Spanish"],
    ["pt-BR", "Portuguese"],
    ["de", "German"],
    ["fr", "French"],
    ["it", "Italian"],
    ["ja", "Japanese"],
    ["ko", "Korean"],
  ];

  // Codes saved by earlier versions of the app.
  const LANGUAGE_ALIASES = { pt: "pt-BR" };

  const normalizeLanguage = (value) => {
    const language = LANGUAGE_ALIASES[value] ?? value;
    return LANGUAGES.some(([code]) => code === language) ? language : DEFAULT_LANGUAGE;
  };

  const buildRedeemUrl = (code, language) =>
    `https://store.pokemongo.com/${normalizeLanguage(language)}/offer-redemption?passcode=${encodeURIComponent(code)}`;

  // Keeps the first occurrence of each code, dropping non-strings and anything in `exclude`.
  const uniqueCodes = (codes, exclude = []) => {
    const seen = new Set(exclude);
    return codes.filter((code) => {
      if (typeof code !== "string" || code === "" || seen.has(code)) {
        return false;
      }
      seen.add(code);
      return true;
    });
  };

  // Returns the saved session, or null when there is none.
  const loadSession = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (
        !parsed ||
        !Array.isArray(parsed.pending) ||
        !Array.isArray(parsed.redeemed)
      ) {
        return null;
      }

      // Sessions saved by older versions may hold repeated codes: never offer one twice.
      const redeemed = parsed.redeemed.filter((code) => typeof code === "string");
      const pending = uniqueCodes(parsed.pending, redeemed);

      return {
        pending,
        redeemed,
        current: pending.includes(parsed.current) ? parsed.current : null,
        language: normalizeLanguage(parsed.language),
      };
    } catch (error) {
      console.warn("Unable to load stored giveaway session.", error);
      return null;
    }
  };

  // Returns false when the browser refuses to store the session.
  const saveSession = ({ pending, redeemed, current, language }) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pending, redeemed, current, language }),
      );
      return true;
    } catch (error) {
      console.warn("Unable to persist giveaway session.", error);
      return false;
    }
  };

  return {
    STORAGE_KEY,
    DEFAULT_LANGUAGE,
    LANGUAGES,
    normalizeLanguage,
    buildRedeemUrl,
    uniqueCodes,
    loadSession,
    saveSession,
  };
})();
