import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import type { RequestWithUser } from "../controllers/user.controller.js";

interface JwtDecoded {
    id: string;
    iat: number;
    exp: number;
}

export const verifyJwt = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtDecoded;
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            mode: user.mode,
        };

        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
