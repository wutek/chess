export class Field {
   /** @type {number} */ #x
   /** @type {number} */ #y

   /**
    * @param {number} column
    * @param {number} row
    */
   constructor (column, row) {
      this.#x = column
      this.#y = row
   }

   /** @return {Field} */
   copy () {
      return new Field(this.#x, this.#y)
   }

   /**
    * Creates a new field that has coordinates equal to the sum of the current field and f.
    *
    * @param {Field} f
    */
   add (f) {
      return new Field(this.#x + f.column, this.#y + f.row)
   }

   /**
    * Changes current field by adding coordinates of another field to it.
    *
    * @param {Field} f
    */
   move (f) {
      this.#x += f.column
      this.#y += f.row
   }

   get id () {
      const indexToLetter = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

      return indexToLetter[this.#x] + (this.#y + 1)
   }

   toString () {
      return this.id
   }

   /** @return {number} */
   get column () {
      return this.#x
   }

   /** @return {number} */
   get row () {
      return this.#y
   }
}

export const FIELD = Object.freeze({
   'INVALID': 0,
   'EMPTY': 1,
   'PAWN_WHITE': 2,
   'ROOK_WHITE': 3,
   'KNIGHT_WHITE': 4,
   'BISHOP_WHITE': 5,
   'QUEEN_WHITE': 6,
   'KING_WHITE': 7,
   'PAWN_BLACK': 8,
   'ROOK_BLACK': 9,
   'KNIGHT_BLACK': 10,
   'BISHOP_BLACK': 11,
   'QUEEN_BLACK': 12,
   'KING_BLACK': 13,
})

/** @type {Field[]} */
export const ALL_FIELDS = Object.freeze([
   new Field(7, 4), new Field(0, 4),
   new Field(0, 0), new Field(0, 1), new Field(0, 2), new Field(0, 3), new Field(0, 5), new Field(0, 6), new Field(0, 7),
   new Field(1, 0), new Field(1, 1), new Field(1, 2), new Field(1, 3), new Field(1, 4), new Field(1, 5), new Field(1, 6), new Field(1, 7),
   new Field(2, 0), new Field(2, 1), new Field(2, 2), new Field(2, 3), new Field(2, 4), new Field(2, 5), new Field(2, 6), new Field(2, 7),
   new Field(3, 0), new Field(3, 1), new Field(3, 2), new Field(3, 3), new Field(3, 4), new Field(3, 5), new Field(3, 6), new Field(3, 7),
   new Field(4, 0), new Field(4, 1), new Field(4, 2), new Field(4, 3), new Field(4, 4), new Field(4, 5), new Field(4, 6), new Field(4, 7),
   new Field(5, 0), new Field(5, 1), new Field(5, 2), new Field(5, 3), new Field(5, 4), new Field(5, 5), new Field(5, 6), new Field(5, 7),
   new Field(6, 0), new Field(6, 1), new Field(6, 2), new Field(6, 3), new Field(6, 4), new Field(6, 5), new Field(6, 6), new Field(6, 7),
   new Field(7, 0), new Field(7, 1), new Field(7, 2), new Field(7, 3), new Field(7, 5), new Field(7, 6), new Field(7, 7),
])
