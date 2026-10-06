/**
 * Car-dashboard style dial: coloured zones, graduations and a needle, drawn in SVG.
 */
class VoiceMeterGauge {
    /** @type {SVGSVGElement}  */ _svg;
    /** @type {SVGGElement}    */ _zones;
    /** @type {SVGGElement}    */ _needle;
    /** @type {SVGTextElement} */ _value;
    /** @type {SVGTextElement} */ _label;
    /** @type {number|null}    */ _db;
    /** @type {string|null}    */ _zone;

    /**
     * @param {HTMLElement} container
     */
    constructor(container) {
        const G = VoiceMeterGauge;

        this._svg    = VoiceMeterDom.createSvg('svg', {viewBox: G.VIEW_BOX, class: 'gauge'});
        this._zones  = VoiceMeterDom.createSvg('g');
        this._needle = this._buildNeedle();
        this._value  = VoiceMeterDom.createSvg('text', {x: G.CX, y: G.CY + G.VALUE_OFFSET, class: 'gauge-value'});
        this._label  = VoiceMeterDom.createSvg('text', {x: G.CX, y: G.CY + G.LABEL_OFFSET, class: 'gauge-label'});
        this._db     = null;
        this._zone   = null;

        this._svg.append(this._zones, this._buildGraduations(), this._needle, this._value, this._label);
        container.appendChild(this._svg);

        this._render();
    }

    /**
     * @param {VoiceMeterThresholds} thresholds
     */
    drawZones(thresholds) {
        const ranges = thresholds.getZoneRanges().filter((range) => (range.to > range.from));

        this._zones.replaceChildren(...ranges.map((range) => VoiceMeterDom.createSvg('path', {
            d:           this._arcPath(this._dbToAngle(range.from), this._dbToAngle(range.to), VoiceMeterGauge.RADIUS),
            class:       'gauge-zone',
            'data-zone': range.zone,
        })));

        return this;
    }

    /**
     * @param {number|null} db   - null when idle
     * @param {string|null} zone - one of VoiceMeterThresholds.ZONES
     */
    setLevel(db, zone) {
        this._db   = db;
        this._zone = zone;
        this._render();

        return this;
    }

    refreshTexts() {
        this._render();

        return this;
    }

    // --- Internal ---

    _render() {
        const angle = this._dbToAngle(this._db ?? VoiceMeterDecibel.SCALE_MIN);

        this._needle.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';
        this._value.textContent      = VoiceMeterDecibel.format(this._db);
        this._label.textContent      = ((this._zone !== null) ? appTranslator.get('zone.' + this._zone) : '');
        this._svg.dataset.zone       = this._zone ?? '';
    }

    _buildNeedle() {
        const G = VoiceMeterGauge;
        const needle = VoiceMeterDom.createSvg('g', {class: 'gauge-needle'});

        needle.append(
            VoiceMeterDom.createSvg('line', {x1: G.CX, y1: G.CY + G.NEEDLE_TAIL, x2: G.CX, y2: G.CY - G.RADIUS + G.NEEDLE_TIP_GAP}),
            VoiceMeterDom.createSvg('circle', {cx: G.CX, cy: G.CY, r: G.HUB_RADIUS})
        );
        return needle;
    }

    _buildGraduations() {
        const G = VoiceMeterGauge;
        const graduations = VoiceMeterDom.createSvg('g', {class: 'gauge-graduations'});

        for (let db = VoiceMeterDecibel.SCALE_MIN; db <= VoiceMeterDecibel.SCALE_MAX; db += G.MINOR_STEP) {
            const angle   = this._dbToAngle(db);
            const isMajor = (db % G.MAJOR_STEP === 0);
            const outer   = this._point(angle, G.RADIUS - G.TICK_GAP);
            const inner   = this._point(angle, G.RADIUS - G.TICK_GAP - ((isMajor) ? G.MAJOR_TICK : G.MINOR_TICK));

            graduations.appendChild(VoiceMeterDom.createSvg('line', {
                x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y,
                class: ((isMajor) ? 'major' : 'minor'),
            }));

            if (isMajor) {
                const position = this._point(angle, G.RADIUS - G.NUMBER_GAP);
                const number   = VoiceMeterDom.createSvg('text', {x: position.x, y: position.y});
                number.textContent = VoiceMeterDecibel.formatValue(db);
                graduations.appendChild(number);
            }
        }
        return graduations;
    }

    /**
     * @param {number} db
     * @returns {number} degrees, clockwise from the vertical
     */
    _dbToAngle(db) {
        return VoiceMeterGauge.SWEEP * (VoiceMeterDecibel.toScaleRatio(db) - 0.5);
    }

    _point(angle, radius) {
        const radians = angle * Math.PI / 180;
        return {
            x: (VoiceMeterGauge.CX + radius * Math.sin(radians)).toFixed(2),
            y: (VoiceMeterGauge.CY - radius * Math.cos(radians)).toFixed(2),
        };
    }

    _arcPath(fromAngle, toAngle, radius) {
        const from     = this._point(fromAngle, radius);
        const to       = this._point(toAngle, radius);
        const largeArc = (((toAngle - fromAngle) > 180) ? 1 : 0);
        return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
    }
}

// Geometry in view box units; CX / CY must match the needle transform-origin in main.css.
VoiceMeterGauge.VIEW_BOX       = '0 0 200 158';
VoiceMeterGauge.CX             = 100;
VoiceMeterGauge.CY             = 96;
VoiceMeterGauge.RADIUS         = 84;
VoiceMeterGauge.SWEEP          = 240;
VoiceMeterGauge.TICK_GAP       = 10;
VoiceMeterGauge.MINOR_TICK     = 4;
VoiceMeterGauge.MAJOR_TICK     = 8;
VoiceMeterGauge.NUMBER_GAP     = 27;
VoiceMeterGauge.MINOR_STEP     = 5;
VoiceMeterGauge.MAJOR_STEP     = 10;
VoiceMeterGauge.NEEDLE_TAIL    = 10;
VoiceMeterGauge.NEEDLE_TIP_GAP = 4;
VoiceMeterGauge.HUB_RADIUS     = 6;
VoiceMeterGauge.VALUE_OFFSET   = 36;
VoiceMeterGauge.LABEL_OFFSET   = 52;
