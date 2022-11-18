import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({ status: 401, message: "Unauthorized" });
	}

	verify(token, process.env.JWT_SECRET!, (err, user) => {
		if (err) {
			return res
				.status(403)
				.json({ status: 403, message: "Expired/invalid token" });
		}
		req.user = user as { id: string };
		next();
	});
};
