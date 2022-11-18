import { ConfigFileAuthenticationDetailsProvider } from "oci-common";
import { ObjectStorageClient } from "oci-objectstorage";
import {
	PutObjectRequest,
	DeleteObjectRequest,
} from "oci-objectstorage/lib/request";
import { StorageEngine } from "multer";
import { Request } from "express";
import { randomUUID } from "crypto";
import { StorageConfig, OracleFile } from "./types/types";

class OracleStorage implements StorageEngine {
	private config: StorageConfig;
	private storageClient: ObjectStorageClient;

	constructor(config: StorageConfig) {
		this.config = config;
		const provider: ConfigFileAuthenticationDetailsProvider =
			new ConfigFileAuthenticationDetailsProvider(
				this.config.configPath,
				"DEFAULT"
			);

		this.storageClient = new ObjectStorageClient({
			authenticationDetailsProvider: provider,
		});
	}

	_handleFile = async (
		req: Request,
		file: Express.Multer.File,
		cb: (error: Error | null, res?: Partial<Express.Multer.File>) => void
	) => {
		const fileName =
			req.user?.id + "/" + randomUUID() + "-" + file.originalname;

		const request: PutObjectRequest = {
			namespaceName: this.config.namespace,
			bucketName: this.config.bucket,
			objectName: fileName,
			putObjectBody: file.stream,
			contentType: file.mimetype,
			opcMeta: {
				uploadedBy: req.user?.id!,
			},
		};

		this.storageClient
			.putObject(request)
			.then(() => {
				req.fileName = fileName;
				cb(null, file);
			})
			.catch((err: Error) => {
				cb(err);
			});
	};

	_removeFile = async (
		req: Request,
		file: OracleFile,
		cb: (error: Error | null) => void
	) => {
		const request: DeleteObjectRequest = {
			namespaceName: this.config.namespace,
			bucketName: this.config.bucket,
			objectName: req.fileName!,
		};

		this.storageClient
			.deleteObject(request)
			.then(() => cb(null))
			.catch((err: Error) => {
				cb(err);
			});
	};
}

export default OracleStorage;
