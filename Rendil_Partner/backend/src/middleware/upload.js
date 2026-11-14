import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

const DOC_MIME = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const IMG_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = (dir, types) =>
  multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString('hex')}${types[file.mimetype]}`)
  });

const filter = (types, label) => (req, file, cb) =>
  types[file.mimetype] ? cb(null, true) : cb(Object.assign(new Error(`${file.fieldname}: only ${label} files are allowed`), { status: 400 }));

// Private documents (never web-served). Field name = document type key.
export const documentUpload = multer({
  storage: storage(config.paths.documents, DOC_MIME),
  limits: { fileSize: 5 * 1024 * 1024, files: 12, fields: 20, fieldSize: 64 * 1024 },
  fileFilter: filter(DOC_MIME, 'PDF, JPG, PNG or WEBP')
});

// Public product screenshots.
export const productImageUpload = multer({
  storage: storage(config.paths.productUploads, IMG_MIME),
  limits: { fileSize: 4 * 1024 * 1024, files: 10 },
  fileFilter: filter(IMG_MIME, 'JPG, PNG or WEBP')
});

export const filesOf = (req) => (Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat());

export async function discard(files, dir = config.paths.documents) {
  await Promise.all((files || []).map((f) => fs.unlink(path.join(dir, f.filename)).catch(() => {})));
}
