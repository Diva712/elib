import { NextFunction, Request, Response } from "express";

const createBook = (req: Request, res: Response, next: NextFunction) => {
  console.log("files" , req.files)
  res.json({msg: "Hello"});
}

export { createBook };
