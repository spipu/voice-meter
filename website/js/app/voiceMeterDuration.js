class VoiceMeterDuration {
    /**
     * @param {int} seconds
     * @returns {string} in whole minutes when exact, e.g. '5 min', else in seconds, e.g. '30 s'
     */
    static format(seconds) {
        const inMinutes = (seconds % VoiceMeterDuration.SECONDS_PER_MINUTE === 0);
        const formatter = new Intl.NumberFormat(appTranslator.getLocale(), {
            style:       'unit',
            unit:        ((inMinutes) ? 'minute' : 'second'),
            unitDisplay: 'short',
        });
        return formatter.format((inMinutes) ? (seconds / VoiceMeterDuration.SECONDS_PER_MINUTE) : seconds);
    }
}

VoiceMeterDuration.SECONDS_PER_MINUTE = 60;
