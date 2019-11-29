import sys, time, math, copy, random
from enum import Enum     # for enum34, or the stdlib version

# Takes first name and last name via command  
# line arguments and then display them 
debug: bool = True

def listToString(arr: list):
    return ','.join([str(val) for val in arr])

def chunkList(arr: list, size: int):
    return [arr[i:i + size] for i in range(0, len(arr), size)]
  
class TileMoveDirection(Enum):
    TOP = 'TOP',
    RIGHT = 'RIGHT',
    BOTTOM = 'BOTTOM',
    LEFT = 'LEFT',

class State:
    __emptyTileIndex: int
    __arr: list#<int>
    __numRowsOrCols: int
    __neighbours: dict = dict()#Dict<int, list<int>>
    __swip: int = None
    __moveDirection: str
    __goal: list#<int>

    #def __init__(self, args, goal: list<int>):
    def __init__(self, args, goal: list):
        if isinstance(args, int) is True:
            self.__numRowsOrCols = args
            self.__arr = list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
            self.__emptyTileIndex = self.__arr.index(0)
        elif isinstance(args, list) is True:
            #debug == True ? console.log('Construct from array') : 0
            self.__numRowsOrCols = int(math.sqrt(len(args)))
            self.__arr = [val for val in args]#list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
            self.__emptyTileIndex = self.__arr.index(0)
        else:
            self.__numRowsOrCols = args.get_numRowsOrCols()
            self.__emptyTileIndex = args.get_emptyTileIndex()
            self.__arr = [val for val in args.get_arr()]#list(range(0, int(math.pow(self.__numRowsOrCols, 2))))
        self.__goal = goal
        #self.createGraphForNPuzzle()

    #def set_arr(self, arr: list<int>):
    def set_arr(self, arr: list):
        self.__arr = arr

    #def get_arr(self) -> list<int>:
    def get_arr(self) -> list:
        return self.__arr

    def get_swip(self) -> int:
        return self.__swip

    def get_moveDirection(self) -> TileMoveDirection:
        return self.__moveDirection

    #def get_goal(self) -> list<int>:
    def get_goal(self) -> list:
        return self.__goal

    def set_numRowsOrCols(self, numRowsOrCols: int):
        self.__numRowsOrCols = numRowsOrCols
    
    def get_numRowsOrCols(self) -> int:
        return self.__numRowsOrCols

    def set_emptyTileIndex(self, emptyTileIndex: int):
        self.__emptyTileIndex = emptyTileIndex

    def get_emptyTileIndex(self) -> int:
        return self.__emptyTileIndex

    #def equals(self, tileA: State, tileB: State) -> bool:
    def equals(self, tileA, tileB) -> bool:
        return listToString(tileA.get_arr()) == listToString(tileB.get_arr())

    def findEmptyTileIndex(self) -> int:
        return self.__arr.index(0)

    def randomize(self):
        #randomizedArray: list<int> = copy.deepcopy(self.__arr)
        randomizedArray: list = copy.deepcopy(self.__arr)
        random.shuffle(randomizedArray)
        self.__arr = randomizedArray

    def swapWithEmpty(self, num: int):
        try:
            index = self.__arr.index(num)
        except ValueError:
            return
        diff = self.__emptyTileIndex - index
        if diff is -1:
            self.__moveDirection = TileMoveDirection.RIGHT.value
        elif diff is 1:
            self.__moveDirection = TileMoveDirection.LEFT.value
        elif diff is self.get_numRowsOrCols():
            self.__moveDirection = TileMoveDirection.TOP.value
        else:
            self.__moveDirection = TileMoveDirection.BOTTOM.value
        tmp: int = self.__arr[index];
        self.__arr[index] = self.__arr[self.__emptyTileIndex];
        self.__arr[self.__emptyTileIndex] = tmp;
        self.__emptyTileIndex = index;
        self.__swip = num

    def getManhattanCost(self) -> int:
        #goal: list<int> = self.__goal
        goal: list = self.__goal
        cost: int = 0

        for index in range(0, len(self.__arr)):
            num = self.__arr[index]
            if num is 0:
                continue
            
            goalIndex: int = -1
            try:
                goalIndex = goal.index(num)
            except ValueError:
                continue

            if goalIndex is index:
                continue

            gx: int = index % self.__numRowsOrCols
            gy: int = math.floor(index / self.__numRowsOrCols)

            x: int = goalIndex % self.__numRowsOrCols
            y: int = math.floor(goalIndex / self.__numRowsOrCols)

            mancost: int = abs(x - gx) + abs(y - gy)
            cost += mancost;
        #print('cost: '+str(cost)) if debug == True else None
        return cost

    #def getNeighbours(id: int) -> list<int>:
    def getNeighbours(self, id: int) -> list:
        return self.__neighbours.get(id)

    def getNeighboursForIndex(self, index: int) -> list:
        i = int(index / self.__numRowsOrCols)
        j = int(index % self.__numRowsOrCols)
        li: list = []
        if i - 1 >= 0:
            li.append(self.__arr[(i - 1) * self.__numRowsOrCols + j])
        if i + 1 < self.__numRowsOrCols:
            li.append(self.__arr[(i + 1) * self.__numRowsOrCols + j])
        if j - 1 >= 0:
            li.append(self.__arr[i * self.__numRowsOrCols + (j - 1)])
        if j + 1 < self.__numRowsOrCols:
            li.append(self.__arr[i * self.__numRowsOrCols + (j + 1)])
        #print('current index : '+str(index)+', value '+str(self.__arr[index])+', li: ['listToString(li)+']') if debug == True ? else None
        print('\n'+str(index)+'  --  '+str(li))
        return li

    def createGraphForNPuzzle(self) -> None:
        numRowsOrCols: int = self.__numRowsOrCols
        #arr: list<int> = self.__arr
        arr: list = self.__arr
        #print(self.createGridToPrint()) if debug == True else None
        #print('\n\n')
        for i in range(0, numRowsOrCols):
           # print('\n')
            for j in range(0, numRowsOrCols):
               # print('\n' + str(i) + ' -- ' + str(j))
               # print(self.createGridToPrint())
                index: int = i * numRowsOrCols + j
                #debug == True ? print('current index : '+str(index)+', value : '+str(arr[index])) : 0
                #li: list<int> = []
                li: list = []
                if i - 1 >= 0:
                    li.append(arr[(i - 1) * numRowsOrCols + j])
                if i + 1 < numRowsOrCols:
                    li.append(arr[(i + 1) * numRowsOrCols + j])
                if j - 1 >= 0:
                    li.append(arr[i * numRowsOrCols + (j - 1)])
                if j + 1 < numRowsOrCols:
                    li.append(arr[i * numRowsOrCols + (j + 1)])
                #print('current index : '+str(index)+', value '+str(arr[index])+', li: ['listToString(li)+']') if debug == True ? else None
                print('\n'+str(index)+'  --  '+str(li))
                self.__neighbours[index] = li

    def createGridToPrint(self) -> str:
        #arr: list<list<int>> = chunkList(self.__arr, self.__numRowsOrCols)
        arr: list = chunkList(self.__arr, self.__numRowsOrCols)
        numLen = len(str(self.__numRowsOrCols))
        b: str = ''
        for r in arr:
            s: str = ('\n' if len(b) > 0 else '') + '\t'
            for n in r:
                ns = str(n)
                while len(ns) < numLen:
                    ns = ' ' + ns
                s += ns + ' '
            b += s
        return b

class Neighbours:
    #__edges: dict<int, list<int>> = dict()
    __edges: dict = dict()
    #__instance: Neighbours = None;
    __instance = None;

    #def set_instance(self, instance: Neighbours):
    def set_instance(self, instance):
        self.__instance = instance

    #def get_instance(self) -> Neighbours:
    def get_instance(self):
        neighbours = self.__instance
        if neighbours is None:
            neighbours = self.__class__()
        return neighbours

    #def getNeighbours(self, id: int) -> list<int>:
    def getNeighbours(self, id: int) -> list:
        return self.__edges.get(id)

    def createGraphForNPuzzle(self, rowsOrCols: int) -> None:
        for i in range(0, rowsOrCols):
            for j in range(0, rowsOrCols):
                index: int = i * rowsOrCols + j
                #li: list<int> = []
                li: list = []
                if i - 1 >= 0:
                    li.insert((i - 1) * rowsOrCols + j)
                if i + 1 < rowsOrCols:
                    li.insert((i + 1) * rowsOrCols + j);
                if j - 1 >= 0:
                    li.insert(i * rowsOrCols + j - 1);
                if j + 1 < rowsOrCols:
                    li.insert(i * rowsOrCols + j + 1);
                #debug == True ? console.log(index, li) : 0
                self.__edges[index] = li
                #debug == True ? console.log(self._edges.keys()) : 0

class Node:
    __state: State
    #__parent: Node
    __parent = None
    __cost: int
    __depth: int

    def __repr__(self):
        repr = ''
        repr += '{'
        repr += '\tcost: '+str(self.__cost)+','
        repr += '\tdepth: '+str(self.__depth)+','
        repr += '\tboard: '+str(self.__state.get_arr())
        repr += '}'
        return repr

    def set_state(self, state: State):
        self.__state = state

    def get_state(self) -> State:
        return self.__state

    #def set_parent(self, parent: Node):
    def set_parent(self, parent):
        self.__parent = parent

    #def get_parent(self) -> Node:
    def get_parent(self):
        return self.__parent

    def set_cost(self, cost: int):
        self.__cost = cost

    def get_cost(self) -> int:
        return self.__cost

    def set_depth(self, depth: int):
        self.__depth = depth

    def get_depth(self) -> int:
        return self.__depth

    #def __init__(self, state: State, depth: int = 0, parent: Node = None):
    def __init__(self, state: State, depth: int = 0, parent = None):
        self.__state = state
        self.__cost = self.__state.getManhattanCost() + depth
        self.__parent = parent
        self.__depth = depth

    #def isSuperior(self, n1: Node, n2: Node) -> bool:
    def isSuperior(self, n1, n2) -> bool:
        return n1.get_cost() > n2.get_cost()

    #def isInferior(self, n1: Node, n2: Node) -> bool:
    def isInferior(self, n1, n2) -> bool:
        return n1.get_cost() < n2.get_cost()

    def print(self, lineNum: int) -> None:
        string: str = ''
        string += str(lineNum)+' -'
        string += 'Node { '
        for elem in self.__state.get_arr():
            string += str(elem)
        string += ' | D: '+self.depth+', MD: '+self.cost+' }'
        print(string) if debug == True else None

class PriorityQueue:
    #__nodes: dict<list, Node[]> = dict()
    __nodes: dict = dict()

    def count(self) -> int:
        count: int = 0
        for key, nodes in self.__nodes.items():
            count += len(nodes)
        return count

    def maxCost(self) -> int:
        max: int = -1
        for key, nodes in self.__nodes.items():
            max = key if (key > max) or (max is -1) else max
        return max

    def minCost(self) -> int:
        min: int = -1
        for key, nodes in self.__nodes.items():
            min = key if (key < min) or (min is -1) else min
        return min

    def add(self, n: Node) -> None:
        key = n.get_cost()
        pack = self.__nodes.get(key)
        if pack is None:
            pack = []
        pack.append(n)
        self.__nodes[key] = pack

    def getAndRemoveTop(self) -> Node:
        key = self.minCost()
        pack = self.__nodes.get(key)
        self.count()
        node = pack.pop(0)
        self.__nodes[key] = pack
        if len(pack) is 0:
            del self.__nodes[key]

        """
        bestIndex: int = 0
        bestPriority: int = self._nodes[0].get_cost()
        for i in range(0, self.count()):
            if bestPriority > self.__nodes[i].get_cost():
                bestPriority = self.__nodes[i].get_cost()
                bestIndex = i
        """

        return node

class SearchUsingAStar:
    root: Node
    start: State
    goal: State

    def __init__(self, start: State, goal: State):
        self.start = start
        self.goal = goal
        self.root = Node(start, 0, None)            
        print('CURRENT : \n'+self.start.createGridToPrint()) if debug is True else None
        print('GOAL :\n'+self.goal.createGridToPrint()) if debug is True else None

    #def isClosed(self, state: State, closedlist: list<Node>):
    def isClosed(self, state: State, closedlist: list) -> bool:
        stateList = listToString(state.get_arr())
        return next(filter(lambda v: listToString(v.get_state().get_arr()) == stateList, closedlist), None) is not None

    #async
    def search(self):
        global debug
        openlist: PriorityQueue = PriorityQueue()
        #closedlist: list = []
        #closedlist: list<Node> = []
        closedlist: list = []
        openlist.add(self.root)
        closedlist.append(self.root)

        solved: bool = False
        #solution: list<Node> = []
        solution: list = []

        print('OPEN LIST RESTANTE : '+str(openlist.count())) if debug is True else None
        while (openlist.count() > 0) and (solved is not True):
            current: Node = openlist.getAndRemoveTop()
            print('PARENT : \n'+ (current.get_parent().get_state().createGridToPrint() if current.get_parent() is not None else '\n')) if debug is True else None
            print('CURRENT ['+str(current.get_state().get_swip())+'] : \n'+current.get_state().createGridToPrint()) if debug is True else None
            print('GOAL :\n'+self.goal.createGridToPrint()) if debug is True else None
            print('DEPTH : '+str(current.get_depth())) if debug is True else None
            print('COST : '+str(current.get_cost())+' ['+str(openlist.minCost())+' -> '+str(openlist.maxCost())+']') if debug is True else None

            if self.goal.equals(current.get_state(), self.goal) is True:
                # fill the solution.
                solved = True
                s: Node = current
                while s is not None:
                    print('Deeper...')
                    solution.insert(0, s)
                    s = s.get_parent()
                nbMove = len(solution) - 1 # don't count start state
                print('Solution found.. ['+str(len(closedlist))+']\nTotal moves needed : '+str(nbMove))
                break

            zero: int = current.get_state().findEmptyTileIndex()
            #neighbours: list<int> = current.get_state().getNeighbours(zero)
            print('Zero ' + str(zero))
            neighbours: list = current.get_state().getNeighboursForIndex(zero)
            print(neighbours)
            #print('Voisins: '+listToString(neighbours)) if debug === True ? else None

            for i in range(0, len(neighbours)) :
                next = neighbours[i]
                state: State = State(current.get_state(), current.get_state().get_goal())
                # print('Swip tile '+str(next))
                state.swapWithEmpty(next)
                #SwapTiles(next, state, false);
                print('Liste fermees: '+str(len(closedlist))) if debug is True else None
                print('Liste Ouvertes: '+str(openlist.count())) if debug is True else None
                if self.isClosed(state, closedlist) is False:
                    #print('Add to openList')
                    n: Node = Node(state, current.get_depth() + 1)
                    n.set_parent(current)
                    openlist.add(n)
                    closedlist.append(n)
                #else:
                    #print('Already explored')
                #time.sleep(1)
        return solution

if __name__ == "__main__":
    start = int(round(time.time() * 1000))
    print("Output from Python") 
    origin = [2, 5, 7, 0, 3, 4, 6, 1, 8]#[int(val) for val in sys.argv[1].split(',')]
    final = [1, 2, 3, 8, 0, 4, 7, 6, 5]#[int(val) for val in sys.argv[2].split(',')]
    print("Oirgin : ") 
    print(origin)
    print("Final : ") 
    print(final)
    search = SearchUsingAStar( State(origin, final) , State(final, final) )
    res = search.search()
    print(res)
    end = int(round(time.time() * 1000))
    print('Finish in '+str(end - start)+' millisecondes')


[
    {   cost: 17,   depth: 0,   board: [2, 5, 7, 0, 3, 4, 6, 1, 8]}, 
    {   cost: 19,   depth: 1,   board: [2, 5, 7, 3, 0, 4, 6, 1, 8]}, 
    {   cost: 19,   depth: 2,   board: [2, 0, 7, 3, 5, 4, 6, 1, 8]}, 
    {   cost: 19,   depth: 3,   board: [2, 7, 0, 3, 5, 4, 6, 1, 8]}, 
    {   cost: 21,   depth: 4,   board: [2, 7, 4, 3, 5, 0, 6, 1, 8]}, 
    {   cost: 21,   depth: 5,   board: [2, 7, 4, 3, 0, 5, 6, 1, 8]}, 
    {   cost: 21,   depth: 6,   board: [2, 7, 4, 0, 3, 5, 6, 1, 8]}, 
    {   cost: 23,   depth: 7,   board: [0, 7, 4, 2, 3, 5, 6, 1, 8]}, 
    {   cost: 23,   depth: 8,   board: [7, 0, 4, 2, 3, 5, 6, 1, 8]}, 
    {   cost: 23,   depth: 9,   board: [7, 3, 4, 2, 0, 5, 6, 1, 8]}, 
    {   cost: 23,   depth: 10,  board: [7, 3, 4, 2, 1, 5, 6, 0, 8]}, 
    {   cost: 23,   depth: 11,  board: [7, 3, 4, 2, 1, 5, 6, 8, 0]}, 
    {   cost: 23,   depth: 12,  board: [7, 3, 4, 2, 1, 0, 6, 8, 5]}, 
    {   cost: 23,   depth: 13,  board: [7, 3, 0, 2, 1, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 14,  board: [7, 0, 3, 2, 1, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 15,  board: [7, 1, 3, 2, 0, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 16,  board: [7, 1, 3, 0, 2, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 17,  board: [0, 1, 3, 7, 2, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 18,  board: [1, 0, 3, 7, 2, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 19,  board: [1, 2, 3, 7, 0, 4, 6, 8, 5]}, 
    {   cost: 23,   depth: 20,  board: [1, 2, 3, 7, 8, 4, 6, 0, 5]}, 
    {   cost: 23,   depth: 21,  board: [1, 2, 3, 7, 8, 4, 0, 6, 5]}, 
    {   cost: 23,   depth: 22,  board: [1, 2, 3, 0, 8, 4, 7, 6, 5]},
    {   cost: 23,   depth: 23,  board: [1, 2, 3, 8, 0, 4, 7, 6, 5]}
]

[
    {"cost":17,"depth":0,"board":[2,5,7,0,3,4,6,1,8]},
    {"cost":19,"depth":1,"board":[2,5,7,6,3,4,0,1,8]},
    {"cost":19,"depth":2,"board":[2,5,7,6,3,4,1,0,8]},
    {"cost":19,"depth":3,"board":[2,5,7,6,3,4,1,8,0]},
    {"cost":21,"depth":4,"board":[2,5,7,6,3,0,1,8,4]},
    {"cost":21,"depth":5,"board":[2,5,0,6,3,7,1,8,4]},
    {"cost":21,"depth":6,"board":[2,0,5,6,3,7,1,8,4]},
    {"cost":21,"depth":7,"board":[2,3,5,6,0,7,1,8,4]},
    {"cost":21,"depth":8,"board":[2,3,5,0,6,7,1,8,4]},
    {"cost":21,"depth":9,"board":[2,3,5,1,6,7,0,8,4]},
    {"cost":21,"depth":10,"board":[2,3,5,1,6,7,8,0,4]},
    {"cost":23,"depth":11,"board":[2,3,5,1,6,7,8,4,0]},
    {"cost":23,"depth":12,"board":[2,3,5,1,6,0,8,4,7]},
    {"cost":23,"depth":13,"board":[2,3,0,1,6,5,8,4,7]},
    {"cost":23,"depth":14,"board":[2,0,3,1,6,5,8,4,7]},
    {"cost":23,"depth":15,"board":[0,2,3,1,6,5,8,4,7]},
    {"cost":23,"depth":16,"board":[1,2,3,0,6,5,8,4,7]},
    {"cost":25,"depth":17,"board":[1,2,3,6,0,5,8,4,7]},
    {"cost":25,"depth":18,"board":[1,2,3,6,4,5,8,0,7]},
    {"cost":25,"depth":19,"board":[1,2,3,6,4,5,8,7,0]},
    {"cost":25,"depth":20,"board":[1,2,3,6,4,0,8,7,5]},
    {"cost":25,"depth":21,"board":[1,2,3,6,0,4,8,7,5]},
    {"cost":25,"depth":22,"board":[1,2,3,0,6,4,8,7,5]},
    {"cost":25,"depth":23,"board":[1,2,3,8,6,4,0,7,5]},
    {"cost":25,"depth":24,"board":[1,2,3,8,6,4,7,0,5]},
    {"cost":25,"depth":25,"board":[1,2,3,8,0,4,7,6,5]}
]