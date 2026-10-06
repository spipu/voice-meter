# CLAUDE.md

PWA minimaliste : un sonomètre pour savoir si on parle trop fort.

## Règles de codage

### Mise à jour automatique

* `website/appServiceWorker.js` et tout `website/js/webapp/` (`appBootstrap.js`, `appTranslator.js`, `screenWakeLock.js`) sont repris tels quels de `../doom-js` : les garder alignés, ne jamais les modifier ici.
* Au démarrage, `appBootstrap` compare la `version` de `website/js/app/libBootstrap.json` (lue sur le serveur, hors cache) à celle mémorisée ; si elle diffère, le service worker vide son cache et la page se recharge.
* **Incrémenter la `version` de `libBootstrap.json` à chaque modification d'un fichier de `website/`**, y compris CSS, HTML, manifest, `appBootstrap.js` et `appServiceWorker.js`. Sans l'incrément, les clients installés restent sur l'ancienne version.
* Tout nouveau fichier JS est déclaré dans `libBootstrap.json` ; l'ordre de déclaration est l'ordre de chargement.

### Commentaires

* Pas de commentaire inutile : uniquement le « pourquoi » non déductible du code, en une à deux lignes. Jamais de paraphrase du code.

### Qualité de code

* Jamais de copier-coller : factoriser.
* Mettre à jour `README.md` sans attendre qu'on le demande dès qu'il devient obsolète. Il décrit le **quoi**, jamais le **comment**.

### Messages de commit

* Une phrase courte de description, rien de plus.
* Pas de mention de co-auteur Claude (pas de ligne `Co-Authored-By`).

### Standards de codage

* Pas de modules ES : tout est chargé en portée globale par le bootstrap.
* Une classe par fichier, nom de fichier en camelCase identique à la classe, préfixé `VoiceMeter`.
* Champs privés préfixés `_`, exposés par des accesseurs explicites ; les setters chaînables retournent `this`.
* Indentation de 4 espaces, toujours des accolades, early return plutôt qu'imbrication.
* Parenthèses systématiques autour des ternaires et des comparaisons composées : `((a !== null) ? a : b)`, `((x > 0) && (y === true))`.
* Alignement des `=` dans un bloc d'affectations consécutives.
* Comparaisons strictes, `??` pour les valeurs par défaut, `null` pour l'absence de valeur.
* Constantes en `MAJUSCULES_SNAKE`, affectées après la classe ; pas de nombre magique en ligne.
* Code et commentaires en anglais.
* **Aucun texte affiché en dur** : le code ne porte qu'un code de traduction (`appTranslator.get('zone.loud')`), le texte vit dans `VoiceMeterTranslations`, renseigné en `fr` **et** `en`. Nombres et durées se formatent avec `Intl` et `appTranslator.getLocale()`.
* Un composant d'interface qui affiche du texte expose `refreshTexts()`, appelé au changement de langue.

## Tester

* `python serve.py` sert `./website` sur http://localhost:8000/.
* Les tests dans le navigateur sont faits par l'utilisateur : ne pas piloter de navigateur.
