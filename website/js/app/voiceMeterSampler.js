/**
 * Reads the microphone at a fixed rate and reports the current level with its averages over
 * AVERAGE_SECONDS. Silent readings are left out of the averages: they measure the voice, not the
 * pauses between sentences.
 */
class VoiceMeterSampler {
    /** @type {VoiceMeterMicrophone}   */ _microphone;
    /** @type {VoiceMeterThresholds}   */ _thresholds;
    /** @type {VoiceMeterPowerHistory} */ _history;
    /** @type {VoiceMeterPowerTotal}   */ _total;
    /** @type {Function}               */ _listener;
    /** @type {int|null}               */ _timer;
    /** @type {number|null}            */ _levelDb;

    /**
     * @param {VoiceMeterMicrophone} microphone
     * @param {VoiceMeterThresholds} thresholds - tell the silent readings apart
     * @param {Function}             listener   - (levelDb: number, averageDbs: (number|null)[]) aligned with AVERAGE_SECONDS
     */
    constructor(microphone, thresholds, listener) {
        const longest = Math.max(...VoiceMeterSampler.AVERAGE_SECONDS.filter((seconds) => (seconds !== null)));

        this._microphone = microphone;
        this._thresholds = thresholds;
        this._history    = new VoiceMeterPowerHistory(longest * VoiceMeterSampler.READINGS_PER_SECOND);
        this._total      = new VoiceMeterPowerTotal();
        this._listener   = listener;
        this._timer      = null;
        this._levelDb    = null;
    }

    isRunning() {
        return (this._timer !== null);
    }

    start() {
        if (this.isRunning()) {
            return this;
        }

        this.reset();
        this._levelDb = null;
        this._timer   = setInterval(() => this._read(), 1000 / VoiceMeterSampler.READINGS_PER_SECOND);

        return this;
    }

    stop() {
        if (this.isRunning()) {
            clearInterval(this._timer);
            this._timer = null;
        }

        return this;
    }

    /**
     * Restarts every average from now on.
     */
    reset() {
        this._history.clear();
        this._total.clear();

        return this;
    }

    // --- Internal ---

    _read() {
        const power      = this._microphone.readPower();
        const db         = VoiceMeterDecibel.fromPower(power);
        const voicePower = ((this._thresholds.isSilence(db)) ? null : power);

        this._history.push(voicePower);
        if (voicePower !== null) {
            this._total.add(voicePower);
        }

        this._listener(
            this._smoothLevel(db),
            VoiceMeterSampler.AVERAGE_SECONDS.map((seconds) => this._getAverageDb(seconds))
        );
    }

    // VU meter ballistics, in dB: the needle moves smoothly both ways, without lingering after a loud burst.
    _smoothLevel(db) {
        this._levelDb = ((this._levelDb !== null)
            ? (this._levelDb + VoiceMeterSampler.LEVEL_WEIGHT * (db - this._levelDb))
            : db);
        return this._levelDb;
    }

    _getAverageDb(seconds) {
        const power = ((seconds !== null)
            ? this._history.getMean(seconds * VoiceMeterSampler.READINGS_PER_SECOND)
            : this._total.getMean());
        return ((power !== null) ? VoiceMeterDecibel.fromPower(power) : null);
    }
}

// Paired with VoiceMeterMicrophone.WINDOW_SIZE: each reading covers most of its period.
VoiceMeterSampler.READINGS_PER_SECOND = 20;
// null: since listening started (or since the last reset).
VoiceMeterSampler.AVERAGE_SECONDS     = [30, 60, 300, null];
// Time the needle takes to cover LEVEL_REACHED of a level change, the response time of a classic VU meter.
VoiceMeterSampler.LEVEL_SECONDS       = 0.3;
VoiceMeterSampler.LEVEL_REACHED       = 0.95;
VoiceMeterSampler.LEVEL_WEIGHT        = 1 - Math.pow(1 - VoiceMeterSampler.LEVEL_REACHED, 1 / (VoiceMeterSampler.LEVEL_SECONDS * VoiceMeterSampler.READINGS_PER_SECOND));
