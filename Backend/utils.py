import os

def get_uploaded_files(upload_folder="uploads"):
    return os.listdir(upload_folder)
