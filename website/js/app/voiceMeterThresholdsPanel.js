/**
 * One slider per threshold. Moving one may push its neighbours: every slider is refreshed.
 */
class VoiceMeterThresholdsPanel {
    /** @type {VoiceMeterThresholds}        */ _thresholds;
    /** @type {Function}                    */ _onChange;
    /** @type {Object<string, HTMLElement>} */ _rows;

    /**
     * @param {HTMLElement}          container
     * @param {VoiceMeterThresholds} thresholds
     * @param {Function}             onChange - called after the user moved a threshold
     */
    constructor(container, thresholds, onChange) {
        this._thresholds = thresholds;
        this._onChange   = onChange;
        this._rows       = {};

        for (const name of VoiceMeterThresholds.NAMES) {
            this._rows[name] = this._buildRow(name);
            container.appendChild(this._rows[name]);
        }
        this.refreshTexts();
    }

    refreshTexts() {
        for (const name of VoiceMeterThresholds.NAMES) {
            this._rows[name].querySelector('.threshold-name').textContent = appTranslator.get('threshold.' + name);
        }
        this._renderValues();

        return this;
    }

    // --- Internal ---

    _buildRow(name) {
        const row   = VoiceMeterDom.create('label', 'threshold');
        const input = VoiceMeterDom.create('input');

        row.dataset.zone = name;
        input.type       = 'range';
        input.min        = String(VoiceMeterDecibel.SCALE_MIN);
        input.max        = String(VoiceMeterDecibel.SCALE_MAX);
        input.step       = '1';
        input.addEventListener('input', () => this._onInput(name, Number(input.value)));

        row.append(
            VoiceMeterDom.create('span', 'threshold-name'),
            input,
            VoiceMeterDom.create('span', 'threshold-value')
        );
        return row;
    }

    _onInput(name, value) {
        this._thresholds.set(name, value);
        this._renderValues();
        this._onChange();
    }

    _renderValues() {
        for (const name of VoiceMeterThresholds.NAMES) {
            const value = this._thresholds.get(name);
            const input = this._rows[name].querySelector('input');
            const label = this._rows[name].querySelector('.threshold-value');

            input.value       = String(value);
            label.textContent = VoiceMeterDecibel.format(value);
        }
    }
}
