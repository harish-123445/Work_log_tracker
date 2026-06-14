import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

load_dotenv()

FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH")
FIREBASE_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")

if not firebase_admin._apps:
    if FIREBASE_CRED_PATH and os.path.exists(FIREBASE_CRED_PATH):
        cred = credentials.Certificate(FIREBASE_CRED_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_DATABASE_URL
        })
    else:
        try:
            firebase_admin.initialize_app(options={
                'databaseURL': FIREBASE_DATABASE_URL
            })
        except Exception:
            # Avoid crashing immediately if no creds are found; let it fail on DB access
            pass

def get_db():
    """Returns the root reference to the Firebase Realtime Database."""
    if not firebase_admin._apps:
        # Try one more time or just let it raise error
        pass
    return db.reference()
