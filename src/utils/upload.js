import s3 from '../config/s3.js';
import multer from 'multer';
import path from 'path';

// Configure multer for memory storage (to handle file uploads)
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

// Function to upload file to S3
export const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = 'documents') => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${Date.now()}_${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read' // Make files publicly readable
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location; // Return the public URL of the uploaded file
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Function to delete file from S3
export const deleteFromS3 = async (fileUrl) => {
  if (!fileUrl || !process.env.AWS_S3_BUCKET_NAME) {
    return;
  }

  try {
    // Extract the key from the URL (everything after the bucket name)
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const startIndex = fileUrl.indexOf(bucketName) + bucketName.length + 1;
    const key = fileUrl.substring(startIndex);

    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};