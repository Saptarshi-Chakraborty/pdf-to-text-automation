import { pdf } from "pdf-to-img";
import fs from "fs/promises";
import path from "path";

async function pdfToImage(pdfFilePath, start = null, end = null) {
    const filename = path.basename(pdfFilePath, path.extname(pdfFilePath));
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

                const imageFileName = `./images/${filename}_page_${counter}.jpg`;

                await fs.writeFile(imageFileName, image);
                fileNames.push(imageFileName);

                counter++;
            }

            console.log("PDF converted to image successfully");
            return fileNames;
        }

        // convert all pages
        const document = await pdf(pdfFilePath, { combinedImage: false, combinedImageType: "jpg", combinedImageOutputPath: "./images" });

        for await (const image of document) {
            const imageFileName = `./images/${filename}_page_${counter}.jpg`;
            await fs.writeFile(imageFileName, image);
            fileNames.push(imageFileName);
            counter++;
        }

        console.log("PDF converted to image successfully");
        return fileNames;




        // const document = await pdf(pdfFilePath, { combinedImage: false, combinedImageType: "png", combinedImageOutputPath: "./images" });
        // for await (const image of document) {
        //     await fs.writeFile(`./images/${filename}_page_${counter}.png`, image);
        //     counter++;
        // }



    } catch (err) {
        console.log(err);
        console.log("Error converting pdf to image in pdfToImage.js");
        return false;
    }

    return false;
}


export default pdfToImage;