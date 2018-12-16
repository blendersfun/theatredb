
import { db } from '../stitch'

export type Lit = string | number | boolean | undefined | null | void | {}
export const Tuple = <T extends Lit[]>(...args: T) => args

export type ObjectId = {
  $oid: string,
  getTimestamp(): Date,
  toString(): string
}

export type DocumentType = {
  _id?: ObjectId
}

export class Document<S extends DocumentType, D extends DocumentType> {
  static collection = '' // To be filled in by sub-class.
  document: D
  constructor(document: D) {
    this.document = document
  }
  async upsert(): Promise<void> {
    await this.preSave()
    const query = this.identity()
    const SpecificDocument = this.constructor as typeof Document
    const collection = SpecificDocument.collection
    let serverMatches: any[]|null = null
    try {
      await db.collection(collection).updateOne(query, this.document, { upsert: true })
      serverMatches = await db.collection(collection).find(query).asArray()
    } catch (err) {
      console.error(
        `Encountered error during upsert of ${JSON.stringify(collection)}, ` +
        `with query ${JSON.stringify(query)}:`, err
      )
      throw err
    }
    if (!serverMatches || serverMatches.length === 0) {
      throw new Error(
        `No server match for ${JSON.stringify(query)} after upsert. ` +
        `What is going on?`
      )
    }
    if (serverMatches.length > 1) {
      throw new Error(
        `More than one server match for ${JSON.stringify(query)}. ` +
        `We need some way to disambiguate.`
      )
    }
    Object.assign(this.document, serverMatches[0])
    // console.log('Upsert Successful', this.constructor.name, this.document)
  }
  async preSave(): Promise<void> {}
  identity(): any {
    throw new Error(
      'Default impl of identity() is a stub. ' +
      'Must be filled in by sub-class.'
    )
  }
}
