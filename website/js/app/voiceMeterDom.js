class VoiceMeterDom {
    /**
     * @param {string}      tag
     * @param {string|null} className
     * @returns {HTMLElement}
     */
    static create(tag, className = null) {
        const element = document.createElement(tag);
        if (className !== null) {
            element.className = className;
        }
        return element;
    }

    /**
     * @param {string} tag
     * @param {object} attributes - {name: value}
     * @returns {SVGElement}
     */
    static createSvg(tag, attributes = {}) {
        const element = document.createElementNS(VoiceMeterDom.SVG_NAMESPACE, tag);
        for (const [name, value] of Object.entries(attributes)) {
            element.setAttribute(name, value);
        }
        return element;
    }
}

VoiceMeterDom.SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
VoiceMeterDom.NO_VALUE      = '-';
