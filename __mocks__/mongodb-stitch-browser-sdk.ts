
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
  db() {}
}