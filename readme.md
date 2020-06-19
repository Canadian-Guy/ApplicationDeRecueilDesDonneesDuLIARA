La possibilité de modifier les commandes, web sockets et activités à partir de l'application va peut-être être retirée
dans le future si elle n'est pas utilies pour les utilisateurs pour alléger l'application et passer uniquement par
DefaultValues.json.

Pour utiliser les commandes vocales sur **mobile**, on doit utiliser **https**. Pour utiliser des web sockets avec https, 
ils doivent être des **wss**.

#### **Notes pour les commandes vocales:**
- Si une sous activité contient les mots "première, deuxième, ...", ceux-ci doivent être "1er, 2e, ...".

#### **Exemple pour "DefaultValues.json":**
```json
{
  "WebSockets": {
    "WebSocketName1": "ws://192.168.0.159:3000",
    "WebSocketName2": "ws://192.168.0.159:3001"
  },
  "Activities": {
    "Activité 1": [
      "première sous-activité",
      "deuxième sous-activité"
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
    ]
  }
}
```
