/**
 * Wires the microphone sampling to the screen components.
 */
class VoiceMeterApp {
    /** @type {HTMLElement}                    */ _screenElement;
    /** @type {VoiceMeterThresholds}           */ _thresholds;
    /** @type {VoiceMeterMicrophone}           */ _microphone;
    /** @type {VoiceMeterSampler}              */ _sampler;
    /** @type {ScreenWakeLock}                 */ _wakeLock;
    /** @type {VoiceMeterScreen|null}          */ _screen;
    /** @type {VoiceMeterGauge|null}           */ _gauge;
    /** @type {VoiceMeterAveragesPanel|null}   */ _averagesPanel;
    /** @type {VoiceMeterHistoryChart|null}    */ _historyChart;
    /** @type {VoiceMeterThresholdsPanel|null} */ _thresholdsPanel;

    /**
     * @param {HTMLElement} screenElement
     */
    constructor(screenElement) {
        this._screenElement   = screenElement;
        this._thresholds      = (new VoiceMeterThresholds()).load();
        this._microphone      = new VoiceMeterMicrophone(() => this._onMicrophoneLost());
        this._sampler         = new VoiceMeterSampler(this._microphone, this._thresholds, (levelDb, averageDbs) => this._onReading(levelDb, averageDbs));
        this._wakeLock        = new ScreenWakeLock();
        this._screen          = null;
        this._gauge           = null;
        this._averagesPanel   = null;
        this._historyChart    = null;
        this._thresholdsPanel = null;
    }

    init() {
        this._screen          = new VoiceMeterScreen(this._screenElement);
        this._gauge           = new VoiceMeterGauge(this._screen.getGaugeContainer());
        this._averagesPanel   = new VoiceMeterAveragesPanel(this._screen.getAveragesContainer(), this._thresholds);
        this._historyChart    = new VoiceMeterHistoryChart(this._screen.getHistoryContainer(), this._thresholds);
        this._thresholdsPanel = new VoiceMeterThresholdsPanel(this._screen.getThresholdsContainer(), this._thresholds, () => this._onThresholdsChange());

        this._gauge.drawZones(this._thresholds);
        this._screen
            .onListen(() => this.start())
            .onReset(() => this.reset())
            .onStop(() => this.stop())
            .onSwitchLanguage(() => this._switchLanguage());
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());
        this._refreshTexts();

        return this;
    }

    async start() {
        if (!VoiceMeterMicrophone.isAvailable()) {
            this._screen.showError('error.secureContextRequired');
            return;
        }

        this._screen.showError(null).setBusy(true);
        try {
            await this._microphone.open();
        } catch (error) {
            this._screen.showError(VoiceMeterApp.ERROR_CODES[error.name] ?? 'error.microphoneUnavailable');
            return;
        } finally {
            this._screen.setBusy(false);
        }

        this._sampler.start();
        this._wakeLock.init();
        this._screen.setListening(true);
    }

    reset() {
        this._sampler.reset();
        this._averagesPanel.clear();
        this._historyChart.clear();
    }

    stop() {
        this._sampler.stop();
        this._microphone.close();
        this._wakeLock.release();

        this._gauge.setLevel(null, null);
        this.reset();
        this._screen.setListening(false);
    }

    // --- Internal ---

    _onReading(levelDb, averageDbs) {
        this._gauge.setLevel(levelDb, this._thresholds.getZone(levelDb));
        this._averagesPanel.update(averageDbs);
        this._historyChart.push(levelDb);
    }

    _onMicrophoneLost() {
        this.stop();
        this._screen.showError('error.microphoneLost');
    }

    _onVisibilityChange() {
        if ((document.visibilityState === 'visible') && this._microphone.isOpen()) {
            this._microphone.resume();
        }
    }

    _onThresholdsChange() {
        this._thresholds.save();
        this._gauge.drawZones(this._thresholds);
        this._historyChart.draw();
    }

    _switchLanguage() {
        const language = VoiceMeterLanguage.next(appTranslator.getLanguage());

        VoiceMeterLanguage.save(language);
        VoiceMeterLanguage.apply(language);
        this._refreshTexts();
    }

    _refreshTexts() {
        this._screen.refreshTexts(VoiceMeterLanguage.next(appTranslator.getLanguage()));
        this._gauge.refreshTexts();
        this._averagesPanel.refreshTexts();
        this._historyChart.refreshTexts();
        this._thresholdsPanel.refreshTexts();
    }
}

VoiceMeterApp.ERROR_CODES = {
    NotAllowedError: 'error.microphoneDenied',
    NotFoundError:   'error.microphoneMissing',
};
