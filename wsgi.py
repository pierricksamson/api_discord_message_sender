from waitress import serve
from app import app

app.debug = False

if app.secret_key == "dev-secret-change-me":
    raise RuntimeError('Please change secret for securtiy')

if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000, threads=4)