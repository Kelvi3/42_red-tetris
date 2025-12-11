Pour atteindre 70% de couverture de test, vous devez cibler la logique métier
  critique du jeu (règles, gestion des états) tant sur le backend que sur le
  frontend.

  Voici la liste des tests à implémenter :

  1. Backend (Node.js / Mocha)
  Actuellement, vous avez des tests pour les pièces (piece_test.js). Il faut
  couvrir les classes Game et Player qui contiennent la logique principale du
  serveur.

   * Tests Unitaires pour `Game` (`src/server/game.js`) :
       * Gestion des joueurs : Tester addPlayer et removePlayer. Vérifier que si
         l'hôte quitte (isHost), un autre joueur devient hôte automatiquement.
       * Démarrage du jeu : Tester startGame. Vérifier que isStarted passe à true,
         que la pieceSequence est générée, et que tous les joueurs reçoivent une
         pièce et un plateau vide.
       * Séquence de pièces : Tester generatePieceSequence pour voir si elle crée
         bien une suite aléatoire, et getNextPiece pour vérifier qu'elle boucle ou
         s'étend correctement.
       * Fin de partie : Tester checkGameOver (vrai si 0 ou 1 seul joueur vivant
         reste).

   * Tests Unitaires pour `Player` (`src/server/player.js`) :
       * Spectre (Shadow) : Tester updateSpectrum. C'est crucial pour le mode
         multijoueur (malus). Simuler un plateau avec des blocs et vérifier que le
         tableau spectrum retourne les bonnes hauteurs.

  2. Frontend (React / Vite)
  Le frontend n'a actuellement aucun système de test configuré. Vous devrez
  d'abord installer Vitest (compatible avec Vite) et React Testing Library.

  Une fois installé, voici les tests prioritaires :

   * Tests Unitaires (Logique pure) - Priorité Haute :
       * Collisions (`src/components/Game/gameHelper.ts`) : C'est le cœur du jeu.
           * Tester checkCollision :
               * Cas simple : Déplacement valide dans le vide.
               * Cas limite : Collision avec le mur gauche/droit.
               * Cas limite : Collision avec le sol.
               * Cas jeu : Collision avec une autre pièce déjà posée.
       * Création de plateau : Tester que createBoard retourne bien une grille
         vide de la bonne taille.

   * Tests de Hooks (Logique d'état) - Priorité Moyenne :
       * Hook `useTetris` : Tester l'état initial (score à 0, pas de game over).
         Simuler une action (touche bas) et vérifier que la position de la pièce
         change.

   * Tests de Composants (Rendu) :
       * `Board.tsx` : Vérifier qu'il affiche le bon nombre de cellules.
       * `Piece.tsx` : Vérifier qu'une pièce 'T' ou 'I' rend bien la bonne
         forme/couleur.

  Résumé du plan d'action :
   1. Compléter les tests unitaires Backend (Game et Player).
   2. Installer Vitest sur le Frontend.
   3. Tester la fonction checkCollision du Frontend (c'est souvent là que se
      cachent les bugs).