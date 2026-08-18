FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY --exclude=**/__pycache__ --exclude=**/*.egg-info --exclude=**/*.py[co] src ./src

CMD ["python", "-m", "src.main"]