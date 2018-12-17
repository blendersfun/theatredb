
import { Document } from '../../logic/model/Document'

export type ParserProps = {
  onParse: (parsed: { [label: string]: Document<any, any> }) => void
}

