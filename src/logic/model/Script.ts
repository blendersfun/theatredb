import { Document } from './Document'
import { ScriptSummary, ProductionSummary } from './Summaries'
import { Person } from './Person'

export type Review = {
  review: string,
  source: string
}

export type ScriptDetail = ScriptSummary & {
  productions?: ProductionSummary[],
  isbn?: string,
  synopsis?: string,
  roles?: {
    men?: number,
    women?: number,
    total?: number
  },
  reviews?: Review[],
  awards?: string,
  licenseFeePerPerformance?: number
}

export class Script extends Document<ScriptSummary, ScriptDetail> {
  static collection = 'scripts'
  identity(): any {
    return { name: this.document.name }
  }
  async preSave(): Promise<void> {
    const upsertAuthors = this.document.authors
      .map(author => new Person(author.person).upsert())
    await Promise.all(upsertAuthors)
  }
}
