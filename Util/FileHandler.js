const MULTER = require("multer");
const FS = require("fs");
const _PATH = require("path");

const FILE_STORAGE_ROOT_DIRECTORY = "File/message/";

const saveFile = (directoryPath, request) => {
	return new Promise((resolve, reject) => {
		const STORAGE = MULTER.diskStorage({
			destination: function (req, file, callback) {
				const saveDirectory = `${FILE_STORAGE_ROOT_DIRECTORY}${directoryPath}/`;
				mkdir(saveDirectory);

				callback(null, saveDirectory);
			},

			filename: function (req, file, callback) {
				const fileName = file.originalname;

				const validatedName = validateAndConvertFileName(
					_PATH.join(`${FILE_STORAGE_ROOT_DIRECTORY}${req.params.channelId}`),
					fileName
				);

				callback(null, validatedName);
			},
		});

		const UPLOAD = MULTER({ storage: STORAGE });

		UPLOAD.single("file")(request, null, (err) => {
			if (err) {
				console.error("\n\nFile upload error\n\n", err);
				reject(err);
			} else {
				const DOMAIN = `${request.protocol}://${request.get("host")}`;
				const FILE_INFO = {
					isUploaded: true,
					fileName: request.file.filename,
					filePath: `${DOMAIN}/${FILE_STORAGE_ROOT_DIRECTORY}${directoryPath}/${request.file.filename}`,
				};

				let result = request;
				result.file = FILE_INFO;

				resolve(result);
			}
		});
	});
};

const mkdir = (directory) => {
	if (!FS.existsSync(directory)) FS.mkdirSync(directory, { recursive: true });
};

const validateAndConvertFileName = (directory, filename) => {
	let result = filename;

	while (FS.existsSync(_PATH.join(directory, result))) {
		let lastDotIndex = result.lastIndexOf(".");

		let fileName = lastDotIndex !== -1 ? result.substring(0, lastDotIndex) : result;
		let expansion = lastDotIndex !== -1 ? result.substring(lastDotIndex + 1) : "";

		result = convertFileName(fileName, expansion);
	}

	return result;
};

const convertFileName = (filename, expansion) => {
	const REGEX = /\((\d+)\)/;
	const MATCH = filename.match(REGEX);

	if (MATCH) {
		let newFileName = `(${parseInt(MATCH[1]) + 1})${expansion ? "." + expansion : ""}`;
		return filename.replace(REGEX, newFileName);
	}

	return `${filename} (1)${expansion ? "." + expansion : ""}`;
};

module.exports = {
	saveFile,
};
