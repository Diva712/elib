import { config as conf } from "dotenv";
conf()

const _config = {
  port: process.env.PORT,
  dburl: process.env.MONGO_CONNECTION_STING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryCloud: process.env.CLOUDINARY_CLOUD
}

export const config = Object.freeze(_config);