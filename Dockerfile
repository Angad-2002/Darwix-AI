FROM python:3.11.11-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libmagic1 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files and run migrations
RUN python manage.py collectstatic --noinput && \
    python manage.py migrate

# Create a script to run migrations on container start
RUN echo '#!/bin/bash\npython manage.py migrate\nexec "$@"' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# Start Gunicorn
CMD ["gunicorn", "darwix_ai.wsgi:application", "--bind", "0.0.0.0:8000"] 