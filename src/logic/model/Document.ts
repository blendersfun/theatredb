
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
  document: D
  constructor(document: D) {
    // Todo: validate.
    this.document = document
  }
  /**
   * Perform any links to sub-documents that this DocumentType might have.
   * Default implementation is a no-op. **Extending classes with sub-documents
   * must implement it**
   */
  async performLinks(): Promise<void> {}
  /**
   * A utility method to create a two way link between a document and one of it's
   * sub-documents. If the sub-document is already saved, is a no-op. If not, it
   * saves the sub-document in the other collection, extends the summary saved in
   * this document with any additional fields pulled down from the server.
   * Will throw an error if this document is not already saved.
   */
  async link<T extends DocumentType>(subDocument: T, SubDocument: typeof Document): Promise<void> {
    if (subDocument._id) return
    const sub = new SubDocument(subDocument)
    await sub.pull()
    sub.linkFrom(this)
    await sub.push()
    Object.assign(subDocument, sub.summarize())
  }
  /**
   * Accept an incoming link. This should be able to handle all of the types of documents
   * that this document can be included in. Default implementation is a no-op. **Extending classes
   * with sub-documents must implement it**
   */
  async linkFrom<A extends DocumentType, B extends DocumentType>(linkedDoc: Document<A, B>) {}
  /**
   * Create this record if it does not already exist in the db.
   * Merge on top of existing record if it does exist. Uses `performLinks`
   * to ensure that all links to sub-documents are setup properly.
   */
  async push(): Promise<void> {
    // Todo.
  }
  /**
   * Find a server copy using `find` and extend `document` with any structures it has
   * that `document` does not. 
   */
  async pull(): Promise<void> {
    // Todo.
  }
  /**
   * Find `document` on the server if possible, using a set of real-world meaningful fields
   * to compare. **Extending classes must implement it.**
   */
  async find(document: D): Promise<D|null> {
    throw new Error('Document.find is a stub. Any extending class must implement it.')
  }
  /**
   * Return a summary view of the `document`. This is the way the `document` is
   * is represented when included in other documents. **Extending classes must implement it.**
   */
  summarize(): S {
    throw new Error('Document.summarize is a stub. Extending class must implement.')
  }
}