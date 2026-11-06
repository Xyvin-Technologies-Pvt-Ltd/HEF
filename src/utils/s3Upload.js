const { S3Client, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const uploadBufferToS3 = async (file, folder) => {
  const safeName = String(file.originalname || "file").replace(/[^\w.\-]+/g, "_");
  const key = `${folder}/${Date.now()}_${safeName}`;

  const uploader = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await uploader.done();

  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;

  return { fileUrl, key };
};

const deleteS3Object = async (key) => {
  if (!key) return;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    })
  );
};

const getS3Object = async (key) => {
  return s3.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    })
  );
};

module.exports = { uploadBufferToS3, deleteS3Object, getS3Object };
