import React, {
  Component,
  MouseEvent,
  createRef,
  RefObject
} from 'react'
import './App.css'
import {
  Stitch,
  StitchAppClient,
  RemoteMongoClient,
  RemoteMongoDatabase,
  AnonymousCredential
} from 'mongodb-stitch-browser-sdk'

type Comment = {
  _id: string,
  owner_id: string,
  comment: string
}

const client: StitchAppClient = Stitch.initializeDefaultAppClient('blogtutorial-xzhnn')

class App extends Component {
  state: {
    comments: Comment[],
    loading: boolean
  }
  newComment: RefObject<HTMLInputElement>
  db: RemoteMongoDatabase
  constructor(props: any) {
    super(props);
    this.state = {
      comments: [],
      loading: true
    }
    this.newComment = createRef<HTMLInputElement>()
    this.db = client
      .getServiceClient(RemoteMongoClient.factory, 'aaron-moore-service')
      .db('blog')
    client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(() => {
        this.fetchComments()
      })
      .catch(console.error);
  }
  render() {
    return (
      <div className="App">
        <h1>This is a great blog post</h1>
        <div id="content">
          I think too long and hard about things that don't matter.
        </div>
        <br/>
        <b>Comments:</b>
        {this.state.loading
          ? <div>(loading)</div>
          : <div id="comments">{
            this.state.comments.map(c => (
              <div key={c._id} className="comment">{c.comment}</div>
            ))
          }</div>
        }
        <br/>
        <b>Add Comment:</b><br/>
        <input ref={this.newComment}/><br/>
        <button onClick={this.addComment.bind(this)}>Add</button>
      </div>
    )
  }
  fetchComments() {
    this.db.collection('comments')
      .find({}, { limit: 1000 })
      .asArray()
      .then(comments => {
        console.log(comments)
        this.setState({ comments, loading: false })
      })
  }
  addComment(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const userId = client.auth.user && client.auth.user.id
    const newComment = this.newComment.current && this.newComment.current.value
    if (userId && newComment) {
      this.db.collection('comments')
        .insertOne({
          owner_id: client.auth.user && client.auth.user.id,
          comment: newComment
        })
        .then(() => {
          this.fetchComments()
          if (this.newComment.current) {
            this.newComment.current.value = ''
          }
        })
    }
  }
}

export default App
