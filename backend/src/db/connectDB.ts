import mongoose from 'mongoose';

export const connectDB = async () => {
  const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

  if (!DB_USERNAME || !DB_PASSWORD || !DB_HOST || !DB_NAME) {
    throw new Error('Missing DB credentials');
  }

  const uri = `mongodb+srv://${encodeURIComponent(
    DB_USERNAME
  )}:${encodeURIComponent(
    DB_PASSWORD
  )}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

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
