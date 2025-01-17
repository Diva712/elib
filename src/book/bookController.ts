
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import createHttpError from 'http-errors';
import cloudinary from '../config/cloudinary';
import bookModel from './bookModel';
import { AuthRequest } from '../middlewares/authenticate';


//upload book in cloud
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  try {
    // Cloudinary upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
  
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });
  
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFileName);
    
    const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: bookFileName,
      folder: "book-pdfs",
      format: "pdf"
    });
  
    console.log("CoverImageResult : ", uploadResult);
    console.log("BookUploadResult : ", bookFileUploadResult);
  
    const _req = req as AuthRequest
    // Database operation in separate try/catch
    try {
      
      const newBook = await bookModel.create({
        title,
        genre,
        author: _req.userId, // Consider making this dynamic
        coverImage: uploadResult.secure_url,
        file: bookFileUploadResult.secure_url,
      });

      // Delete temp files
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(bookFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temp files:", unlinkError);
        // Consider whether you want to return here or just log the error
      }

      res.status(201).json({ bookId: newBook._id });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return next(createHttpError(500, "Error saving book to database"));
    }
   
  } catch (error) {
    console.error("Detailed error:", error);
    return next(createHttpError(500, "Error while uploading files or processing request"));
  }
};

//update book 
const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    next(createHttpError(404 , "Book not found !!"))
  }
  const _req = req as AuthRequest;

  if (book?.author.toString() !== _req.userId) {
    next(createHttpError(403 , "Unauthorized , You can not update !!"))
  }

  // now check the files a send or not
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {

    //delete present image in cloudinary which you have to change
    const coverFileSplits = book?.coverImage.split("/");
    const coverImagePublicId = coverFileSplits?.at(-2) + '/' + (coverFileSplits?.at(-1)?.split('.').at(-2));

    try {
       await cloudinary.uploader.destroy(coverImagePublicId);
    } catch (error) {
      next(createHttpError(500, "Error in delete process while updating a cover image "))
    }

    const fileName = files.coverImage[0].filename;
    const coverMineType = files.coverImage[0].mimetype.split("/").at(-1);

    const filePath = path.resolve(__dirname, "../../public/data/uploads/" + fileName);

    completeCoverImage = fileName;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      format: coverMineType,
      folder: "book-covers"
    });

    completeCoverImage = uploadResult.secure_url;
    

    //delete temp files
    await fs.promises.unlink(filePath);

  }


  // check if file field is exists
  let completeFileName = "";
  if (files.file) {

    //deleting a present image which you have to update

    const pdfFileSplits = book?.file.split("/");
    const pdfFilePublidId = pdfFileSplits?.at(-2) + '/' + pdfFileSplits?.at(-1);

    try {
      await cloudinary.uploader.destroy(pdfFilePublidId, {
        resource_type: "raw"
     })
    } catch (error) {
      next(createHttpError(500 , "Error in deleting process in pdf while updating !!"))
    }



    const bookFilePath = path.resolve(__dirname, "../../public/data/uploads/" + files.file[0].filename);

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      format: "pdf",
      folder: "book-pdfs"
    })

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);

  }

  const updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {
    title: title,
    genre: genre,
    coverImage: completeCoverImage ? completeCoverImage : book?.coverImage,
    file: completeFileName ? completeFileName : book?.file,
  }, { new: true });


  res.json(updatedBook);
  
}

//get all book
const getAllBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //add pagination
    const book = await bookModel.find();
    res.json(book);

  } catch (error) {
    next(createHttpError(500 , "Error while getting a book !!"))
  }
}

//get singleBook
const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
 try {
   const book = await bookModel.findOne({ _id: req.params.bookId });
   if (!book) {
     next(createHttpError(404, "Book does't exist !!"));
   }
   return res.status(200).json(book)
 } catch (error) {
  next(createHttpError(500 , "Error While getting a book !!"))
 }
}

//deleteBook
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {

   const book = await bookModel.findOne({ _id: req.params.bookId });
   if (!book) {
     next(createHttpError(404, "Book does't exist !!"));
    }

  
  // const _req = req as AuthRequest;

  // if (book?.author.toString() !== _req.userId) {
  //   next(createHttpError(403 , "Unauthorized , You can not update !!"))
  //   }
    
    //delete from cloudinary coverImage and file pdf
    const coverFileSplits = book?.coverImage.split("/");
    const coverImagePublicId = coverFileSplits?.at(-2) + '/' + (coverFileSplits?.at(-1)?.split('.').at(-2));

    const pdfFileSplits = book?.file.split("/");
    const pdfFilePublidId = pdfFileSplits?.at(-2) + '/' + pdfFileSplits?.at(-1);

    try {

      await cloudinary.uploader.destroy(coverImagePublicId);

       await cloudinary.uploader.destroy(pdfFilePublidId, {
        resource_type: "raw"
     });
      
      // console.log( "d1:", d1);
      // console.log("d2:" , d2);


      await bookModel.deleteOne({ _id: req.params.bookId });

      return res.status(204).send("deleted");
      
    } catch (error) {
      next(createHttpError(500 , "Error during deleteing files from cloudinary !!"))
    }
    

    
    
  } catch (error) {
    next(createHttpError(500 , "Error while during delete Book !!"))
  }
}

export {
  createBook, updateBook,
  getAllBook, getSingleBook,
  deleteBook
};