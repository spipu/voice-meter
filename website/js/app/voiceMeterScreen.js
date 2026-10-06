/**
 * Page layout: a start view (listen button) and a meter view hosting the gauge with its averages,
 * the level history and the thresholds,
 * with the language switch always in the top left corner.
 */
class VoiceMeterScreen {
    /** @type {HTMLElement}       */ _root;
    /** @type {HTMLButtonElement} */ _languageButton;
    /** @type {HTMLButtonElement} */ _listenButton;
    /** @type {HTMLButtonElement} */ _resetButton;
    /** @type {HTMLButtonElement} */ _stopButton;
    /** @type {HTMLElement}       */ _error;
    /** @type {HTMLElement}       */ _gaugeContainer;
    /** @type {HTMLElement}       */ _averagesContainer;
    /** @type {HTMLElement}       */ _historyContainer;
    /** @type {HTMLElement}       */ _thresholdsContainer;
    /** @type {string|null}       */ _errorCode;

    /**
     * @param {HTMLElement} screen
     */
    constructor(screen) {
        this._root                = VoiceMeterDom.create('div', 'app');
        this._languageButton      = VoiceMeterDom.create('button', 'btn-language');
        this._listenButton        = VoiceMeterDom.create('button', 'btn-listen');
        this._resetButton         = VoiceMeterDom.create('button', 'btn-reset');
        this._stopButton          = VoiceMeterDom.create('button', 'btn-stop');
        this._error               = VoiceMeterDom.create('div', 'error');
        this._gaugeContainer      = VoiceMeterDom.create('div', 'gauge-container');
        this._averagesContainer   = VoiceMeterDom.create('div', 'averages');
        this._historyContainer    = VoiceMeterDom.create('div', 'history');
        this._thresholdsContainer = VoiceMeterDom.create('div', 'thresholds');
        this._errorCode           = null;

        const startView = VoiceMeterDom.create('div', 'start-view');
        const meterView = VoiceMeterDom.create('div', 'meter-view');
        const levelRow  = VoiceMeterDom.create('div', 'level-row');
        const actions   = VoiceMeterDom.create('div', 'actions');
        startView.append(this._listenButton, this._error);
        levelRow.append(this._gaugeContainer, this._averagesContainer);
        actions.append(this._resetButton, this._stopButton);
        meterView.append(levelRow, this._historyContainer, this._thresholdsContainer, actions);
        this._root.append(this._languageButton, startView, meterView);

        screen.replaceChildren(this._root);
        this.showError(null);
    }

    getGaugeContainer() {
        return this._gaugeContainer;
    }

    getAveragesContainer() {
        return this._averagesContainer;
    }

    getHistoryContainer() {
        return this._historyContainer;
    }

    getThresholdsContainer() {
        return this._thresholdsContainer;
    }

    onListen(callback) {
        this._listenButton.addEventListener('click', callback);

        return this;
    }

    onReset(callback) {
        this._resetButton.addEventListener('click', callback);

        return this;
    }

    onStop(callback) {
        this._stopButton.addEventListener('click', callback);

        return this;
    }

    onSwitchLanguage(callback) {
        this._languageButton.addEventListener('click', callback);

        return this;
    }

    setListening(listening) {
        this._root.classList.toggle('listening', listening);

        return this;
    }

    setBusy(busy) {
        this._listenButton.disabled = busy;

        return this;
    }

    /**
     * @param {string|null} code - translation code of the message, null to hide it
     */
    showError(code) {
        this._errorCode = code;
        this._renderError();

        return this;
    }

    /**
     * @param {string} nextLanguage - shown on the language button, as the language it switches to
     */
    refreshTexts(nextLanguage) {
        this._languageButton.textContent = nextLanguage.toUpperCase();
        this._languageButton.title       = appTranslator.get('action.switchLanguage');
        this._listenButton.textContent   = appTranslator.get('action.listen');
        this._resetButton.textContent    = appTranslator.get('action.reset');
        this._stopButton.textContent     = appTranslator.get('action.stop');
        this._renderError();

        return this;
    }

    // --- Internal ---

    _renderError() {
        this._error.hidden      = (this._errorCode === null);
        this._error.textContent = ((this._errorCode !== null) ? appTranslator.get(this._errorCode) : '');
    }
}
