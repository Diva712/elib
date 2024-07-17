import { NextFunction } from "express";

import { Request , Response } from "express";

import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statuCode = err.statusCode || 500;
  return res.status(statuCode).json({
    message: err.message,
    errorStack: config.env === 'development' ? err.stack: '',

  })
}

export default globalErrorHandler;
