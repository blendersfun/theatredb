import { Document } from './Document'
import { PersonSummary, ScriptSummary } from './Summaries'

export type PersonDetail = PersonSummary & {
  scriptsContributedTo?: ScriptSummary[]
}

export class Person extends Document<PersonSummary, PersonDetail> {}
