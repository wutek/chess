import { ALL_FIELDS, FIELD, Field } from './field.js'
import { Move } from './move.js'

export const FIELD_TYPE = Object.freeze({
   'INVALID': 1,
   'EMPTY': 2,
   'WHITE': 3,
   'BLACK': 4,
})

export const HIGHLIGHT = Object.freeze({
   'NONE': 1,
   'SELECTED': 2,
   'HIGHLIGHTED': 3,
})

const DIRECTIONS = [
   new Field(0, 1),
   new Field(0, -1),
   new Field(1, 0),
   new Field(-1, 0)
]

const DIAGONAL_DIRECTIONS = [
   new Field(1, 1),
   new Field(1, -1),
   new Field(-1, -1),
   new Field(-1, 1)
]

const KNIGHT_MOVES = [
   new Field(-2, -1), new Field(-2, 1),
   new Field(-1, -2), new Field(-1, 2),
   new Field(1, -2), new Field(1, 2),
   new Field(2, -1), new Field(2, 1)
]

const KING_MOVES = [
   new Field(1, -1), new Field(1, 0), new Field(1, 1),
   new Field(0, -1), new Field(0, 1),
   new Field(-1, -1), new Field(-1, 0), new Field(-1, 1)
]

const CASTLE = {
   WHITE_SHORT: new Move(new Field(7, 0), new Field(5, 0), FIELD.ROOK_WHITE),
   WHITE_LONG: new Move(new Field(0, 0), new Field(3, 0), FIELD.ROOK_WHITE),
   BLACK_SHORT: new Move(new Field(7, 7), new Field(5, 7), FIELD.ROOK_BLACK),
   BLACK_LONG: new Move(new Field(0, 7), new Field(3, 7), FIELD.ROOK_BLACK)
}

const one_up = new Field(0, 1)
const two_up = new Field(0, 2)
const one_down = new Field(0, -1)
const two_down = new Field(0, -2)
const two_right = new Field(2, 0)
const one_left = new Field(-1, 0)
const two_left = new Field(-2, 0)
const three_left = new Field(-3, 0)
const pawn_attack_moves = [new Field(1, 1), new Field(-1, 1)]
const black_pawn_attack_moves = [new Field(1, -1), new Field(-1, -1)]

/** Represents chess board. */
export class Board {
   /** @type {Number[][]} */
   #board = []
   #available_castle = {
      WHITE_SHORT: true,
      WHITE_LONG: true,
      BLACK_SHORT: true,
      BLACK_LONG: true
   }

   /**
    * @param {Number[][]} array - two dimensional array representing chess board.
    * @param {{WHITE_SHORT:boolean, WHITE_LONG:boolean, BLACK_SHORT:boolean, BLACK_LONG:boolean}} castle available castles
    */
   constructor (array, castle = { WHITE_SHORT: true, WHITE_LONG: true, BLACK_SHORT: true, BLACK_LONG: true }) {
      for (let i = 0; i < 8; i++) {
         this.#board[i] = []
         for (let j = 0; j < 8; j++)
            this.#board[i][j] = array[i][j]
      }

      Object.assign(this.#available_castle, castle)
   }

   /**
    * @param {Field} f
    *
    * @return {Number}
    **/
   field (f) {
      if (f.column < 0 || f.row < 0 || f.column > 7 || f.row > 7)
         return FIELD.INVALID

      return this.#board[f.column][f.row]
   }

   /**
    * @param {Field} f
    *
    * @return {Number}
    **/
   getFieldType (f) {
      if (f.column < 0 || f.column > 7 || f.row < 0 || f.row > 7)
         return FIELD_TYPE.INVALID

      if (this.#board[f.column][f.row] === FIELD.EMPTY)
         return FIELD_TYPE.EMPTY

      if (this.#board[f.column][f.row] > FIELD.KING_WHITE)
         return FIELD_TYPE.BLACK

      return FIELD_TYPE.WHITE
   }

   copy () {
      return new Board(this.#board, this.#available_castle)
   }

   /**
    * Sets value of the field f on the board to the value of n.
    *
    * @param {Field} f
    * @param {Number} n
    */
   setField (f, n) {
      this.#board[f.column][f.row] = n
   }

   /**
    * @param {Move} move
    */
   applyMove (move) {
      this.setField(move.From, FIELD.EMPTY)
      this.setField(move.To, move.FromValue)

      if (this.field(move.To) === FIELD.PAWN_WHITE && move.To.row === 7)
         this.setField(move.To, FIELD.QUEEN_WHITE)

      if (this.field(move.To) === FIELD.PAWN_BLACK && move.To.row === 0)
         this.setField(move.To, FIELD.QUEEN_BLACK)

      if (move.FromValue === FIELD.KING_WHITE) {
         if (move.To.column === 6 && move.To.row === 0 && move.From.column === 4 && move.From.row === 0)
            this.applyMove(CASTLE.WHITE_SHORT)

         if (move.To.column === 2 && move.To.row === 0 && move.From.column === 4 && move.From.row === 0)
            this.applyMove(CASTLE.WHITE_LONG)
      }

      if (move.FromValue === FIELD.KING_BLACK) {
         if (move.To.column === 6 && move.To.row === 7 && move.From.column === 4 && move.From.row === 7)
            this.applyMove(CASTLE.BLACK_SHORT)

         if (move.To.column === 2 && move.To.row === 7 && move.From.column === 4 && move.From.row === 7)
            this.applyMove(CASTLE.BLACK_LONG)
      }
   }

   /**
    * @param {Move} move
    */
   disableFutureCastlePossibility (move) {
      if (move.From.column === 0 && move.From.row === 0 || move.To.column === 0 && move.To.row === 0)
         this.#available_castle.WHITE_LONG = false

      if (move.From.column === 7 && move.From.row === 0 || move.To.column === 7 && move.To.row === 0)
         this.#available_castle.WHITE_SHORT = false

      if (move.From.column === 0 && move.From.row === 7 || move.To.column === 0 && move.To.row === 7)
         this.#available_castle.BLACK_LONG = false

      if (move.From.column === 7 && move.From.row === 7 || move.To.column === 7 && move.To.row === 7)
         this.#available_castle.BLACK_SHORT = false

      if (move.FromValue === FIELD.KING_WHITE) {
         this.#available_castle.WHITE_SHORT = false
         this.#available_castle.WHITE_LONG = false
      }

      if (move.FromValue === FIELD.KING_BLACK) {
         this.#available_castle.BLACK_LONG = false
         this.#available_castle.BLACK_SHORT = false
      }
   }

   /**
    * @param {Move} move
    */
   revertMove (move) {
      this.setField(move.To, move.ToValue)
      this.setField(move.From, move.FromValue)

      if (move.FromValue === FIELD.KING_WHITE) {
         if (move.To.column === 6 && move.To.row === 0 && move.From.column === 4 && move.From.row === 0)
            this.revertMove(CASTLE.WHITE_SHORT)

         if (move.To.column === 2 && move.To.row === 0 && move.From.column === 4 && move.From.row === 0)
            this.revertMove(CASTLE.WHITE_LONG)
      }
   }

   /**
    * Returns array with all possible moves from field f.
    *
    * @param {Field} f
    * @returns {Move[]}
    */
   getAvailableMovesFromField (f) {
      const figure = this.field(f)
      const enemy_color = this.getFieldType(f) === FIELD_TYPE.WHITE ? FIELD_TYPE.BLACK : FIELD_TYPE.WHITE
      const can_move = new Set([FIELD_TYPE.EMPTY, enemy_color])
      const x = f.column
      const y = f.row

      /** @type {Move[]} */
      const moves = []

      switch (figure) {
         case FIELD.EMPTY:
            return []

         case FIELD.PAWN_WHITE:
            if (this.#board[x][y + 1] === FIELD.EMPTY) {
               moves.push(new Move(f, f.add(one_up), FIELD.PAWN_WHITE))

               if (y === 1 && this.#board[x][3] === FIELD.EMPTY)
                  moves.push(new Move(f, f.add(two_up), figure))
            }

            for (let m of pawn_attack_moves)
               if (this.getFieldType(f.add(m)) === FIELD_TYPE.BLACK)
                  moves.push(new Move(f, f.add(m), FIELD.PAWN_WHITE, this.field(f.add(m))))
            break

         case FIELD.PAWN_BLACK:
            if (this.#board[x][y - 1] === FIELD.EMPTY) {
               moves.push(new Move(f, f.add(one_down), figure))

               if (y === 6 && this.#board[x][4] === FIELD.EMPTY)
                  moves.push(new Move(f, f.add(two_down), figure))
            }

            for (let m of black_pawn_attack_moves)
               if (this.getFieldType(f.add(m)) === FIELD_TYPE.WHITE)
                  moves.push(new Move(f, f.add(m), figure, this.field(f.add(m))))
            break

         case FIELD.ROOK_WHITE:
         case FIELD.ROOK_BLACK:
            this.#addMovesInDirection(f, moves, enemy_color, figure, DIRECTIONS)
            break

         case FIELD.BISHOP_WHITE:
         case FIELD.BISHOP_BLACK:
            this.#addMovesInDirection(f, moves, enemy_color, figure, DIAGONAL_DIRECTIONS)
            break

         case FIELD.QUEEN_WHITE:
         case FIELD.QUEEN_BLACK:
            this.#addMovesInDirection(f, moves, enemy_color, figure, DIRECTIONS)
            this.#addMovesInDirection(f, moves, enemy_color, figure, DIAGONAL_DIRECTIONS)
            break

         case FIELD.KNIGHT_WHITE:
         case FIELD.KNIGHT_BLACK:
            for (let move of KNIGHT_MOVES)
               if (can_move.has(this.getFieldType(f.add(move))))
                  moves.push(new Move(f, f.add(move), figure, this.field(f.add(move))))
            break

         case FIELD.KING_WHITE:
            if (this.isShortWhiteCastleAvailable())
               moves.push(new Move(f, f.add(two_right), figure))

            if (
               this.CastleLongWhite &&
               this.field(f.add(one_left)) === FIELD.EMPTY &&
               this.field(f.add(two_left)) === FIELD.EMPTY &&
               this.field(f.add(three_left)) === FIELD.EMPTY &&
               !this.isCheckedByBlack(f) &&
               !this.isCheckedByBlack(f.add(one_left)) &&
               this.field(f.add(two_left).add(two_left)) === FIELD.ROOK_WHITE
            ) {
               moves.push(new Move(f, f.add(two_left), figure, this.field(f.add(two_left))))
            }

            for (let move of KING_MOVES)
               if (can_move.has(this.getFieldType(f.add(move))))
                  moves.push(new Move(f, f.add(move), figure, this.field(f.add(move))))
            break

         case FIELD.KING_BLACK:
            for (let move of KING_MOVES)
               if (can_move.has(this.getFieldType(f.add(move))))
                  moves.push(new Move(f, f.add(move), figure, this.field(f.add(move))))
            break
      }

      // Remove moves that lead to the king being checked.
      return moves.filter(move => {
         this.applyMove(move)
         const result = !(this.isCheckedBy(enemy_color))
         this.revertMove(move)

         return result
      })
   }

   isShortWhiteCastleAvailable () {
      return (
         this.CastleShortWhite
         && this.#board[5][0] === FIELD.EMPTY
         && this.#board[6][0] === FIELD.EMPTY
         && this.#board[7][0] === FIELD.ROOK_WHITE
         && !this.isCheckedByBlack(new Field(4, 0))
         && !this.isCheckedByBlack(new Field(5, 0))
      )
   }

   /**
    * Returns array of all possible moves for a given color.
    *
    * @param {Number} color
    */
   getAllPossibleMoves (color) {
      /** @type Move[] */
      const allMoves = []

      for (const f of ALL_FIELDS)
         if (this.getFieldType(f) === color)
            this.getAvailableMovesFromField(f).forEach((move) => {
               allMoves.push(move)
            })

      return allMoves
   }

   /**
    * @param {Field} field
    * @param {Move[]} moves
    * @param {Number} enemy_color
    * @param {Number} figure
    * @param {Field[]} DIRECTIONS
    */
   #addMovesInDirection (field, moves, enemy_color, figure, DIRECTIONS) {
      for (const direction of DIRECTIONS) {
         const mutableField = field.copy()

         mutableField.move(direction)

         while (this.getFieldType(mutableField) === FIELD_TYPE.EMPTY) {
            moves.push(new Move(field, mutableField.copy(), figure))
            mutableField.move(direction)
         }

         if (this.getFieldType(mutableField) === enemy_color)
            moves.push(new Move(field, mutableField.copy(), figure, this.field(mutableField)))
      }
   }

   /**
    * @param {Number} color
    * @returns {boolean}
    */
   isCheckedBy (color) {
      if (color === FIELD_TYPE.WHITE)
         return this.#isCheckedByWhite(this.BlackKingPosition)

      if (color === FIELD_TYPE.BLACK)
         return this.isCheckedByBlack(this.WhiteKingPosition)

      throw 'invalid color passed to method Board::isCheckedBy()'
   }

   /**
    * @param {Field} f
    * @returns {boolean}
    */
   isCheckedByBlack (f) {
      const x = f.column
      const y = f.row

      if (x < 7 && y < 7 && this.#board[x + 1][y + 1] === FIELD.PAWN_BLACK)
         return true

      if (x > 0 && y < 7 && this.#board[x - 1][y + 1] === FIELD.PAWN_BLACK)
         return true

      for (const direction of DIRECTIONS) {
         const figure = this.#firstNonEmptyField_inDirection(f, direction)

         if (figure === FIELD.ROOK_BLACK || figure === FIELD.QUEEN_BLACK) return true
      }

      for (const direction of DIAGONAL_DIRECTIONS) {
         const figure = this.#firstNonEmptyField_inDirection(f, direction)

         if (figure === FIELD.BISHOP_BLACK || figure === FIELD.QUEEN_BLACK)
            return true
      }

      for (const move of KNIGHT_MOVES)
         if (this.field(f.add(move)) === FIELD.KNIGHT_BLACK)
            return true

      for (const move of KING_MOVES)
         if (this.field(f.add(move)) === FIELD.KING_BLACK)
            return true

      return false
   }

   /**
    * @param {Field} f
    */
   #isCheckedByWhite (f) {
      if (this.field(f.add(new Field(1, -1))) === FIELD.PAWN_WHITE)
         return true

      if (this.field(f.add(new Field(-1, -1))) === FIELD.PAWN_WHITE)
         return true

      for (const direction of DIRECTIONS) {
         const figure = this.#firstNonEmptyField_inDirection(f, direction)

         if (figure === FIELD.ROOK_WHITE || figure === FIELD.QUEEN_WHITE)
            return true
      }

      for (const direction of DIAGONAL_DIRECTIONS) {
         const figure = this.#firstNonEmptyField_inDirection(f, direction)

         if (figure === FIELD.BISHOP_WHITE || figure === FIELD.QUEEN_WHITE)
            return true
      }

      for (const move of KNIGHT_MOVES)
         if (this.field(f.add(move)) === FIELD.KNIGHT_WHITE)
            return true

      for (const move of KING_MOVES)
         if (this.field(f.add(move)) === FIELD.KING_WHITE)
            return true

      return false
   }

   /**
    * Returns symbol of the first piece
    * @param {Field} field
    * @param {Field} direction
    * @returns {Number} Symbol of a first figure or EOB.
    */
   #firstNonEmptyField_inDirection (field, direction) {
      const f = field.copy()

      do {
         f.move(direction)
      } while (this.getFieldType(f) === FIELD_TYPE.EMPTY)

      return this.field(f)
   }

   get WhiteKingPosition () {
      for (const f of ALL_FIELDS)
         if (this.field(f) === FIELD.KING_WHITE) return f

      throw new Error('white king not found')
   }

   get BlackKingPosition () {
      for (const f of ALL_FIELDS)
         if (this.field(f) === FIELD.KING_BLACK) return f

      throw new Error('Black king not found')
   }

   get CastleShortWhite () {
      return this.#available_castle.WHITE_SHORT
   }

   get CastleLongWhite () {
      return this.#available_castle.WHITE_LONG
   }

   get Array () {
      let x = []

      for (let i = 0; i < 8; i++) {
         x[i] = []

         for (let j = 0; j < 8; j++)
            x[i][j] = this.#board[i][j]
      }

      return x
   }
}

export const STARTING_BOARD = new Board([
   [FIELD.ROOK_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.ROOK_BLACK],
   [FIELD.KNIGHT_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.KNIGHT_BLACK],
   [FIELD.BISHOP_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.BISHOP_BLACK],
   [FIELD.QUEEN_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.QUEEN_BLACK],
   [FIELD.KING_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.KING_BLACK],
   [FIELD.BISHOP_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.BISHOP_BLACK],
   [FIELD.KNIGHT_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.KNIGHT_BLACK],
   [FIELD.ROOK_WHITE, FIELD.PAWN_WHITE, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.EMPTY, FIELD.PAWN_BLACK, FIELD.ROOK_BLACK],
])

export const NO_HIGHLIGHT = new Board([
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
   [HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE, HIGHLIGHT.NONE],
])
