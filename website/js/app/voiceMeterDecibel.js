let VoiceMeterDecibel_formatter = null;

/**
 * Converts a signal power to the displayed level. The microphone is not calibrated: OFFSET
 * maps digital full scale to ~100 dB, which puts normal speech near a phone around 55-70 dB.
 */
class VoiceMeterDecibel {
    /**
     * @param {number} power - mean squared amplitude, full scale = 1
     * @returns {number}
     */
    static fromPower(power) {
        if (power <= 0) {
            return VoiceMeterDecibel.FLOOR;
        }
        return Math.max(VoiceMeterDecibel.FLOOR, 10 * Math.log10(power) + VoiceMeterDecibel.OFFSET);
    }

    /**
     * @param {number} db
     * @returns {number} position of the level on the scale, from 0 (SCALE_MIN) to 1 (SCALE_MAX), clamped
     */
    static toScaleRatio(db) {
        const range = VoiceMeterDecibel.SCALE_MAX - VoiceMeterDecibel.SCALE_MIN;
        return Math.min(1, Math.max(0, (db - VoiceMeterDecibel.SCALE_MIN) / range));
    }

    /**
     * @param {number|null} db
     * @returns {string} e.g. '65'
     */
    static formatValue(db) {
        if (db === null) {
            return VoiceMeterDom.NO_VALUE;
        }
        return VoiceMeterDecibel._getFormatter().format(db);
    }

    /**
     * @param {number|null} db
     * @returns {string} e.g. '65 dB'
     */
    static format(db) {
        return appTranslator.get('level.decibel', {value: VoiceMeterDecibel.formatValue(db)});
    }

    // The language can change at runtime: the formatter follows its locale.
    static _getFormatter() {
        const locale = appTranslator.getLocale();
        if ((VoiceMeterDecibel_formatter === null) || (VoiceMeterDecibel_formatter.resolvedOptions().locale !== locale)) {
            VoiceMeterDecibel_formatter = new Intl.NumberFormat(locale, {maximumFractionDigits: 0});
        }
        return VoiceMeterDecibel_formatter;
    }
}

VoiceMeterDecibel.OFFSET    = 100;
VoiceMeterDecibel.FLOOR     = 0;
VoiceMeterDecibel.SCALE_MIN = 30;
VoiceMeterDecibel.SCALE_MAX = 100;
