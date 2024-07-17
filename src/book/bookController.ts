import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import createHttpError from 'http-errors';
import cloudinary from '../config/cloudinary';
import bookModel from './bookModel';



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
  
    // Database operation in separate try/catch
    try {
      const newBook = await bookModel.create({
        title,
        genre,
        author: "6697bf6e8d37ffb5b607f1f9", // Consider making this dynamic
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

export {createBook};