/**
 * The user thresholds splitting the scale into zones. Each threshold is named by the zone it
 * opens; they stay strictly increasing and are persisted in localStorage.
 */
class VoiceMeterThresholds {
    /** @type {Object<string, int>} */ _values;

    constructor() {
        this._values = {...VoiceMeterThresholds.DEFAULTS};
    }

    /**
     * @param {string} name - one of NAMES
     * @returns {int}
     */
    get(name) {
        return this._values[name];
    }

    /**
     * Sets one threshold and pushes its neighbours away so that the order always holds.
     *
     * @param {string} name  - one of NAMES
     * @param {number} value - dB
     */
    set(name, value) {
        const names = VoiceMeterThresholds.NAMES;
        const index = names.indexOf(name);
        if (index === -1) {
            return this;
        }

        const min = VoiceMeterDecibel.SCALE_MIN + index;
        const max = VoiceMeterDecibel.SCALE_MAX - (names.length - 1 - index);

        this._values[name] = Math.min(max, Math.max(min, Math.round(value)));
        for (let next = index + 1; next < names.length; next++) {
            this._values[names[next]] = Math.max(this._values[names[next]], this._values[names[next - 1]] + 1);
        }
        for (let previous = index - 1; previous >= 0; previous--) {
            this._values[names[previous]] = Math.min(this._values[names[previous]], this._values[names[previous + 1]] - 1);
        }

        return this;
    }

    /**
     * @param {number} db
     * @returns {string} one of ZONES
     */
    getZone(db) {
        const crossed = VoiceMeterThresholds.NAMES.filter((name) => (db >= this._values[name])).length;
        return VoiceMeterThresholds.ZONES[crossed];
    }

    /**
     * @param {number} db
     * @returns {boolean} true below the first threshold: nobody is speaking
     */
    isSilence(db) {
        return (this.getZone(db) === VoiceMeterThresholds.SILENCE_ZONE);
    }

    /**
     * @returns {{zone: string, from: int, to: int}[]} the zones covering the whole scale, in order
     */
    getZoneRanges() {
        const bounds = [
            VoiceMeterDecibel.SCALE_MIN,
            ...VoiceMeterThresholds.NAMES.map((name) => this._values[name]),
            VoiceMeterDecibel.SCALE_MAX
        ];
        return VoiceMeterThresholds.ZONES.map((zone, index) => ({zone: zone, from: bounds[index], to: bounds[index + 1]}));
    }

    load() {
        let stored;
        try {
            stored = JSON.parse(localStorage.getItem(VoiceMeterThresholds.STORAGE_KEY) ?? 'null');
        } catch {
            return this;
        }
        if (!(stored instanceof Object)) {
            return this;
        }

        for (const name of VoiceMeterThresholds.NAMES) {
            if (Number.isFinite(stored[name])) {
                this.set(name, stored[name]);
            }
        }
        return this;
    }

    save() {
        // Losing the thresholds only costs the defaults at next launch: a failed write is not an error.
        try {
            localStorage.setItem(VoiceMeterThresholds.STORAGE_KEY, JSON.stringify(this._values));
        } catch {
        }
        return this;
    }
}

VoiceMeterThresholds.STORAGE_KEY  = 'voiceMeter.thresholds';
VoiceMeterThresholds.ZONES        = ['silence', 'low', 'good', 'loud', 'tooLoud'];
VoiceMeterThresholds.SILENCE_ZONE = VoiceMeterThresholds.ZONES[0];
VoiceMeterThresholds.NAMES        = VoiceMeterThresholds.ZONES.slice(1);
VoiceMeterThresholds.DEFAULTS     = {low: 40, good: 50, loud: 65, tooLoud: 75};
