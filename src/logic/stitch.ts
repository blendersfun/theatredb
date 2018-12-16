import {
  Stitch,
  StitchAppClient,
  RemoteMongoDatabase,
  RemoteMongoClient
} from 'mongodb-stitch-browser-sdk'

export const client: StitchAppClient = Stitch.initializeDefaultAppClient('theatredb-vnppd')
export const db: RemoteMongoDatabase = client
  .getServiceClient(RemoteMongoClient.factory, 'theatre-db')
  .db('theatre')

export enum StitchError {
  ArgumentsNotAllowed = 12
}
