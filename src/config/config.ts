import { config as conf } from "dotenv";
conf()

const _config = {
  port: process.env.PORT,
  dburl: process.env.MONGO_CONNECTION_STING
}

export const config = Object.freeze(_config);