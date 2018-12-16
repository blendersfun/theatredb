
const StitchAppClientInstance = {
  getServiceClient() { return RemoteMongoClientInstance; }
}
export const Stitch = {
  initializeDefaultAppClient() { return StitchAppClientInstance; }
}
export const RemoteMongoClient = {
  factory() {}
}
export const RemoteMongoClientInstance = {
  db() { return RemoteMongoDatabaseInstance; }
}
export const RemoteMongoDatabaseInstance = {
  collection() { return RemoteMongoCollectionInstance; }
}
export const RemoteMongoCollectionInstance = {
  find() { return RemoteMongoReadOperationInstance; }
}
export const RemoteMongoReadOperationInstance = {
  asArray: jest.fn()
}
