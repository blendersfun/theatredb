
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
  static subDocuments: { [schemaPath: string]: any }
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
  async find(): Promise<void> {
    // Find this whole document:
    const query = this.identity()
    const SpecificDocument = this.constructor as typeof Document
    const collection = SpecificDocument.collection
    let serverMatches: any[]|null = null
    try {
      serverMatches = await db.collection(collection).find(query).asArray()
    } catch (err) {
      console.error(
        `Encountered error during find of ${JSON.stringify(collection)}, ` +
        `with query ${JSON.stringify(query)}:`, err
      )
      throw err
    }
    if (serverMatches.length > 1) {
      throw new Error(
        `More than one server match for ${JSON.stringify(query)}. ` +
        `We need some way to disambiguate. Or is it duplicates?!`
      )
    }
    if (serverMatches.length === 1) {
      Object.assign(this.document, serverMatches[0])
    }

    // Find any sub-ducuments, if they are not already _id-ed:
    await Promise.all(this.collectSubDocuments().map(sub => sub.find()))
  }
  collectSubDocuments(): Document<any, any>[] {
    const SpecificDocument = this.constructor as typeof Document
    if (!SpecificDocument.subDocuments) return []
    let allSubDocuments: Document<any, any>[] = []
    for (const schemaPath of Object.keys(SpecificDocument.subDocuments)) {
      const segments = schemaPath.split('.')
      const SubDocument = SpecificDocument.subDocuments[schemaPath]
      allSubDocuments = allSubDocuments.concat(
        this._collectSubDocuments(this.document, segments, SubDocument)
      )
    }
    return allSubDocuments
  }
  _collectSubDocuments(current: any, segments: string[], SubDocument: any): Document<any, any>[] {
    if (!segments.length) {
      return [new SubDocument(current)]
    }
    const segment = segments[0]
    if (current[segment] === undefined) return []
    if (current[segment] instanceof Array) {
      let results: Document<any, any>[] = []
      for (const item of current[segment]) {
        results = results.concat(
          this._collectSubDocuments(item, segments.slice(1), SubDocument)
        )
      }
      return results
    }
    return this._collectSubDocuments(current[segment], segments.slice(1), SubDocument)
  }
  async preSave(): Promise<void> {
    await Promise.all(this.collectSubDocuments().map(sub => sub.upsert()))
  }
  identity(): any {
    throw new Error(
      'Default impl of identity() is a stub. ' +
      'Must be filled in by sub-class.'
    )
  }
}
