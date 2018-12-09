import {
  Stitch,
  StitchAppClient
} from 'mongodb-stitch-browser-sdk'

export const client: StitchAppClient = Stitch.initializeDefaultAppClient('theatredb-vnppd')
