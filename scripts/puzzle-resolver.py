import sys, time, math, copy, random
# Takes first name and last name via command  
# line arguments and then display them 
debug: bool = False

def listToString(list: list):
    return ','.join(list)

def chunkList(arr: list, size: int):
    return [arr[i:i + size] for i in range(0, len(arr), size)]
  
class TileMoveDirection(Enum):
    TOP = 'TOP',
    RIGHT = 'RIGHT',
    BOTTOM = 'BOTTOM',
    LEFT = 'LEFT',

class State:
    __emptyTileIndex: int
    __arr: List#<int>
    __numRowsOrCols: int
    __neighbours: Dict = dict()#Dict<int, list<int>>
    __swip: int
    __moveDirection: str
    __goal: List#<int>

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

    #def __init__(self, args, goal: list<int>):
    def __init__(self, args, goal: list):
        if isinistance(args, int) == True:
            self.__numRowsOrCols = args
            self.__arr = list(range(0, math.pow(self.__numRowsOrCols, 2))
            self.__emptyTileIndex = self.__arr.index(0)
        elif isinistance(args, list) == True:
            #debug == True ? console.log('Construct from array') : 0
            self.__numRowsOrCols = math.sqrt(len(args))
            self.__arr = list(range(0, math.pow(self.__numRowsOrCols, 2))
            self.__emptyTileIndex = self.__arr.index(0)
        else:
            self.__numRowsOrCols = args.get_numRowsOrCols
            self.__emptyTileIndex = args.get_emptyTileIndex
            self.__arr = list(range(0, math.pow(self.__numRowsOrCols, 2))
        self.__goal = goal
        self.createGraphForNPuzzle()

    def equals(self, tileA: State, tileB: State) -> bool:
        return listToString(tileA.get_arr()) === listToString(tileB.get_arr())

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
        elif diff is self.numRowsOrCols:
            self.__moveDirection = TileMoveDirection.TOP.value
        else:
            self.__moveDirection = TileMoveDirection.BOTTOM.value
        tmp: int = self.__arr[index];
        self.__arr[index] = self.__arr[self.__emptyTileIndex];
        self.__arr[self.__emptyTileIndex] = tmp;
        self.__emptyTileIndex = index;
        self.__swip = num

    def getManhattanCost(self) -> int:
        goal: list<int> = self.__goal
        cost: int = 0

        for index in range(0, len(self.__arr)):
            num = self.__arr[index]
            if num is 0:
                continue
            
            goalIndex: int = -1
            try:
                goalIndex = goal.indexOf(num)
            except ValueError:
                continue

            if goalIndex is index:
                continue

            gx: int = index % self.__numRowsOrCols
            gy: int = math.floor(index / self.__numRowsOrCols)

            x: int = goalIndex % self.__numRowsOrCols
            y: int = math.floor(goalIndex / self.__numRowsOrCols)

            mancost: int = math.abs(x - gx) + math.abs(y - gy)
            cost += mancost;
        #print('cost: '+str(cost)) if debug == True else None
        return cost

    def getNeighbours(id: int) -> list<int>:
        return self.__neighbours.get(id)

    def createGraphForNPuzzle(self) -> None:
        numRowsOrCols: int = self.__numRowsOrCols
        arr: list<int> = self.__arr
        #print(self.createGridToPrint()) if debug == True else None
        for i in range(0, numRowsOrCols):
            for j in range(0, numRowsOrCols):
                index: int = i * numRowsOrCols + j
                #debug == True ? print('current index : '+str(index)+', value : '+str(arr[index])) : 0
                li: list<int> = []
                if i - 1 >= 0:
                    li.insert(arr[(i - 1) * numRowsOrCols + j])
                if i + 1 < numRowsOrCols:
                    li.insert(arr[(i + 1) * numRowsOrCols + j])
                if j - 1 >= 0:
                    li.insert(arr[i * numRowsOrCols + (j - 1)])
                if j + 1 < numRowsOrCols:
                    li.insert(arr[i * numRowsOrCols + (j + 1)])
                #print('current index : '+str(index)+', value '+str(arr[index])+', li: ['listToString(li)+']') if debug == True ? else None
                self.__neighbours[index] = li

    def createGridToPrint(self) {
        arr: list<list<int>> = chunkList(self.__arr, self.__numRowsOrCols)
        numLen = len(str(self.__numRowsOrCols))
        b: str = ''
        for r in arr:
            s: str = (len(b) > 0 ? '\n' : '') + '\t'
            for n in r:
                ns = str(n)
                while len(ns) < numLen:
                    ns = ' ' + ns
                s += ns + ' '
            b += s
        return b

class Neighbours:
    __edges: Dict<int, list<int>> = dict()
    __instance: Neighbours = None;

    def set_instance(self, instance: Neighbours):
        self.__instance = instance

    def get_instance(self) -> Neighbours:
        return self.__instance || new Neighbours()

    def getNeighbours(self, id: int) -> list<int>:
        return self.__edges.get(id)

    def createGraphForNPuzzle(self, rowsOrCols: int) -> None:
        for i int range(0, rowsOrCols):
            for j in range(0, rowsOrCols):
                index: int = i * rowsOrCols + j
                li: list<int> = []
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
    __parent: Node
    __cost: int
    __depth: int

    def set_state(self, state: State):
        self.__state = state

    def get_state(self) -> State:
        return self.__state

    def set_parent(self, parent: Node):
        self.__parent = parent

    def get_parent(self) -> Node:
        return self.__parent

    def set_cost(self, cost: number):
        self.__cost = cost

    def get_cost(self) -> int:
        return self.__cost

    def set_depth(self, depth: int):
        self.__depth = depth

    def get_depth(self) -> int:
        return self.__depth

    def __init__(self, state: State, depth: int = 0, parent: Node = None):
        self.__state = state
        self.__cost = self.__state.getManhattanCost() + depth
        self.__parent = parent
        self.__depth = depth

    def isSuperior(self, n1: Node, n2: Node) -> bool:
        return n1.get_cost() > n2.get_cost()

    def isInferior(self, n1: Node, n2: Node) -> bool:
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
    __nodes: Dict<list, Node[]> = dict()

    def count(self) -> int:
        count: int = 0
        for key, nodes in self.__nodes.items():
            count += len(nodes)
        return count

    def maxCost(self) -> int:
        max: int = 0
        for key, nodes in self.__nodes.items():
            max = key if key > max else max
        return max

    def minCost(self) -> int:
        min: int = 0
        for key, nodes in self.__nodes.items():
            min = key if key > min else min
        return min

    def add(self, n: Node) -> None:
        key = n.cost
        pack = self.__nodes.get(key)
        if pack is None:
            pack = []
        pack.insert(n)
        self.__nodes[key] = pack

    def getAndRemoveTop(self) -> Node:
        key = self.minCost()
        pack = self.__nodes.get(key)
        node = pack.pop(0)
        self.__nodes[key] = node
        if len(pack) is 0:
            del self.__nodes[key]

        """
        bestIndex: int = 0
        bestPriority: int = self._nodes[0].cost
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

    def __init__(start: State, goal: State):
        self.start = start
        self.goal = goal
        self.root = new Node(start, 0, null)

    def isClosed(self, state: State, closedlist: list<Node>):
        stateList = listToString(state.arr)
        return next(filter(lambda v: listToString(v.state.arr) == stateList, closedList), None) is not None

    #async
    def search(self):
        openlist: PriorityQueue = new PriorityQueue()
        closedlist: list<Node> = []
        openlist.add(self.root)
        closedlist.push(self.root)

        solved: bool = False
        solution: list<Node> = []
        
        #debug === True ? console.log('OPEN LIST RESTANTE : ', openlist.count()) : 0
        while (openlist.count() > 0) and (solved is not True):
            current: Node = openlist.getAndRemoveTop()
            #debug === True ? console.log('PARENT : \n', current.parent ? current.parent.state.createGridToPrint() : '\n') : 0
            #debug === True ? console.log('CURRENT [' + current.state.swip + '] : \n', current.state.createGridToPrint()) : 0
            #debug === True ? console.log('GOAL :\n', self.goal.createGridToPrint()) : 0
            #debug === True ? console.log('DEPTH : ' + current.depth) : 0
            #debug === True ? console.log('COST : ', current.cost, '[', openlist.minCost(), ' -> ', openlist.maxCost(), ']') : 0
            if self.goal.equals(current.state, self.goal) is True:
                # fill the solution.
                solved = True
                s: Node = current
                while s is not None:
                    solution.insert(0, s)
                    s = s.parent

                nbMove = len(solution) # don't count start state
                print('Solution found.. ['+str(len(closedlist))+']\nTotal moves needed : '+str(nbMove))
                break

            zero: int = current.state.findEmptyTileIndex()
            neighbours: list<int> = current.state.getNeighbours(zero)
            #print('Voisins: '+listToString(neighbours)) if debug === True ? else None

            for i in range(0, len(neighbours)) :
                next = neighbours[i]
                state: State = new State(current.state, current.state.goal)
                # print('Swip tile '+str(next))
                state.swapWithEmpty(next)
                #SwapTiles(next, state, false);
                print('Liste fermees: '+str(len(closedlist))) if debug === True else None
                if self.isClosed(state, closedlist) is False:
                    #print('Add to openList')
                    n: Node = new Node(state, current.depth + 1)
                    n.parent = current
                    openlist.add(n)
                    closedlist.append(n)
                #else:
                    #print('Already explored')
                #time.sleep(1)
        return solution







if __name__ == "__main__":
    print("Output from Python") 
    print("First name: " + sys.argv[1]) 
    print("Last name: " + sys.argv[2]) 
