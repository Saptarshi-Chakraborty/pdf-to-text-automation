

async function fileUpload(req, res) {
    try {
        if (req.files === null) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.files.file;

        file.mv(`${__dirname}/uploads/${file.name}`);


    } catch (err) {
        res.status(500).send(err);
        return;
    }

    res.json({ status: "success", message: 'File uploaded successfully' })
}

export default fileUpload;