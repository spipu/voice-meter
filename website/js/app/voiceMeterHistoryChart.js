/**
 * Level over the last SECONDS as a curve scrolling from right to left, thresholds drawn as
 * dashed lines in their zone colour. Each point is the mean level over POINT_SECONDS: one point
 * per reading would cram several points into each pixel.
 */
class VoiceMeterHistoryChart {
    /** @type {VoiceMeterThresholds}        */ _thresholds;
    /** @type {HTMLCanvasElement}           */ _canvas;
    /** @type {HTMLElement}                 */ _title;
    /** @type {number[]}                    */ _levels;
    /** @type {int}                         */ _capacity;
    /** @type {int}                         */ _readingsPerPoint;
    /** @type {number}                      */ _pendingSum;
    /** @type {int}                         */ _pendingCount;
    /** @type {number}                      */ _pixelRatio;
    /** @type {Object|null}                 */ _colors;

    /**
     * @param {HTMLElement}          container
     * @param {VoiceMeterThresholds} thresholds
     */
    constructor(container, thresholds) {
        this._thresholds       = thresholds;
        this._canvas           = VoiceMeterDom.create('canvas', 'history-canvas');
        this._title            = VoiceMeterDom.create('span', 'history-title');
        this._levels           = [];
        this._capacity         = VoiceMeterHistoryChart.SECONDS / VoiceMeterHistoryChart.POINT_SECONDS;
        this._readingsPerPoint = VoiceMeterHistoryChart.POINT_SECONDS * VoiceMeterSampler.READINGS_PER_SECOND;
        this._pendingSum       = 0;
        this._pendingCount     = 0;
        this._pixelRatio       = 1;
        this._colors           = null;

        container.append(this._canvas, this._title);
        // The chart is hidden (zero sized) until listening starts: it is sized when it shows up.
        new ResizeObserver(() => this._resize()).observe(this._canvas);
        this.refreshTexts();
    }

    /**
     * @param {number} db
     */
    push(db) {
        this._pendingSum += db;
        this._pendingCount++;
        if (this._pendingCount < this._readingsPerPoint) {
            return this;
        }

        this._levels.push(this._pendingSum / this._pendingCount);
        if (this._levels.length > this._capacity) {
            this._levels.shift();
        }
        this._pendingSum   = 0;
        this._pendingCount = 0;

        return this.draw();
    }

    clear() {
        this._levels       = [];
        this._pendingSum   = 0;
        this._pendingCount = 0;

        return this.draw();
    }

    refreshTexts() {
        this._title.textContent = appTranslator.get('history.title', {duration: VoiceMeterDuration.format(VoiceMeterHistoryChart.SECONDS)});

        return this;
    }

    draw() {
        const context = this._canvas.getContext('2d');
        const width   = this._canvas.width;
        const height  = this._canvas.height;

        context.clearRect(0, 0, width, height);
        if ((width === 0) || (height === 0)) {
            return this;
        }

        this._drawCurve(context, width, height);
        this._drawThresholds(context, width, height);

        return this;
    }

    // --- Internal ---

    _drawCurve(context, width, height) {
        if (this._levels.length === 0) {
            return;
        }

        const step  = width / (this._capacity - 1);
        const first = this._capacity - this._levels.length;

        context.strokeStyle = this._getColors().curve;
        context.lineWidth   = VoiceMeterHistoryChart.CURVE_WIDTH * this._pixelRatio;
        context.lineJoin    = 'round';
        context.beginPath();
        this._levels.forEach((db, index) => {
            context.lineTo((first + index) * step, this._dbToY(db, height));
        });
        context.stroke();
    }

    _drawThresholds(context, width, height) {
        const colors = this._getColors();

        context.lineWidth = VoiceMeterHistoryChart.THRESHOLD_WIDTH * this._pixelRatio;
        context.setLineDash(VoiceMeterHistoryChart.THRESHOLD_DASH.map((length) => length * this._pixelRatio));
        for (const name of VoiceMeterThresholds.NAMES) {
            const y = Math.round(this._dbToY(this._thresholds.get(name), height)) + 0.5;

            context.strokeStyle = colors.zones[name];
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
        context.setLineDash([]);
    }

    _dbToY(db, height) {
        return height * (1 - VoiceMeterDecibel.toScaleRatio(db));
    }

    _resize() {
        this._pixelRatio    = window.devicePixelRatio || 1;
        this._canvas.width  = Math.round(this._canvas.clientWidth * this._pixelRatio);
        this._canvas.height = Math.round(this._canvas.clientHeight * this._pixelRatio);
        this.draw();
    }

    /**
     * Read from main.css, so that the chart shares the colours of the other components.
     *
     * @returns {{curve: string, zones: Object<string, string>}}
     */
    _getColors() {
        if (this._colors === null) {
            const style = getComputedStyle(document.documentElement);
            const read  = (property) => style.getPropertyValue(property).trim();

            this._colors = {curve: read('--text'), zones: {}};
            for (const zone of VoiceMeterThresholds.ZONES) {
                this._colors.zones[zone] = read('--zone-' + zone);
            }
        }
        return this._colors;
    }
}

VoiceMeterHistoryChart.SECONDS         = 300;
VoiceMeterHistoryChart.POINT_SECONDS   = 0.5;
VoiceMeterHistoryChart.CURVE_WIDTH     = 1.5;
VoiceMeterHistoryChart.THRESHOLD_WIDTH = 1;
VoiceMeterHistoryChart.THRESHOLD_DASH  = [4, 4];
