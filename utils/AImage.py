from werkzeug.datastructures import FileStorage
from PIL import Image
import numpy as np
from deepface import DeepFace
import io
from typing import List

class AImage:
    """
    Manages receiving images, manipulating them with DeepFace
    and sending back using Flask
    """

    def __init__(self, fileImage: FileStorage):
        # Convert the image to a format usable by PIL (Python Imaging Library)
        image = Image.open(fileImage.stream)

        # Convert the PIL image to a format DeepFace can process (OpenCV format)
        rgb_image = image.convert('RGB')  # Ensure image is in RGB format
        numpy_image = np.array(rgb_image)  # Convert PIL image to NumPy array

        self.__numpy_image = numpy_image

        faces = self.__extract_faces_or_raise_user_friendly_error()

        if len(faces) > 1:
            raise Exception("More than one face was found in this image")
        
        self.__face = faces[0]  

        if not self.__face['is_real']:
            raise Exception("The detected face is not real")

    def __extract_faces_or_raise_user_friendly_error(self):
        try:
            return DeepFace.extract_faces(self.__numpy_image, anti_spoofing=True)
        except Exception as ex:
            raise Exception("No faces were found in this image")

    def to_embedding(self) -> List[float]:
        """
        Converts the detected face into an embedding
        """

        # Using Facenet to get a 128 length vector (database length)
        embeddings = DeepFace.represent(self.__numpy_image, model_name='Facenet', detector_backend='mtcnn')
        
        if len(embeddings) != 1:
            raise Exception("Error calculating embeddings")
        
        return embeddings[0]['embedding']
        
    def to_bytes(self):
        """
        Converts the detected face into bytes
        """

        face_pixels = self.__face['face']
        
        # Convert the numpy array (face) from BGR to RGB
        face_pixels = face_pixels[..., ::-1]  # Invertir los canales de color BGR -> RGB

        # Convert the numpy array (face) back to a Pillow image
        face_image = Image.fromarray((face_pixels * 255).astype(np.uint8))

        # Save the face image to an in-memory file using Pillow
        face_image_bytes = io.BytesIO()
        face_image.save(face_image_bytes, format='JPEG')
        face_image_bytes.seek(0)

        return face_image_bytes
    
