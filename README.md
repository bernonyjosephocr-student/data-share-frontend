# DataShare – Frontend

Application frontend de **DataShare**, une plateforme de partage de fichiers développée avec Angular.

L'application permet aux utilisateurs de partager des fichiers, de gérer leurs partages et de télécharger des fichiers à partir d'un lien de téléchargement.

## 1. Technologies utilisées

| Technologie | Version |
|---|---|
| Angular | 21.2.x |
| Angular CLI | 21.2.x |
| TypeScript | 5.9.3 |
| Node.js | 22.23.x |
| npm | 10.9.x |
| Jest | 30.5.x |
| jest-preset-angular | 17.0.x |
| Cypress | 16.3.x |

## 2. Prérequis

Avant de commencer, les outils suivants doivent être installés :

- Node.js (version compatible avec Angular 21).
- npm.
- Git.

Le backend DataShare doit également être démarré pour permettre à l'application frontend de communiquer avec l'API.

Par défaut, l'application frontend est accessible sur le port `4200` et le backend sur le port `8080`.

## 3. Installation

Récupérer le projet :

```bash
git clone <URL_DU_DEPOT>
cd data-share-frontend
```

Installer les dépendances :

```bash
npm ci
```

La commande `npm ci` installe les dépendances à partir du fichier `package-lock.json`, afin de reproduire l'environnement de développement défini par le projet.

## 4. Serveur de développement

Pour démarrer le serveur de développement :

```bash
npm run start
```

L'application est accessible à l'adresse :

```text
http://localhost:4200/
```

Le serveur recharge automatiquement l'application lors des modifications apportées aux fichiers sources.

## 5. Compilation

Pour compiler l'application :

```bash
npm run build
```

Les fichiers générés sont placés dans le répertoire `dist/`.

La compilation utilise la configuration de production définie dans le projet.

Pour lancer une compilation en mode développement avec surveillance des modifications :

```bash
npm run watch
```

## 6. Tests unitaires

Les tests unitaires sont exécutés avec **Jest**, configuré avec `jest-preset-angular`.

Pour exécuter l'ensemble des tests :

```bash
npm test
```

Pour lancer les tests en mode surveillance :

```bash
npm run test-watch
```

### Couverture de tests

Pour exécuter les tests et générer le rapport de couverture :

```bash
npx jest --coverage
```

Le rapport détaillé est généré dans le répertoire :

```text
coverage/
```

Il permet notamment de consulter la couverture des instructions, des branches, des fonctions et des lignes de code.

## 7. Tests end-to-end (E2E)

Les tests end-to-end sont réalisés avec **Cypress**.

Ils permettent de vérifier les principaux parcours utilisateurs en interaction avec l'application et le backend.

### Mode interactif

Pour ouvrir l'interface graphique de Cypress :

```bash
npx cypress open
```

Dans l'interface, sélectionner le navigateur souhaité (Firefox, par exemple), puis choisir les scénarios de test à exécuter.

### Mode ligne de commande

Pour exécuter les tests sans interface graphique :

```bash
npx cypress run
```

Les tests E2E nécessitent que le frontend et le backend soient démarrés et accessibles.

## 8. Audit de sécurité des dépendances

Le projet utilise npm pour contrôler les vulnérabilités connues de ses dépendances.

Pour auditer l'ensemble des dépendances :

```bash
npm audit
```

Pour limiter l'audit aux dépendances de production :

```bash
npm audit --omit=dev
```

Cette seconde commande permet de distinguer les vulnérabilités susceptibles d'affecter l'application en production de celles qui concernent uniquement l'environnement de développement et les outils de test.

## 9. Génération de composants Angular

Angular CLI permet de générer les différents éléments de l'application.

Par exemple, pour créer un composant :

```bash
npx ng generate component component-name
```

Pour consulter les commandes et options disponibles :

```bash
npx ng generate --help
```

## 10. Structure du projet

Les principaux éléments du projet sont organisés dans le répertoire `src/app`.

On y retrouve notamment :

- `components/` : composants réutilisables de l'interface.
- `pages/` : pages correspondant aux différentes fonctionnalités de l'application.
- `services/` : services chargés de la communication avec le backend et de la gestion des données.
- `guards/` : protections des routes nécessitant une authentification.
- `interceptors/` : interception des requêtes HTTP, notamment pour la transmission du jeton d'authentification.

Les autres fichiers de configuration Angular, TypeScript, Jest et Cypress se trouvent à la racine du projet.

## 11. Ressources

La documentation officielle d'Angular et les documentations des outils utilisés constituent les principales références pour le développement et la maintenance du frontend.