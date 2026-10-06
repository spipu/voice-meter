# Voice Meter

Petite PWA pour savoir si on parle trop fort.

* Bouton **Écouter** → autorisation du micro → jauge en dB façon compteur de voiture : gris (silence), bleu (faible), vert (bien), jaune (un peu fort), rouge (trop fort).
* Moyennes sur 30 s, 1 min, 5 min et depuis le début de l'écoute, qui ignorent les silences (« - » si on n'a pas parlé).
* Courbe du niveau sur les 5 dernières minutes.
* Bouton pour réinitialiser les moyennes et la courbe.
* Seuils réglables, mémorisés dans le navigateur.
* Français ou anglais, au choix via le bouton en haut à gauche.
* Installable, fonctionne hors ligne et se met à jour toute seule.

Les dB affichés sont indicatifs : le micro n'est pas calibré.

## Tester en local

```
python serve.py
```

Puis ouvrir http://localhost:8000/ (le micro exige `localhost` ou HTTPS).

## Arborescence

* `serve.py` : micro serveur de test.
* `website/` : l'application, servie telle quelle à la racine du domaine.
* `website/js/webapp/` : briques génériques de la PWA (chargement et mise à jour automatique, traductions, écran maintenu allumé).
* `website/js/app/` : le sonomètre.
