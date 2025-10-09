frontend/
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── Board.tsx
│   │   │   ├── Piece.tsx
│   │   │   ├── NextPiece.tsx
│   │   │   └── GameInfo.tsx
│   │   ├── Lobby/
│   │   │   ├── RoomList.tsx
│   │   │   ├── PlayerList.tsx
│   │   │   └── CreateRoom.tsx
│   │   └── UI/
│   │       ├── Header.tsx
│   │       └── Leaderboard.tsx
│   ├── store/
│   │   ├── index.js (store Redux)
│   │   ├── slices/
│   │   │   ├── gameSlice.js
│   │   │   ├── roomSlice.js
│   │   │   └── playerSlice.js
│   │   └── thunks/
│   │       └── socketThunks.js
│   ├── services/
│   │   └── socket.js (config socket.io)
│   ├── utils/
│   │   ├── tetrominos.js
│   │   └── gameLogic.js
│   ├── App.tsx
│   └── main.tsx
├── .env
└── package.json



Étapes de réalisation :
1. Bases React (1-2 jours)

Crée un composant simple qui affiche une grille 10x20
Ajoute un carré coloré dans la grille
Fais bouger le carré avec les touches clavier

2. Redux (1 jour)

Installe Redux dans ton projet
Crée un store avec l'état du board (tableau 10x20)
Connecte ton composant au store

3. Socket.io (1 jour)

Connecte-toi au serveur backend
Écoute les événements du serveur
Envoie des événements au serveur

4. Logique Tetris (2-3 jours)

Crée les 7 pièces (I, O, T, S, Z, J, L)
Rotation des pièces
Collision et placement
Suppression des lignes complètes

5. Multi-joueur (2 jours)

Lobby/création de room
Synchronisation avec les autres joueurs
Affichage des boards adverses

6. Tests (1-2 jours)

Tests unitaires avec Vitest
Atteindre 70% de couverture

Similitudes avec Flutter :

Composants = Widgets
useState = setState
Redux = Provider/Riverpod
Props = paramètres de constructeur