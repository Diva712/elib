import express from 'express'
import createHttpError from 'http-errors';
import globalErrorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';
import bookRouter from './book/bookRouter';
import cors from 'cors';
import { config } from './config/config';

const app = express();
app.use(cors({
  origin: config.frontendURL
}));
app.use(express.json());


//Routes
app.get('/', (req, res) => {
  
  const error = createHttpError(400, "Something went wrong !!")
  throw error;
  res.json({message: "Welcome Here!!"})
})


app.use('/api/users', userRouter);
app.use('/api/books', bookRouter);

//Global error handler 
app.use(globalErrorHandler)

export default app;