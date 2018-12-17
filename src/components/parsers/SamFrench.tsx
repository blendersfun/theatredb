import React, {
  Component,
  RefObject,
  createRef
} from 'react'
import { Document } from '../../logic/model/Document'
import { ParserProps } from './Parser'

export class SamFrenchParser extends Component<ParserProps, {}> {
  static parserName = 'samuelfrench.com'
  textareaList: RefObject<HTMLTextAreaElement>
  textareaDetail: RefObject<HTMLTextAreaElement>
  constructor(props: ParserProps) {
    super(props)
    this.textareaList = createRef()
    this.textareaDetail = createRef()
  }
  componentDidMount() {
    this.parse()
  }
  render() {
    return (<>
      <label>Samuel French Tabel Entry:</label><br/>
      <textarea
        className="list"
        ref={this.textareaList}
        onChange={this.parse.bind(this)}
        defaultValue={window.sessionStorage.SamFrenchList}
        placeholder=""
        ></textarea><br/>
      <label>Samuel French Detail Page:</label><br/>
      <textarea
        className="detail"
        ref={this.textareaDetail}
        onChange={this.parse.bind(this)}
        defaultValue={window.sessionStorage.SamFrenchDetail}
        placeholder=""
        ></textarea><br/>
    </>)
  }
  parse() {
    const textareaList = this.textareaList.current
    const textareaDetail = this.textareaDetail.current
    if (!textareaList || !textareaDetail) return
    window.sessionStorage.SamFrenchList = textareaList.value
    window.sessionStorage.SamFrenchDetail = textareaDetail.value
    const parsed: { [label: string]: Document<any, any> } = {}
    // const production = entryFromDPSList(textareaList.value)
    // const script = entryFromDPSDetail(textareaDetail.value)
    // if (production) parsed.Production = production
    // if (script) parsed.Script = script
    // this.props.onParse(parsed)
  }
  clear() {
    const textareaList = this.textareaList.current
    const textareaDetail = this.textareaDetail.current
    if (!textareaList || !textareaDetail) return
    window.sessionStorage.SamFrenchList = textareaList.value = ''
    window.sessionStorage.SamFrenchDetail = textareaDetail.value = ''
  }
}
