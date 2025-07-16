# Folder Structure
_Last scanned: 2025-07-16 12:56:13_

```
caraone_uts/
├── tests/
│   ├── fibonacci/
│   │   ├── fib.py
│   │   └── test_fib.py
│   ├── user_invalid/
│   │   ├── test_login_invalid.py
│   │   ├── test_profile_invalid.py
│   │   └── test_token_invalid.py
│   └── user_valid/
│       ├── test_login.py
│       ├── test_profile.py
│       └── test_token.py
├── unit_test_server/
│   ├── routes/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── cache.py
│   │   │   ├── memory.py
│   │   │   ├── results.py
│   │   │   └── tests.py
│   │   ├── __init__.py
│   │   ├── web.py
│   │   └── websocket.py
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       ├── api.js
│   │       ├── filter.js
│   │       ├── main.js
│   │       ├── modal.js
│   │       ├── socket.js
│   │       ├── toast.js
│   │       └── ui.js
│   ├── templates/
│   │   ├── components/
│   │   │   ├── header.html
│   │   │   ├── modal.html
│   │   │   ├── stats.html
│   │   │   └── test_results.html
│   │   └── index.html
│   ├── __init__.py
│   ├── app.py
│   ├── celery_worker.py
│   ├── config.py
│   ├── error_handlers.py
│   ├── memory_alerts.py
│   ├── memory_analytics.py
│   ├── memory_tracker.py
│   ├── middleware.py
│   ├── runtime.py
│   ├── socket.py
│   ├── tasks.py
│   ├── test_discovery.py
│   └── test_runner.py
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt
```

