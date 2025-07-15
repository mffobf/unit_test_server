# Flask Test Runner

A real-time backend test execution and monitoring system built with Flask, Celery, and Redis.

## Features

- **Real-time Test Execution**: Run tests asynchronously with live updates
- **Test Discovery**: Automatically discover and organize tests by endpoint groups
- **WebSocket Integration**: Real-time status updates via Socket.IO
- **Responsive UI**: Clean, modern interface built with TailwindCSS
- **Test Organization**: Organize tests by folders (endpoint groups)
- **Detailed Results**: View test output, errors, and execution time

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Flask App     │    │   Celery        │
│   (HTML/JS)     │◄──►│   (Web Server)  │◄──►│   (Task Queue)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Socket.IO     │    │   Test Runner   │
                       │   (Real-time)   │    │   (Pytest)      │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │     Redis       │
                                │  (Message Bus)  │
                                └─────────────────┘
```

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd flask-test-runner
chmod +x setup.sh
./setup.sh
```

### 2. Start Redis

```bash
# Using Docker (recommended)
docker run -d -p 6379:6379 --name redis redis

# Or using Docker Compose
docker-compose up -d redis
```

### 3. Start the Application

```bash
# Terminal 1: Start Flask app
source venv/bin/activate
python app.py

# Terminal 2: Start Celery worker
source venv/bin/activate
celery -A celery_worker.celery_app worker --loglevel=info
```

### 4. Access the Interface

Open your browser and navigate to: http://localhost:5000

## Using Docker Compose

For a complete setup with all services:

```bash
docker-compose up -d
```

This will start:
- Redis server
- Flask application
- Celery worker

## Test Organization

Organize your tests in the `tests/` directory by endpoint groups:

```
tests/
├── user/
│   ├── test_login.py
│   └── test_profile.py
├── auth/
│   ├── test_token.py
│   └── test_permissions.py
├── api/
│   └── test_endpoints.py
└── database/
    └── test_connection.py
```

## Writing Tests

Tests should be standard pytest functions:

```python
# tests/user/test_login.py
def test_valid_login():
    """Test successful login"""
    # Your test code here
    assert True

def test_invalid_login():
    """Test failed login"""
    # Your test code here
    assert False, "Login should fail"
```

## API Endpoints

- `GET /` - Web interface
- `GET /api/tests` - Get all available tests
- `POST /api/run-test` - Run a specific test
- `GET /api/test-results` - Get all test results

## WebSocket Events

- `connect` - Client connected
- `test_update` - Real-time test result updates

## Configuration

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```
