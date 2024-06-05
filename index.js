// express starter template in es6

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import uploadToGithub from './lib/uploadToGithub.js';


const app = express();
const port = process.env.PORT || 3000;

dotenv.config(); // initialize .env


app.get('/', (req, res) => {
    const file = fs.readFileSync('src/index.html', 'utf8');

    res.send(file);
}
);

app.get('/test', (req, res) => {
    res.send('Test route');
});

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

        if (result === false) {
            return res.status(500).json({ status: "error", message: "File upload failed" });
        }



        res.status(200).json({ status: "success", message: "File uploaded successfully" })
    }
)



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}
);
