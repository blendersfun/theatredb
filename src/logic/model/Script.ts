import { Document } from './Document'
import { ScriptSummary, ProductionSummary } from './Summaries'

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
  awards?: string
}

export class Script extends Document<ScriptSummary, ScriptDetail> {}
