from typing import List


class Boggle:
    def __init__(self, grid: List[List[str]], dictionary: List[str]):
        self.grid = [[c.lower() for c in row] for row in grid]
        self.dictionary = {w.lower() for w in dictionary}
        self.rows = len(grid)
        self.cols = len(grid[0]) if self.rows > 0 else 0
        self.prefixes = set()
        for w in self.dictionary:
            for i in range(1, len(w) + 1):
                self.prefixes.add(w[:i])

    def getSolution(self) -> List[str]:
        found = set()
        visited = [[False] * self.cols for _ in range(self.rows)]
        dirs = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1), (0, 1),
            (1, -1), (1, 0), (1, 1)
        ]

        def dfs(r, c, cur):
            val = self.grid[r][c]

            # Fix for line too long (E501)
            nxt = (
                cur + (val if val != 'qu' else 'qu')
            )

            if len(nxt) >= 3 and nxt in self.dictionary:
                found.add(nxt)
            if nxt not in self.prefixes:
                return

            visited[r][c] = True
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if (
                    0 <= nr < self.rows
                    and 0 <= nc < self.cols
                    and not visited[nr][nc]
                ):
                    dfs(nr, nc, nxt)
            visited[r][c] = False

        for i in range(self.rows):
            for j in range(self.cols):
                dfs(i, j, '')

        return sorted(found)


# Example usage
grid = [
    ["T", "W", "Y", "R"],
    ["E", "N", "P", "H"],
    ["G", "Z", "Qu", "R"],
    ["O", "N", "T", "A"]
]

dictionary = [
    "art", "ego", "gent", "get", "net", "new", "newt", "prat",
    "pry", "qua", "quart", "quartz", "rat", "tar", "tarp", "ten",
    "went", "wet", "arty", "rhr", "not", "quar"
]

solver = Boggle(grid, dictionary)
solutions = solver.getSolution()
print(solutions)
print(len(solutions))
print("Solved boggle and printed solutions and count")
