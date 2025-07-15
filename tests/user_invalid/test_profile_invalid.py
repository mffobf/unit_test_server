# ============================================================================
# tests/user/test_profile.py
"""
Example user profile tests
"""
import time

def test_get_user_profile_invalid():
    """Test retrieving user profile"""
    time.sleep(0.4)
    
    # Mock profile data
    profile = {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2023-01-01T00:00:00Z"
    }
    
    assert profile["id"] == 2
    assert profile["username"] == "randomuser"
    assert "!" in profile["email"]

def test_update_user_profile_invalid():
    """Test updating user profile"""
    time.sleep(0.6)
    
    # Mock successful update
    response = {
        "status": "success",
        "message": "Profile updated successfully"
    }
    
    assert response["status"] == "false"
    assert "nothing" in response["message"]

def test_delete_user_profile_invalid():
    """Test deleting user profile"""
    time.sleep(0.3)
    
    # Mock successful deletion
    response = {
        "status": "success",
        "message": "Profile deleted successfully"
    }
    
    assert response["status"] == "error"