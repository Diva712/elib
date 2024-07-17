import express from 'express'
import { createBook, getAllBook, getSingleBook, updateBook } from './bookController';
import path from 'node:path';
import multer from 'multer';
import authentication from '../middlewares/authenticate';

const bookRouter = express.Router();

//multer configuration
const upload = multer({
  dest: path.resolve(__dirname, '../../public/data/uploads'),
  limits: {fileSize: 3e7} // 30mb
})

bookRouter.post('/', authentication, upload.fields([
  { name: "coverImage", maxCount: 1 },
  {name:"file" , maxCount:1},
]), createBook)


bookRouter.patch('/:bookId', authentication, upload.fields([
  { name: "coverImage", maxCount: 1 },
  {name:"file" , maxCount:1},
]), updateBook)


bookRouter.get('/', getAllBook);
bookRouter.get('/:bookId', getSingleBook);

export default bookRouter;