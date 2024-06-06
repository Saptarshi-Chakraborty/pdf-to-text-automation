import { pdf } from "pdf-to-img";
import path from "path";
import uploadPageImage from "../lib/uploadPageImage.js";

async function pdfToImage(pdfFilePath, pdfFileId, start = null, end = null) {

    const pdfFileName = path.basename(pdfFilePath);
    let counter = 1;
    let fileNames = [];

    try {

        // convert only the specified pages
        if (start && end) {
            const document = await pdf(pdfFilePath, { combinedImage: false, combinedImageType: "jpg", combinedImageOutputPath: "./images", start, end });

            for await (const image of document) {
                if (counter > end) break;
                if (counter < start) {
                    counter++;
                    continue;
                }

                const uploadResult = await uploadPageImage(counter, image, "image.jpg", pdfFileId);
                console.log(`upload result: ${uploadResult} - page:`, counter);

                counter++;
            }

            console.log("PDF converted to image successfully");
            return fileNames;
        }

        // convert all pages
        const document = await pdf(pdfFilePath, { combinedImage: false, combinedImageType: "jpg", combinedImageOutputPath: "./images" });

        for await (const image of document) {

            const uploadResult = await uploadPageImage(counter, image, "image.jpg", pdfFileId);
            console.log(`upload result: ${uploadResult} - page:`, counter);

            counter++;
        }

        console.log("PDF converted to image successfully");
        return fileNames;

    } catch (err) {
        console.log(err);
        console.log("Error converting pdf to image in pdfToImage.js");
        return false;
    }

    return false;
}


export default pdfToImage;