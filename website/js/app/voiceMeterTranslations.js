/**
 * Every user-facing text of Voice Meter, served by AppTranslator.
 */
class VoiceMeterTranslations {
    static get CATALOG() {
        return {
            // --- Actions ---
            'action.listen': {
                fr: 'Écouter',
                en: 'Listen'
            },
            'action.stop': {
                fr: 'Arrêter',
                en: 'Stop'
            },
            'action.reset': {
                fr: 'Réinitialiser',
                en: 'Reset'
            },
            'action.switchLanguage': {
                fr: 'Changer de langue',
                en: 'Change language'
            },

            // --- Levels ---
            'level.decibel': {
                fr: '{value} dB',
                en: '{value} dB'
            },
            'average.title': {
                fr: 'moy. {duration}',
                en: 'avg. {duration}'
            },
            'average.overall': {
                fr: 'moy. totale',
                en: 'avg. overall'
            },
            'history.title': {
                fr: 'Niveau sur {duration}',
                en: 'Level over {duration}'
            },

            // --- Zones ---
            'zone.silence': {
                fr: 'Silence',
                en: 'Silence'
            },
            'zone.low': {
                fr: 'Faible',
                en: 'Quiet'
            },
            'zone.good': {
                fr: 'Bien',
                en: 'Good'
            },
            'zone.loud': {
                fr: 'Un peu fort',
                en: 'A bit loud'
            },
            'zone.tooLoud': {
                fr: 'Trop fort !',
                en: 'Too loud!'
            },

            // --- Thresholds, named by the zone they open ---
            'threshold.low': {
                fr: 'Silence sous',
                en: 'Silence below'
            },
            'threshold.good': {
                fr: 'Faible sous',
                en: 'Quiet below'
            },
            'threshold.loud': {
                fr: 'Un peu fort dès',
                en: 'A bit loud from'
            },
            'threshold.tooLoud': {
                fr: 'Trop fort dès',
                en: 'Too loud from'
            },

            // --- Errors ---
            'error.secureContextRequired': {
                fr: "Le micro n'est disponible qu'en HTTPS.",
                en: 'The microphone is only available over HTTPS.'
            },
            'error.microphoneDenied': {
                fr: 'Accès au micro refusé. Autorise-le dans les réglages du navigateur.',
                en: 'Microphone access denied. Allow it in the browser settings.'
            },
            'error.microphoneMissing': {
                fr: 'Aucun micro trouvé.',
                en: 'No microphone found.'
            },
            'error.microphoneLost': {
                fr: 'Le micro a été coupé.',
                en: 'The microphone was cut off.'
            },
            'error.microphoneUnavailable': {
                fr: "Impossible d'accéder au micro.",
                en: 'Unable to access the microphone.'
            }
        };
    }
}

