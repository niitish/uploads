export type StorageConfig = {
	configPath: string;
	namespace: string;
	bucket: string;
};

export interface OracleFile extends Express.Multer.File {
	objectName: string;
	eTag: string;
}
