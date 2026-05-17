import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firebase
# Make sure serviceAccountKey.json is available in the deployment environment.
# For local dev, you'll need to download it from Firebase Console.
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"Failed to initialize Firebase: {e}")
    db = None

# Helper functions
def create_user_profile(uid, email, preferences):
    """Store user profile in Firestore"""
    if not db:
        return None
    user_ref = db.collection('users').document(uid)
    user_ref.set({
        'email': email,
        'preferences': preferences,
        'created_at': firestore.SERVER_TIMESTAMP
    })
    return True
