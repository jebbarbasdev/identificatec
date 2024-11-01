import cloudinary
import cloudinary.uploader

from utils.AImage import AImage

# Config is made automaticaly by cloudinary using the CLOUDINARY_URL env variable
cloudinary.config(secure=True)

def upload_aimage(aimage: AImage) -> str:
    """
    Converts the aimage to bytes and then submits them to cloudinary, returning
    the secure_url of the uploaded image
    """

    bytes = aimage.to_bytes()
    response = cloudinary.uploader.upload(bytes, resource_type="image")

    return response['secure_url']