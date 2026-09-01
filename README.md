# L'Odyssée de Kryptos

Un site complet et ludique pour apprendre la cybersécurité, **du collège au niveau professionnel**, entièrement en français et habillé par la mythologie grecque. Kryptos, la chouette d'Athéna, guide l'élève à travers un parcours qui va des tout premiers réflexes jusqu'au métier.

> **Tout tient dans un seul fichier HTML.** Pas de dépendance, pas d'installation, pas de serveur requis pour jouer. Ouvre `index.html` dans un navigateur.

## ✨ En chiffres

- **8 parcours · 57 modules · 503 questions · 48 exercices de code**
- **19 moteurs d'exercice** différents (quiz adaptatif, tri, budget, tribunal, **console de hacking simulée**, chasse aux drapeaux, constructeur de labo…)
- **44 distinctions, 12 rangs, un examen certifiant**
- Thème clair et sombre, responsive, imprimable (cours et diplômes)
- Progression enregistrée localement (localStorage)

## 🗺️ Le contenu

### Édition libre (accessible sans compte)

| Parcours | Guide | Contenu |
|---|---|---|
| **Le Grand Labyrinthe** | Kryptos | 9 chapitres + boss — les fondamentaux : mots de passe, hameçonnage, harcèlement, vie privée, chiffrement… |
| **La Forge de Dédale** | Dédale | 8 ateliers — apprendre la sécurité **par le code**, dans une vraie console JavaScript exécutée |
| **Le Casque d'Hadès** | Hadès | 8 salles — l'OPSEC : modèle de menace, compartimentage, corrélation, discipline |

Plus **l'Académie** (cours magistraux imprimables), **l'Arcade** (épreuves libres), **le Sanctuaire** (remise à niveau adaptative) et **le Panthéon** (distinctions).

### Édition premium (déverrouillée par une clé + compte)

| Bloc | Guide | Contenu |
|---|---|---|
| **Le Second Cercle** | Athéna, Héphaïstos, les Moires | 18 modules pro : défense d'organisation, ingénierie sécurité applicative, renseignement — avec examen certifiant et trousse de modèles |
| **Le Cheval de Bois** | Ulysse | 9 salles de **hacking éthique**, de débutant à pro, dans l'ordre d'un vrai test d'intrusion, avec une **console simulée** qui répond pour de vrai |
| **L'Arsenal** | Héphaïstos | 5 établis sur **les logiciels à installer** : laboratoire, outils réseau et web, protections personnelles, hygiène d'installation |

## 🎓 Pédagogie

- **Niveau adaptatif** : chaque bonne réponse monte une « maîtrise » par compétence, chaque erreur la descend ; au-dessus de 75 %, les questions passent au raisonnement.
- **Mode histoire + cours magistraux en parallèle** : on apprend en jouant, et le cours structuré correspondant est toujours disponible sans chronomètre.
- **Quand un chapitre résiste**, le Sanctuaire le réexplique autrement : une image simple, quatre gestes, une vérification.
- **Le code est réellement exécuté** dans le navigateur (JavaScript), avec l'équivalent Python affiché. Un garde-fou arrête les boucles infinies.
- **L'éthique et la loi françaises** sont au cœur du bloc hacking : périmètre, autorisation écrite, retenue.

## 🚀 Utilisation

```bash
# Le plus simple : ouvrir index.html dans un navigateur.

# Ou servir en local :
node serve.js
# puis http://localhost:8123
```

## 🧪 Contrôle qualité

```bash
node -e "const f=require('fs');const s=f.readFileSync('kryptos.html','utf8');f.writeFileSync('_check.js',s.slice(s.indexOf('<script>')+8,s.lastIndexOf('</'+'script>')))"
node _test.js
```

Le harnais vérifie **157 assertions** : cohérence des 57 modules, des quiz, des moteurs de jeu, du système de comptes et du verrouillage — et surtout que **chacune des 48 solutions de référence passe réellement ses propres tests**.

## ⚠️ À propos de l'édition premium

Le déverrouillage par clé et les comptes sont une **démonstration côté navigateur**. Ils sont parfaits pour montrer, démarcher et tester, mais **ne protègent pas réellement le contenu** : sur un dépôt public, tout est lisible dans la page. Pour une vraie mise en vente, le contenu premium doit être servi par un serveur après vérification du paiement. Les étapes précises sont dans `NOTE-VENTE.txt`.

## 📄 Licence

Voir `LICENSE`. Contenu pédagogique © son auteur. Les noms de logiciels tiers (Kali, Wireshark, Burp Suite…) appartiennent à leurs éditeurs respectifs et ne sont cités qu'à titre pédagogique.

---

*« Le fil d'Ariane a été brisé en neuf fragments. Récupère-les tous, et tu pourras affronter la bête. »*
