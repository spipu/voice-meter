/**
 * Mean power since the last clear, without keeping the readings.
 */
class VoiceMeterPowerTotal {
    /** @type {number} */ _sum;
    /** @type {int}    */ _count;

    constructor() {
        this._sum   = 0;
        this._count = 0;
    }

    add(power) {
        this._sum += power;
        this._count++;

        return this;
    }

    clear() {
        this._sum   = 0;
        this._count = 0;

        return this;
    }

    /**
     * @returns {number|null} null when nothing was added
     */
    getMean() {
        return ((this._count > 0) ? (this._sum / this._count) : null);
    }
}
