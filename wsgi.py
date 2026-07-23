from waitress import serve
from app import app
from src.config import Config

app.debug = False

if Config.SECRET_KEY == "dev-secret-change-me":
    raise RuntimeError('Please change secret for securtiy')

if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000, threads=4)