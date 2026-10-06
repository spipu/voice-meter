function loadApp()
{
    appTranslator.addCatalog(VoiceMeterTranslations.CATALOG)
        .setFallbackLanguage(VoiceMeterLanguage.FALLBACK);
    VoiceMeterLanguage.apply(VoiceMeterLanguage.load());

    const app = new VoiceMeterApp(document.getElementById('screen'));
    app.init();
}

appBootstrap.setReadyCallback(loadApp);
