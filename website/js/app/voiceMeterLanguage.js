/**
 * The interface language: the stored choice, else the browser language when supported, else the fallback.
 */
class VoiceMeterLanguage {
    /**
     * @returns {string} one of LANGUAGES
     */
    static load() {
        let stored = null;
        try {
            stored = localStorage.getItem(VoiceMeterLanguage.STORAGE_KEY);
        } catch {
        }
        if (VoiceMeterLanguage.LANGUAGES.includes(stored)) {
            return stored;
        }

        const browser = (navigator.language ?? '').slice(0, 2);
        return (VoiceMeterLanguage.LANGUAGES.includes(browser) ? browser : VoiceMeterLanguage.FALLBACK);
    }

    /**
     * @param {string} language - one of LANGUAGES
     */
    static apply(language) {
        appTranslator.setLanguage(language);
        document.documentElement.lang = language;
    }

    static save(language) {
        try {
            localStorage.setItem(VoiceMeterLanguage.STORAGE_KEY, language);
        } catch {
        }
    }

    /**
     * @param {string} language
     * @returns {string} the language following it in LANGUAGES, cycling
     */
    static next(language) {
        const languages = VoiceMeterLanguage.LANGUAGES;
        return languages[(languages.indexOf(language) + 1) % languages.length];
    }
}

VoiceMeterLanguage.STORAGE_KEY = 'voiceMeter.language';
VoiceMeterLanguage.LANGUAGES   = ['fr', 'en'];
VoiceMeterLanguage.FALLBACK    = 'fr';
