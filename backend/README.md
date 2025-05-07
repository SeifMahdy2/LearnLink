# Backend Server

This directory contains the backend server for the learning platform application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables by creating a `.env` file with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
SERPAPI_API_KEY=your_serpapi_api_key
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5000/oauth2callback
FLASK_SECRET_KEY=your_secure_random_string
FLASK_DEBUG=False
```

3. Place your Firebase credentials file at `firebase-adminsdk.json` in this directory.

4. Start the server:
```bash
python app.py
```

## Environment Variables

- `FLASK_SECRET_KEY`: Used for secure session management. If not provided, a default one will be used (not recommended for production).
- `FLASK_DEBUG`: Set to "True" for development mode with auto-reloading. Set to "False" for production.
- `PORT`: Specify the port to run the server on (default is 5000).

## Session Management

The application uses filesystem-based sessions for more reliable user authentication. Make sure you have installed the Flask-Session package:

```bash
pip install Flask-Session
```

## Required Packages

In addition to the packages listed in requirements.txt, you may need:

- `flask-session`: For improved session management
- `transformers`: For machine learning capabilities
- `torch`: For Hugging Face models
- `google-api-python-client`: For Google Drive integration
- `firebase-admin`: For Firebase integration
- `openai`: For OpenAI API integration

## Troubleshooting

If you encounter login issues:
1. Make sure the `FLASK_SECRET_KEY` environment variable is set and remains constant between server restarts
2. Check that the `flask_session` directory has been created and is writable
3. Verify that Firebase is properly initialized
4. Check the server logs for any errors during login attempts 