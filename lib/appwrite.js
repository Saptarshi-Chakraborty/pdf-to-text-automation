import { Client, Databases } from "node-appwrite";
import dotenv from 'dotenv';

dotenv.config();

const appwriteApiKey = process.env.APPWRITE_API_KEY;
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID;

// console.log(`appwriteApiKey: ${appwriteApiKey}`);
// console.log(`appwriteProjectId: ${appwriteProjectId}`);

const client = new Client();
client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(appwriteProjectId)
    .setKey(appwriteApiKey);

const database = new Databases(client);

export { client, database }