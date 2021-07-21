const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const logger = require('./logger')

let s3Client

const createS3Client = () => {
  s3Client = new S3Client({ region: process.env.AWS_REGION })
}

const sendFileToS3 = async (attachment, fileKey, metadata = {}) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileKey,
    Metadata: metadata,
    Body: attachment
  }

  // Upload file to specified bucket.
  await s3Client.send(new PutObjectCommand(uploadParams))
  logger.info('AWS S3: attachment uploaded to S3')

  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
}

const shutdownS3Client = () => {
  //Shutdown S3 connection
  if(s3Client) {
    s3Client.destroy()
  }
}

module.exports = { createS3Client, sendFileToS3, shutdownS3Client }