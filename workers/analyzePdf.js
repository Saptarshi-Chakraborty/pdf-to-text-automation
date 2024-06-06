import { fromBuffer, fromPath } from "pdf2pic";
import { database } from "../lib/appwrite.js";
import { Query } from "node-appwrite";
import fs from "fs";
import pdfToImage from "./pdfToImage.js";
import uploadPageImage from "../lib/uploadPageImage.js";

async function analyzePdf(req, res, next) {

    const databaseId = process.env.APPWRITE_DATABASE_ID;
    const pdfCollectionId = process.env.APPWRITE_PDF_COLLECTION_ID;

    let pdfData = null;
    try {
        const result = await database.listDocuments(
            databaseId,
            pdfCollectionId,
            [
                Query.equal('analyzed', false),
                Query.limit(1)
            ]
        );

        if ((result && result.documents) && result.documents.length != 1) {
            return res.status(200).json({ status: "success", message: "No PDFs to analyze" });
        }

        pdfData = result.documents[0];
    } catch (error) {
        console.error("Error getting document");
        console.error(error);

        return res.status(500).json({ status: "error", message: "Error getting document" });
    }

    // get pdf creation datetime
    const pdfCreatedAt = pdfData.$createdAt;

    // if the pdf is not older than 5 minutes, return
    const pdfCreatedDate = new Date(pdfCreatedAt);
    const currentDate = new Date();
    const diff = currentDate - pdfCreatedDate;
    const diffInMinutes = Math.floor(diff / 60000);

    if (diffInMinutes < 5) {
        return res.status(200).json({ status: "success", message: "PDF is not older than 5 minutes" });
    }

    // check if the last_converted_page is greater than the total pages
    if (pdfData.last_converted_page >= pdfData.total_pages) {
        await document.updateDocument(
            databaseId,
            pdfCollectionId,
            pdfData.$id,
            {
                analyzed: true
            });

        return res.status(200).json({ status: "success", message: "All pages converted" });
    }



    // get the download url
    const downloadUrl = pdfData.download_url;
    // create preview url
    const previewUrl = `https://${pdfData.github_owner}.github.io/${pdfData.github_repo}/${pdfData.filename}`;

    // fetch pdf from the url and store it in the images folder
    const pdfUrl = previewUrl;
    const pdfPath = `./pdfs/${pdfData.filename}`;
    const pdf = await fetch(pdfUrl).then(response => response.blob());
    const pdfBuffer = await pdf.arrayBuffer();
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));

    // set the starting page for pdf to image conversion
    let startingPage = pdfData.last_converted_page || 1;
    if (startingPage < 1) startingPage = 1;
    else if (startingPage > 1) startingPage += 1;

    let endingPage = startingPage + 1;
    if (endingPage > pdfData.total_pages) endingPage = pdfData.total_pages;

    try {
        // convert pdf pages to images
        const pageConvertResult = await pdfToImage(pdfPath, pdfData.$id, startingPage, endingPage);

        if (pageConvertResult === false) {
            throw new Error("Error converting pdf to image - pdfToImage function returned false");
        }
 
        // update the pdf data in the database
        const updateResult = await database.updateDocument(
            databaseId,
            pdfCollectionId,
            pdfData.$id,
            {
                last_converted_page: startingPage + 1
            }
        );
        // console.log(updateResult);

        console.log(`>> Document updated successfully - ${pdfData.filename}`)
        console.log(`>> last_converted_page from ${startingPage} to ${startingPage + 1}`);

        
    } catch (err) {
        console.log(err);
        console.log("Error converting pdf to image in pdfToImage.js");
        return res.status(500).json({ status: "error", message: "Error converting pdf to image" });
    }

    return res.status(200).json({ status: "success", message: "Analyze PDF", previewUrl, pdf: pdfData });
}

export default analyzePdf;