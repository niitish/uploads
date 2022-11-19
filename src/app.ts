import express, { Request, Response } from "express";
import multer, { MulterError } from "multer";
import { config } from "dotenv";
import path from "path";
import OracleStorage from "./setup";
import { authenticate } from "./middlewares/auth";
import { StorageConfig } from "./types/types";

config({ path: path.join(__dirname, "..", ".env") });
const app = express();

const PORT = process.env.PORT || 8080;

const storageConfig: StorageConfig = {
	configPath: path.join(__dirname, "..", ".oci", "config"),
	namespace: process.env.OC_NAMESPACE!,
	bucket: process.env.OC_BUCKET!,
};

const oracleStorage = new OracleStorage(storageConfig);

const upload = multer({
	storage: oracleStorage,
	limits: { fileSize: +process.env.MAX_FILE_SIZE! },
}).single("file");

app.use(express.static("public"));
app.set("view engine", "pug");
app.set("views", "views");

app.get("/", (req: Request, res: Response) => {
	res.render("index");
});

app.post("/", authenticate, (req: Request, res: Response) => {
	upload(req, res, (err) => {
		if (err) {
			if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
				return res.status(413).json({
					status: 413,
					message: "File size too large",
				});
			}

			return res.status(500).json({
				status: 500,
				message: "Internal server error",
			});
		}

		if (!req.file) {
			return res.status(400).json({ status: 400, message: "No file uploaded" });
		}

		return res.status(201).json({
			status: 201,
			message: "File uploaded successfully",
			link: process.env.OC_PA_ENDPOINT! + req.fileName,
		});
	});
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
