import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

async function uploadToGithub(file) {
    console.log("-".repeat(50));
    const owner = "storage-cluster-1";
    const repo = "pdf-to-text-automation-file-upload-1";
    let token = process.env["GITHUB_ACCESS_TOKEN"];

    console.log(file);

    const newFileName = `${uuid()}.${file.name.split(".").pop()}`;
    console.log("✅ new file name generated")

    try {
        console.log(`new file name: ${newFileName}`);

        // convert to base64
        const base64 = Buffer.from(file.data).toString("base64");
        console.log("✅ base64 conversion successful")

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
                "Content-Type": file.mimetype,
            },
            body: data,
        };

        let response = await fetch(url, config).then((res) => res.json());

        console.log(response);
        console.log("✅ File uploaded to Github successfully");

        console.log("-".repeat(50));

        return { file_name: newFileName, ...response };

    } catch (error) {
        console.log(error);
        console.log("❌ File upload to Github failed");
        console.log("-".repeat(50));
        return false;
    }
    console.log("-".repeat(50));
}

export default uploadToGithub;