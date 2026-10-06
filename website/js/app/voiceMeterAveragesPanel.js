/**
 * One tile per VoiceMeterSampler.AVERAGE_SECONDS, coloured by the zone of its average.
 */
class VoiceMeterAveragesPanel {
    /** @type {VoiceMeterThresholds} */ _thresholds;
    /** @type {HTMLElement[]}        */ _tiles;
    /** @type {(number|null)[]}      */ _averageDbs;

    /**
     * @param {HTMLElement}          container
     * @param {VoiceMeterThresholds} thresholds
     */
    constructor(container, thresholds) {
        this._thresholds = thresholds;
        this._tiles      = VoiceMeterSampler.AVERAGE_SECONDS.map(() => this._buildTile());
        this._averageDbs = VoiceMeterSampler.AVERAGE_SECONDS.map(() => null);

        container.append(...this._tiles);
        this.refreshTexts();
    }

    /**
     * @param {(number|null)[]} averageDbs - aligned with VoiceMeterSampler.AVERAGE_SECONDS
     */
    update(averageDbs) {
        this._averageDbs = averageDbs;
        this._renderValues();

        return this;
    }

    clear() {
        return this.update(this._averageDbs.map(() => null));
    }

    refreshTexts() {
        VoiceMeterSampler.AVERAGE_SECONDS.forEach((seconds, index) => {
            this._tiles[index].querySelector('.average-title').textContent = this._getTitle(seconds);
        });
        this._renderValues();

        return this;
    }

    // --- Internal ---

    _buildTile() {
        const tile = VoiceMeterDom.create('div', 'average');
        tile.append(
            VoiceMeterDom.create('span', 'average-value'),
            VoiceMeterDom.create('span', 'average-title')
        );
        return tile;
    }

    _getTitle(seconds) {
        if (seconds === null) {
            return appTranslator.get('average.overall');
        }
        return appTranslator.get('average.title', {duration: VoiceMeterDuration.format(seconds)});
    }

    _renderValues() {
        this._averageDbs.forEach((db, index) => {
            const tile = this._tiles[index];
            tile.querySelector('.average-value').textContent = VoiceMeterDecibel.formatValue(db);
            tile.dataset.zone = ((db !== null) ? this._thresholds.getZone(db) : '');
        });
    }
}
