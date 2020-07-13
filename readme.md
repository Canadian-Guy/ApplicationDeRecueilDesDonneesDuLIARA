Pour démarrer le websocket fourni, faire "node index.js" à ../WebSocketServer. Pour l'utiliser en local,
ajouter ws://127.0.0.1:3000 aux sources de données.

Pour se connecter, un server doit être accessible (Non compris pour le moment car il n'est pas fini.)

Pour utiliser les commandes vocales sur **mobile**, on doit utiliser **https**. Pour utiliser des web sockets avec https, 
ils doivent être des **wss**.

####Comptes par défaut
- *Nom d'utilisateur* - *Mot de passe* - *Admin*
- Admin - MightyAdmin - admin
- Dum - dumdum - non admin

####Rendre un élément visible uniquement pour les admins
Pour qu'un élément ne soit visible que pour les admins, ajouter la classe "admin" à l'élément et s'assurer que le 
script "ContentFilter.js" est chargé en dernier.

####Compte admin par défaut :
- nom d'utilisateur : **Admin** 
- Mot de passe : **MightyAdmin**

#### Notes pour les commandes vocales 
- Si une sous activité contient les mots "première, deuxième, ...", ceux-ci doivent être "1er, 2e, ...".
- Les commandes vocales fonctionnent uniquement si l'application est sur un serveur.

#### Exemple pour "DefaultValues.json" 
```json
{
  "WebSockets": {
    "WebSocketName1": "ws://10.0.0.25:3000",
    "WebSocketName2": "ws://10.0.0.25:3001"
  },
  "Activities": {
    "Activité 1": [
      "1ere sous-activité",
      "2e sous-activité"
    ],
    "Activité 2": [
      "oh wow une autre sous-activité par défaut!"
    ]
  },
  "Commands": {
    "StartCommands": [
      "commencer",
      "démarrer",
      "débuter",
      "start",
      "go"
    ],
    "NextCommands": [
      "suivant",
      "next",
      "prochain",
      "prochaine",
      "skip"
    ],
    "StopCommands": [
      "arrêt",
      "arrêter",
      "stop",
      "annuler",
      "cancel"
    ],
    "ChangeSubCommands": [
      "sous-activité"
    ],
    "DeselectWords": [
      "aucun",
      "aucune"
    ]
  },
  "MinimumTime": 2000
}
```
