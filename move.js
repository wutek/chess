import { Field, FIELD } from './field.js'

/** Represents a move of a piece on a chess board. Store all differences between two boards. */
export class Move {
   #board_changes

   /**
    * @param {Field} from
    * @param {Field} to
    * @param {number} fromValue
    * @param {number} toValue
    * @param {boolean} promotion
    */
   constructor (from, to, fromValue, toValue = FIELD.EMPTY, promotion = false) {
      this.#board_changes = [
         {
            field: from,
            oldValue: fromValue,
            newValue: FIELD.EMPTY
         },
         {
            field: to,
            oldValue: toValue,
            newValue: fromValue
         },
      ]

      if (promotion) {
         if (this.#board_changes[1].newValue === FIELD.PAWN_WHITE) {
            this.#board_changes[1].newValue = FIELD.QUEEN_WHITE
         } else if (this.#board_changes[1].newValue === FIELD.PAWN_BLACK) {
            this.#board_changes[1].newValue = FIELD.QUEEN_WHITE
         } else {
            throw new Error('promoting move with figure other than pawn')
         }
      }
   }

   toString () {
      return this.From.id + '→' + this.To.id
   }

   /** @return {Field} */
   get From () {
      return this.#board_changes[0].field
   }

   /** @return {Field} */
   get To () {
      return this.#board_changes[1].field
   }

   /** @return {number} */
   get FromValue () {
      return this.#board_changes[0].oldValue
   }

   /** @return {number} */
   get ToValue () {
      return this.#board_changes[1].oldValue
   }
}
