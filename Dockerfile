FROM python:3.11-slim-buster
WORKDIR /app
ADD . /app
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
# Para homologacao use:
CMD ["python3", "app.py"]
# Para producao use:
# CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "app:app"]
