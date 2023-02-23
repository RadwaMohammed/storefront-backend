import dotenv from 'dotenv';
import { Pool } from 'pg';

// Initializes the environment variables
dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_TEST_DB,
  ENV,
} = process.env;

// Instantiate connection to the database
const client = new Pool({
  host: POSTGRES_HOST,
  database: ENV === 'test' ? POSTGRES_TEST_DB : POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD
});

export default client;