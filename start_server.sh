#!/bin/bash

# Activate Python virtual environment
source env/bin/activate

# Start redis server
sudo service redis-server start

# Number of workers (adjust based on your CPU cores)
WORKERS=2

# Gunicorn command
gunicorn main:app --timeout 600 --bind 0.0.0.0:8000 --workers $WORKERS