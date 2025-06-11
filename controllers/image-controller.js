const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelpers");
const cloudinary = require("../config/cloudinary");
const fs =  require("fs");

const uploadImageController = async (req, res) => {
 try {
    // Check if the file is missing in the req object
     if(!req.file) {
         return res.status(400).json({
             success: false,
             message: 'File is required. Please uploaded an image',
         })
     }
     // File exists -> upload to cloudinary
     const { url, publicId } = await uploadToCloudinary(req.file.path);

     // store the image url and public ID alog with the uploaded user ID in database
     const newlyUploadedImage = new Image({
         url,
         publicId,
         uploadedBy: req.userInfo.userId,
     })

     await newlyUploadedImage.save();

     // delete the file from local storage
     fs.unlinkSync(req.file.path);


     res.status(201).json({
         success: true,
         message: 'Image uploaded successfully',
         image: newlyUploadedImage,
     })
 } catch(error) {
     console.log(error);
     res.status(500).json({
         success: false,
         message: 'Something went wrong!!! Please try again.'
     })
 }
}

const fetchImagesController = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sort || 'created_at';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : - 1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);
        const sortObject = {};
        sortObject[sortBy] = sortOrder;

        const images = await Image.find()
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
        if(images) {
            res.status(200).json({
                success: true,
                currentPage: page,
                totalPages: totalPages,
                totalImages: totalImages,
                data: images,
            })
        }
    } catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again."
        })
    }
}

const deleteImageController = async(req, res) => {
    try {
        const getCurrentIdOfImageToBeDeleted  = req.params.id;
        const userId = req.userInfo.userId;

        // recherche de l'image
        const image = await Image.findById(getCurrentIdOfImageToBeDeleted );

        if(!image) {
            return res.status(404).json({
                sucess: false,
                message: 'Image not found',
            })
        }
        //check if this image is uploaded by the current user who is trying to delete this image
        if (image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: `You are not authorized to delete this image because you haven't uploaded it`,
            })
        }
        // Suppression de l'image sur Cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // Suppression de l'image dans MongoDB
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted)

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
        })

    } catch(error)  {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong! Please try again."
        })
    }

}

module.exports = { uploadImageController, fetchImagesController, deleteImageController };