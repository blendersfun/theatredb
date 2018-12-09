import { db } from './stitch'

export class Database {
  static async fetch(collection: string): Promise<any> {
    return await db.collection(collection)
      .find({}, { limit: 1000 })
      .asArray()
  }
  static async add(collection: string, document: any): Promise<void> {
    await db.collection(collection).insertOne(document)
  }
}
