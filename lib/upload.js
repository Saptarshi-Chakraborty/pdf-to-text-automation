import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    // uuid name with file extension
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${uuidv4()}.${ext}`);
    }

});

// Create the multer instance
const upload = multer({ storage: storage });

export default upload;