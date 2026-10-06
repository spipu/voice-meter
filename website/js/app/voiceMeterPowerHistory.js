/**
 * Ring buffer of power readings, pauses included so that a window always spans the same duration.
 * Averages are taken on power, not on dB: that is how a sound level over a duration (Leq) is defined.
 */
class VoiceMeterPowerHistory {
    /** @type {Float64Array} */ _readings;
    /** @type {int}          */ _next;
    /** @type {int}          */ _count;

    /**
     * @param {int} capacity - number of readings kept
     */
    constructor(capacity) {
        this._readings = new Float64Array(capacity);
        this._next     = 0;
        this._count    = 0;
    }

    /**
     * @param {number|null} power - null for a pause, which takes its place in time but not in the averages
     */
    push(power) {
        this._readings[this._next] = power ?? VoiceMeterPowerHistory.PAUSE;

        this._next  = (this._next + 1) % this._readings.length;
        this._count = Math.min(this._count + 1, this._readings.length);

        return this;
    }

    clear() {
        this._next  = 0;
        this._count = 0;

        return this;
    }

    /**
     * @param {int} count - number of latest readings to look at
     * @returns {number|null} the mean of the non-pause readings among them, null when there is none
     */
    getMean(count) {
        const looked   = Math.min(count, this._count);
        const capacity = this._readings.length;

        let sum   = 0;
        let voice = 0;
        for (let age = 1; age <= looked; age++) {
            const power = this._readings[(this._next - age + capacity) % capacity];
            if (!Number.isNaN(power)) {
                sum += power;
                voice++;
            }
        }
        return ((voice > 0) ? (sum / voice) : null);
    }
}

VoiceMeterPowerHistory.PAUSE = NaN;
