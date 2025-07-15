# unit_test_server/Dockerfile
FROM python:3.10-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY unit_test_server /app/unit_test_server

CMD ["python","-u","-m","unit_test_server.app"]
