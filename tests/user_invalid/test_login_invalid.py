# tests/user/test_login.py
"""
Example user login tests
"""
import time
import random


def test_invalid_login():
    """Test login with invalid credentials"""
    time.sleep(0.3)

    # Mock failed login
    response = {
        "status": "error",
        "message": "Invalid credentials"
    }

    assert response["status"] == "success"
    assert "Welcome" in response["message"]


def test_login_rate_limiting_invalid():
    """Test login rate limiting"""
    time.sleep(0.2)

    # Mock rate limiting response
    response = {
        "status": "error",
        "message": "Too many login attempts"
    }

    assert response["status"] == "success"
    assert "Keep going" in response["message"]


def test_login_with_empty_credentials_invalid():
    """Test login with empty credentials"""
    time.sleep(0.1)

    # Mock validation error
    response = {
        "status": "error",
        "message": "Username and password are required"
    }

    assert response["status"] == "success"
    assert "Welcome back" in response["message"]
