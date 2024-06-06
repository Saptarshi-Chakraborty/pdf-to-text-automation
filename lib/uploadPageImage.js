import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { database } from "./appwrite.js";
import { ID } from "node-appwrite";

async function uploadPageImage(pdfFileName, pageNumber, imageFilePath, pdfFileId) {
    console.log("-".repeat(50));
    console.log(`page number: ${pageNumber}`);

    const owner = "storage-cluster-1";
    const repo = "pdf-to-text-automation-file-upload-1";
    let token = process.env["GITHUB_ACCESS_TOKEN"];

    const imageFileBasename = path.basename(imageFilePath);
    const newFileName = `${uuid()}.${imageFileBasename.split(".").pop()}`;

    console.log(`new file name: ${newFileName} for page ${pageNumber}`);

    // read the file from folder and convert to base64
    const imageFile = fs.readFileSync(imageFilePath);
    const base64 = Buffer.from(imageFile).toString("base64");
    console.log("✅ base64 conversion successful");

    let data = JSON.stringify({
        message: `added new file ${newFileName}`,
        content: `${base64}`,
    });

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${newFileName}`;

    let config = {
        method: "put",
        headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "image/jpeg",
        },
        body: data,
    };

    let response = null;
    try {
        response = await fetch(url, config).then((res) => res.json());
        // console.log(response);

        if (response.message === "Bad credentials") {
            throw new Error("Bad credentials");
        } else if (response.message === "Not Found") {
            throw new Error("Repository not found");
        }
        else if (response.message === "Validation Failed") {
            throw new Error("Validation Failed");
        }

        console.log("✅ File uploaded to Github successfully", " - page: ", pageNumber);

    } catch (error) {
        console.log(error);
        console.log(`❌ File upload to Github failed - page : ${pageNumber}`);
        console.log("-".repeat(50));
        return false;
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const imageCollectionId = process.env.APPWRITE_PDF_PAGES_COLLECTION_ID;

    try {
        // now add to database
        await database.createDocument(
            databaseId,
            imageCollectionId,
            ID.unique(),
            {
                filename: newFileName,
                pdf_file_id: pdfFileId,
                github_owner: owner || "unknown",
                github_repo: repo || "unknown",
                page_number: pageNumber,
            }
        );

        console.log(`Document created successfully - page: ${pageNumber}`);
        console.log("-".repeat(50));

        // fs.unlinkSync(imageFilePath);

        return true;

    } catch (error) {
        console.error(`Error creating document - page: ${pageNumber}`);
        console.error(error);
        return false;
    }

    console.log("-".repeat(50));
    return false;
}

export default uploadPageImage;