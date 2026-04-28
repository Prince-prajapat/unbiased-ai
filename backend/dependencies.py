from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth
import os

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify the Firebase ID token and return the user ID (UID).
    If Firebase is not configured (e.g., local dev without keys), 
    fallback to "anonymous".
    """
    token = credentials.credentials
    try:
        # Check if Firebase App is initialized
        if not firebase_admin._apps:
            return "anonymous"
        
        decoded_token = auth.verify_id_token(token)
        return decoded_token.get("uid", "anonymous")
    except Exception as e:
        print(f"Token verification error: {e}")
        if os.getenv("FIREBASE_PROJECT_ID"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return "anonymous"
