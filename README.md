# NPuzzle

Projet fait dans le cadre du cursus de l'[école 42](https://www.42.fr/).

Projet disponible sur cette [page](https://akraysno.github.io/n-puzzle/).

## Objectif

La but de ce projet est de résoudre un **N-Puzzle** (aussi appelé *taquin*) en utilisant l'algorithme de recherche A* ou une de ces variantes.

## Mise en place

### Tailles disponible par defaut:
- 3 x 3
- 4 x 4
- 5 x 5

### Algorithmes de recherche disponible:
*Pour les calculs ci-dessous: `g(x)` représente le nombre de déplacements nécessaires pour arriver à une étape donnée, `h(x)` représente la valeur de l'heuristique et `n` est une constante.*
- A* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`g(x) + h(x)`
- Weighted A* &nbsp;&nbsp;`g(x) + ( n * h(x) )`
- A* Alt. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`g(x) + h(x)` (Une variante de A* fait maison)

### Heuristiques disponible ( `h(x)` ):
- **Manhattan** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Calcul la somme des déplacements, horizontaux et verticaux, nécessaires à chaque pièce pour atteindre leur position finale.
- **Hamming** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Compte de le nombre de pièces mal placées.
- **Cartesian** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Calcul la somme des distances entre les positions de départ et d'arrivé pour chaque pièce grâce à leurs coordonnées.
- **Linear Conflict** &nbsp; Calcul la somme des conflits horizontaux et verticaux pour chaque pièce.
- **Uniform Cost** &nbsp;&nbsp;&nbsp;&nbsp; Représente l'absence d'heuristique. Sa valeur est toujours 0.

### Greedy Search:
Quand cette option est activée `g(x)` est toujours égal à 0.

## Preview

- Configuration du Puzzle

![Image de configuration du Puzzle](https://github.com/Akraysno/n-puzzle/blob/master/resources/preview-1.png)

- Résultat trouvé

![Image d'un résultat trouvé](https://github.com/Akraysno/n-puzzle/blob/master/resources/preview-2.png)

- Modification de la couleur du puzzle

![Image de odification de la couleur du puzzle](https://github.com/Akraysno/n-puzzle/blob/master/resources/preview-3.png)

- Déplacement des pièces terminé

![Image du déplacement des pièces terminé](https://github.com/Akraysno/n-puzzle/blob/master/resources/preview-4.png)