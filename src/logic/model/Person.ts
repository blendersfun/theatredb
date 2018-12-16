import { Document } from './Document'
import { PersonSummary, ScriptSummary } from './Summaries'

export type PersonDetail = PersonSummary & {
  scriptsContributedTo?: ScriptSummary[]
}

export class Person extends Document<PersonSummary, PersonDetail> {
  static collection = 'people'
  identity(): any {
    return { name: this.document.name }
  }
}
