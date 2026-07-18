const crypto = require("crypto");

/**
 * Minimal Cloudinary integration using signed direct uploads.
 * No `cloudinary` npm SDK — a thin wrapper around Cloudinary's plain HTTP
 * API, signed with the same SHA-1 scheme the SDK uses under the hood.
 *
 * Flow:
 *   1. Client asks our server for a signature (POST /api/media/sign).
 *   2. Client uploads the file straight to Cloudinary using that signature
 *      (our server never touches the file bytes).
 *   3. Client saves the resulting secure_url on the medicine (image field).
 */

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function signParams(params) {
  const apiSecret = getEnv("CLOUDINARY_API_SECRET");
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

function createUploadSignature(folder = "gigo-pharmacy-medicines") {
  const cloudName = getEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = getEnv("CLOUDINARY_API_KEY");
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = signParams({ folder, timestamp });

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  };
}

module.exports = { signParams, createUploadSignature };
