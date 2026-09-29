import mongoose from 'mongoose';

export const connectDB = async () => {
  const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, MONGO_DB_NAME } = process.env;

  if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_HOST || !MONGO_DB_NAME) {
    throw new Error('Missing DB credentials');
  }

  const uri = `mongodb+srv://${encodeURIComponent(
    MONGO_USERNAME
  )}:${encodeURIComponent(
    MONGO_PASSWORD
  )}@${MONGO_HOST}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongDB connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
};
