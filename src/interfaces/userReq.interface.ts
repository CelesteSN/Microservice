
import express from "express";

export interface IUser {
    id: string;
    name: string;
    login: string;
    permissions: string[];
}

export interface ISession {
    token: string;
    user: IUser;
}
  
export interface IUserReq extends express.Request{
    user: ISession
}

export interface ITokenLogout{
    type: "string",
    message: "string"
}
