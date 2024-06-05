// express starter template in es6

import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import uploadToGithub from './lib/uploadToGithub.js';
import { ID } from 'node-appwrite';
import { database } from './lib/appwrite.js';


dotenv.config(); // initialize .env

const app = express();
const port = process.env.PORT || 3000;



app.get('/', (req, res) => {
    const file = fs.readFileSync('src/index.html', 'utf8');

    res.send(file);
}
);

app.get('/test', (req, res) => {
    res.send('Test route');
});


// pdf upload route
app.post("/file-upload",
    fileUpload({ createParentPath: true }),

    async (req, res) => {
        const password = req.body.password;
        console.log(password)

        if (!password || password !== process.env.FILE_UPLOAD_SECRET_KEY) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        const file = req.files.file;
        console.log(file.tempFilePath);
        // file.mv(`./uploads/${file.name}`)

        const result = await uploadToGithub(file);
        // const result = github_response_example;

        if (result === false) {
            return res.status(500).json({ status: "error", message: "File upload failed" });
        }

        const pdfData = {
            filename: result.content.name,
            github_owner: result.owner || "unknown",
            github_repo: result.repo || "unknown",
            download_url: result.content.download_url,
        }

        const databaseId = process.env.APPWRITE_DATABASE_ID;
        const pdfCollectionId = process.env.APPWRITE_PDF_COLLECTION_ID;

        try {

            const result = await database.createDocument(
                databaseId,
                pdfCollectionId,
                ID.unique(),
                pdfData
            );

            console.log("Document created successfully");
            console.log(result);
        } catch (error) {
            console.error("Error creating document");
            console.error(error);

            return res.status(500).json({ status: "error", message: "Error creating document" });
        }


        res.status(200).json({ status: "success", message: "File uploaded successfully" })
    }
)



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}
);
