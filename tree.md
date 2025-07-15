# Folder Structure
_Last scanned: 2025-07-15 01:07:20_

```
caraone_uts/
├── .env
├── .env.example
├── .git
│   ├── HEAD
│   ├── branches
│   ├── config
│   ├── description
│   ├── hooks
│   │   ├── applypatch-msg.sample
│   │   ├── commit-msg.sample
│   │   ├── fsmonitor-watchman.sample
│   │   ├── post-update.sample
│   │   ├── pre-applypatch.sample
│   │   ├── pre-commit.sample
│   │   ├── pre-merge-commit.sample
│   │   ├── pre-push.sample
│   │   ├── pre-rebase.sample
│   │   ├── pre-receive.sample
│   │   ├── prepare-commit-msg.sample
│   │   ├── push-to-checkout.sample
│   │   └── update.sample
│   ├── info
│   │   └── exclude
│   ├── objects
│   │   ├── info
│   │   └── pack
│   └── refs
│       ├── heads
│       └── tags
├── .gitignore
├── Dockerfile
├── README.md
├── docker-compose.yml
├── requirements.txt
├── tests
│   ├── user_invalid
│   │   ├── test_login_invalid.py
│   │   ├── test_profile_invalid.py
│   │   └── test_token_invalid.py
│   └── user_valid
│       ├── test_login.py
│       ├── test_profile.py
│       └── test_token.py
└── unit_test_server
    ├── __init__.py
    ├── app.py
    ├── celery_worker.py
    ├── config.py
    ├── error_handlers.py
    ├── middleware.py
    ├── routes
    │   ├── __init__.py
    │   ├── api
    │   │   ├── __init__.py
    │   │   ├── cache.py
    │   │   ├── results.py
    │   │   └── tests.py
    │   ├── web.py
    │   └── websocket.py
    ├── runtime.py
    ├── socket.py
    ├── static
    │   ├── css
    │   │   └── styles.css
    │   └── js
    │       ├── api.js
    │       ├── filter.js
    │       ├── main.js
    │       ├── socket.js
    │       ├── toast.js
    │       └── ui.js
    ├── tasks.py
    ├── templates
    │   ├── components
    │   │   ├── header.html
    │   │   ├── modal.html
    │   │   ├── stats.html
    │   │   └── test_results.html
    │   └── index.html
    ├── test_discovery.py
    └── test_runner.py
```

