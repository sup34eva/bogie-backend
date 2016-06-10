Bogie Core Engine
========================

Ce projet contient le core du système de l'application Bogie. Il expose une API
en GraphQL pour interagir avec la base de données.

# Lancement
Le fichier `launch.sh` sert déployer le projet sur une instance de serveur
vierge. Il est conçu pour toutner sur une base Red Hat, et utilise l'outil `yum`
pour installer ses dépendances.

Pour un lancement local, il faut installer l'outil `gulp` (avec la commance `npm
install --global gulp-cli`) en plus de node.js et des dépendances locales
(installées via un simple `npm install` grace au fichier package.json). Le
fichier `Gulpfile.js` contient ensuite toutes les configurations nécéssaires
pour lancer le serveur localement avec la commande `gulp`.

# Base de donnée
La liste des serveurs RethinkDB auquel l'instance se connecte est définie dans
une variable d'environnement (ou le fichier `Gulpfile.js` en mode local). Un
dump avec des données de test se trouve dans le fichier `database.tar.gz`.
