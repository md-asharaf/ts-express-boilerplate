import multer from "multer";
import type { Request } from "express";

// Checks if the uploaded file is an allowed image type
function checkFileType(
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Error: Images Only !!!"));
    }
}

// Multer middleware for handling a single image upload in memory
export const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
    ) => {
        checkFileType(file, cb);
    },
}).single("image");

export const multerMultipleUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
    ) => {
        checkFileType(file, cb);
    },
}).array("images", 10);
