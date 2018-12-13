import { db } from '../stitch'
import { Document } from './Document'
import { ProductionSummary, ScriptSummary } from './Summaries';

export type ProductionDetail = ProductionSummary & {
  script?: ScriptSummary,
  isProfessional?: boolean,
  schedule?: {
    startDate?: Date, // In UTC, 7pm local time is used by convention.
    endDate?: Date    // In UTC, 7pm local time is used by convention.
  },
  location?: {
    city?: string,
    state?: string
  }
}

export class Production extends Document<ProductionSummary, ProductionDetail> {
  async find(document: ProductionDetail): Promise<ProductionDetail|null> {
    const name = document.name
    const productions = await db.collection('productions').find({ name }).asArray() as ProductionDetail[]
    if (productions.length > 1) {
      throw new Error(
        `More than one production exists with the name "${name}". ` +
        `We now need to implement disambiguation logic.`
      )
    }
    if (productions.length === 0) {
      return null
    }
    return productions[0]
  }
}
