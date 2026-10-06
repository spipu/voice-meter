class VoiceMeterMicrophone {
    /** @type {Function}          */ _onLost;
    /** @type {MediaStream|null}  */ _stream;
    /** @type {AudioContext|null} */ _context;
    /** @type {AnalyserNode|null} */ _analyser;
    /** @type {Float32Array|null} */ _samples;

    /**
     * @param {Function} onLost - called when the system takes the microphone away (unplugged, permission revoked)
     */
    constructor(onLost) {
        this._onLost   = onLost;
        this._stream   = null;
        this._context  = null;
        this._analyser = null;
        this._samples  = null;
    }

    static isAvailable() {
        return (window.isSecureContext && ('mediaDevices' in navigator));
    }

    isOpen() {
        return (this._analyser !== null);
    }

    /**
     * Must run from a user gesture: it raises the browser permission prompt and starts the audio context.
     */
    async open() {
        if (this.isOpen()) {
            return;
        }

        this._stream = await navigator.mediaDevices.getUserMedia(VoiceMeterMicrophone.CONSTRAINTS);
        this._stream.getTracks().forEach((track) => track.addEventListener('ended', () => this._onLost()));
        try {
            this._context = new AudioContext();

            const analyser = this._context.createAnalyser();
            analyser.fftSize = VoiceMeterMicrophone.WINDOW_SIZE;
            this._context.createMediaStreamSource(this._stream).connect(analyser);
            await this._context.resume();

            this._samples  = new Float32Array(analyser.fftSize);
            this._analyser = analyser;
        } catch (error) {
            this.close();
            throw error;
        }
    }

    /**
     * The system suspends the audio context in the background (iOS) and does not always restart it.
     */
    resume() {
        if ((this._context !== null) && (this._context.state !== 'running')) {
            this._context.resume().catch(() => {});
        }

        return this;
    }

    close() {
        if (this._stream !== null) {
            this._stream.getTracks().forEach((track) => track.stop());
        }
        if (this._context !== null) {
            this._context.close().catch(() => {});
        }

        this._stream   = null;
        this._context  = null;
        this._analyser = null;
        this._samples  = null;
    }

    /**
     * @returns {number} mean squared amplitude over the last WINDOW_SIZE samples, full scale = 1
     */
    readPower() {
        if (!this.isOpen()) {
            return 0;
        }

        this._analyser.getFloatTimeDomainData(this._samples);

        let sum = 0;
        for (const sample of this._samples) {
            sum += sample * sample;
        }
        return sum / this._samples.length;
    }
}

// Browser voice processing would flatten the very level being measured.
VoiceMeterMicrophone.CONSTRAINTS = {
    audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl:  false
    }
};
// ~45 ms at usual sample rates, one VoiceMeterSampler reading period.
VoiceMeterMicrophone.WINDOW_SIZE = 2048;
