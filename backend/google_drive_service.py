from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow, Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
import os
import pickle
from dotenv import load_dotenv
import hashlib

# Load environment variables
load_dotenv()

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]

class GoogleDriveService:
    def __init__(self, user_email=None):
        self.creds = None
        self.service = None
        
        # Load credentials from .env file
        self.client_id = os.getenv('GOOGLE_DRIVE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_DRIVE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_DRIVE_REDIRECT_URI')
        
        # Print for debugging
        if not self.client_id or not self.client_secret or not self.redirect_uri:
            print("WARNING: Missing Google Drive credentials in .env file")
            print(f"GOOGLE_DRIVE_CLIENT_ID: {'Set' if self.client_id else 'Missing'}")
            print(f"GOOGLE_DRIVE_CLIENT_SECRET: {'Set' if self.client_secret else 'Missing'}")
            print(f"GOOGLE_DRIVE_REDIRECT_URI: {'Set' if self.redirect_uri else 'Missing'}")
        
        self.folder_id = None
        self.user_email = user_email
        self.initialize_service()

    def _get_token_path(self):
        """Get the token file path for the current user."""
        if not self.user_email:
            return None
        
        # Create a hash of the email to use as filename
        email_hash = hashlib.md5(self.user_email.encode()).hexdigest()
        tokens_dir = 'user_tokens'
        
        # Create tokens directory if it doesn't exist
        if not os.path.exists(tokens_dir):
            os.makedirs(tokens_dir)
            
        return os.path.join(tokens_dir, f'token_{email_hash}.pickle')

    def is_authenticated(self):
        """Check if we have valid credentials."""
        return self.creds is not None and self.creds.valid

    def get_authorization_url(self):
        """Get the URL for Google OAuth consent screen."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=SCOPES
        )
        flow.redirect_uri = self.redirect_uri
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Force consent screen to allow multiple accounts
        )
        return authorization_url

    def handle_oauth2_callback(self, code):
        """Handle the OAuth2 callback and save credentials."""
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [self.redirect_uri]
                    }
                },
                scopes=SCOPES
            )
            flow.redirect_uri = self.redirect_uri
            
            # Fetch the token
            flow.fetch_token(code=code)
            self.creds = flow.credentials
            
            # Get user email
            service = build('oauth2', 'v2', credentials=self.creds)
            user_info = service.userinfo().get().execute()
            self.user_email = user_info['email']
            
            # Save the credentials for this user
            token_path = self._get_token_path()
            if token_path:
                with open(token_path, 'wb') as token:
                    pickle.dump(self.creds, token)
            
            # Initialize the Drive service
            self.service = build('drive', 'v3', credentials=self.creds)
            return self.user_email
            
        except Exception as e:
            print(f"Error in OAuth callback: {str(e)}")
            raise

    def initialize_service(self):
        """Initialize the Google Drive service."""
        # If we have a user email, try to load their credentials
        if self.user_email:
            token_path = self._get_token_path()
            if token_path and os.path.exists(token_path):
                with open(token_path, 'rb') as token:
                    self.creds = pickle.load(token)

            # If there are no (valid) credentials available, let the user log in.
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                    # Save the refreshed credentials
                    token_path = self._get_token_path()
                    if token_path:
                        with open(token_path, 'wb') as token:
                            pickle.dump(self.creds, token)
        
        # For anonymous uploads (no user email), check for service account credentials
        else:
            try:
                # Try to use service account for anonymous uploads if available
                service_account_path = os.getenv('GOOGLE_DRIVE_SERVICE_ACCOUNT', 'service-account.json')
                if os.path.exists(service_account_path):
                    from google.oauth2 import service_account
                    self.creds = service_account.Credentials.from_service_account_file(
                        service_account_path, scopes=SCOPES
                    )
                else:
                    # Fall back to client secrets file for development
                    client_secrets_path = os.getenv('GOOGLE_DRIVE_CLIENT_SECRETS', 'credentials.json')
                    if os.path.exists(client_secrets_path):
                        flow = InstalledAppFlow.from_client_secrets_file(client_secrets_path, SCOPES)
                        self.creds = flow.run_local_server(port=0)
            except Exception as e:
                print(f"Error initializing anonymous service: {e}")
                # We'll proceed with self.creds as None, which will limit functionality
                pass
        
        # Initialize the service if we have valid credentials
        if self.creds and self.creds.valid:
            self.service = build('drive', 'v3', credentials=self.creds)

    def get_or_create_folder(self):
        """Get or create the LearnLink folder."""
        try:
            # Search for existing LearnLink folder
            results = self.service.files().list(
                q="name='LearnLink' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                spaces='drive',
                fields='files(id, name)'
            ).execute()
            
            existing_folders = results.get('files', [])
            
            if existing_folders:
                # Use existing folder
                self.folder_id = existing_folders[0]['id']
                return {'success': True, 'folder_id': self.folder_id}
            else:
                # Create new folder
                folder_metadata = {
                    'name': 'LearnLink',
                    'mimeType': 'application/vnd.google-apps.folder'
                }
                
                folder = self.service.files().create(
                    body=folder_metadata,
                    fields='id'
                ).execute()
                
                self.folder_id = folder.get('id')
                return {'success': True, 'folder_id': self.folder_id}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def upload_file(self, file_path, file_name=None, learning_style=None):
        """Upload a file to the LearnLink folder in Google Drive with learning style metadata."""
        try:
            # Ensure we have a folder
            if not self.folder_id:
                folder_result = self.get_or_create_folder()
                if not folder_result['success']:
                    return folder_result

            if not file_name:
                file_name = os.path.basename(file_path)

            file_metadata = {
                'name': file_name,
                'parents': [self.folder_id],  # Add to LearnLink folder
                'properties': {
                    'learning_style': learning_style or 'visual',
                }
            }
            
            media = MediaFileUpload(file_path, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, properties'
            ).execute()
            
            return {
                'success': True, 
                'file_id': file.get('id'),
                'learning_style': file.get('properties', {}).get('learning_style', 'visual')
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def download_file(self, file_id, output_path):
        """Download a file from Google Drive."""
        try:
            request = self.service.files().get_media(fileId=file_id)
            with open(output_path, 'wb') as f:
                downloader = MediaIoBaseDownload(f, request)
                done = False
                while done is False:
                    status, done = downloader.next_chunk()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def list_files(self, page_size=10):
        """List files in the LearnLink folder."""
        try:
            # Ensure we have a folder
            if not self.folder_id:
                folder_result = self.get_or_create_folder()
                if not folder_result['success']:
                    return folder_result

            # Query for files in the LearnLink folder
            results = self.service.files().list(
                pageSize=page_size,
                q=f"'{self.folder_id}' in parents and trashed=false",
                fields="nextPageToken, files(id, name, mimeType, createdTime, properties)",
                spaces='drive'
            ).execute()
            
            # Verify each file still exists and is accessible
            accessible_files = []
            for file in results.get('files', []):
                try:
                    # Get full file metadata including properties
                    file_data = self.service.files().get(
                        fileId=file['id'],
                        fields='id, name, mimeType, createdTime, properties'
                    ).execute()
                    
                    # Add learning style to the file metadata
                    if 'properties' not in file_data:
                        file_data['properties'] = {'learning_style': 'visual'}
                    elif 'learning_style' not in file_data['properties']:
                        file_data['properties']['learning_style'] = 'visual'
                    
                    # Add file to accessible list
                    accessible_files.append(file_data)
                except Exception:
                    continue
                    
            return {'success': True, 'files': accessible_files}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_file_metadata(self, file_id):
        """Get file metadata from Google Drive."""
        try:
            file = self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType'
            ).execute()
            return {
                'success': True,
                'id': file.get('id'),
                'name': file.get('name'),
                'mimeType': file.get('mimeType')
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def delete_file(self, file_id):
        """Delete a file from Google Drive."""
        try:
            # First check if the file exists and is accessible
            try:
                self.service.files().get(fileId=file_id).execute()
            except Exception as e:
                return {'success': False, 'error': 'File not found or not accessible'}

            # If file exists, try to delete it
            self.service.files().delete(fileId=file_id).execute()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)} 