import { client } from './StitchAppClient'
import { RemoteMongoDatabase, RemoteMongoClient } from 'mongodb-stitch-browser-sdk';

export const db: RemoteMongoDatabase = client
  .getServiceClient(RemoteMongoClient.factory, 'theatre-db')
  .db('theatre')
