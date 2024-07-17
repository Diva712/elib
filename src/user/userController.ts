import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { config } from "../config/config";
import { User } from './userTypes';



const createUser = async (req: Request, res: Response, next: NextFunction) => {
  //validation
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required !!")
    return next(error);
  }
  //check user already exists or not
 try {
   const user = await userModel.findOne({ email: email });
   if (user) {
     const error = createHttpError(400, "User already exist with this email!!");
     return next(error);
   }
 
 } catch (error) {
  return next(createHttpError(500 , "Error while getting user !!"))
 }
  //hashed password

  const hashPassword = await bcrypt.hash(password, 10);
  //create new user 
  let newUser: User
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    });
  } catch (error) {
    return next(createHttpError(500 , "Error while creating user ."))
  }

  //token generation

  try {
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, { expiresIn: '7d' });
    
  //Response
  res.json({accessToken: token})
  } catch (error) {
    return next(createHttpError(500 , "Error while generating token !!"))
  }
  
};


const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  res.json({message: "Hii"})
}

export { createUser , loginUser};