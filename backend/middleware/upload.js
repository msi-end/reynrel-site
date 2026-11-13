import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Private: NOT under /uploads, so it is never served by express.static.
export const PARTNER_DOCS_DIR = path.join(__dirname, '..', 'private', 'partner-docs');

const ALLOWED = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export const DOC_FIELDS = [
  { name: 'panCard', maxCount: 1 },
  { name: 'cancelledCheque', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'qualificationCertificate', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
];

export const partnerDocsUpload = multer({
  storage: multer.diskStorage({
    destination: PARTNER_DOCS_DIR,
    filename: (req, file, cb) => cb(null, `${crypto.randomBytes(16).toString('hex')}${ALLOWED[file.mimetype]}`)
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 6, fields: 10, fieldSize: 64 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) return cb(new Error(`${file.fieldname}: only PDF, JPG, PNG or WEBP files are allowed`));
    cb(null, true);
  }
});

export function filesToDocs(files = {}) {
  return Object.entries(files).flatMap(([type, arr]) =>
    arr.map((f) => ({
      id: crypto.randomBytes(8).toString('hex'),
      type,
      storedName: f.filename,
      originalName: f.originalname.slice(0, 150),
      mime: f.mimetype,
      size: f.size,
      uploadedAt: new Date().toISOString()
    }))
  );
}
