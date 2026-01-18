#!/usr/bin/env python3
"""
Test script to verify the travel system API is working correctly.
Run this AFTER starting the backend server.
"""

import requests
import json
import sys

BACKEND_URL = "http://localhost:8000"


def test_health():
    """Test if backend is running"""
    print("Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"✓ Backend is healthy: {response.json()}\n")
        return True
    except Exception as e:
        print(f"✗ Backend is not responding: {e}\n")
        return False


def test_travel_chat():
    """Test the travel system chat endpoint"""
    print("Testing travel system chat...")
    payload = {
        "message": "I want to visit Tokyo for 5 days",
        "thread_id": "test-thread-1",
        "resume": False,
    }

    try:
        response = requests.post(
            f"{BACKEND_URL}/api/travel-system/chat", json=payload, timeout=60
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✓ Chat endpoint working!")
            print("\nResponse:")
            print(json.dumps(data, indent=2))
            return True
        else:
            print(f"✗ Chat endpoint returned status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print("✗ Request timed out (backend is slow or hanging)")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    print("=" * 60)
    print("Multi-Agent Travel Planner - Backend Test")
    print("=" * 60 + "\n")

    # Test health
    if not test_health():
        print("ERROR: Backend is not running!")
        print("Start the backend with:")
        print("  cd backend")
        print("  python -m uvicorn app.main:app --reload --port 8000")
        sys.exit(1)

    # Test chat
    print("-" * 60)
    if test_travel_chat():
        print("\n" + "=" * 60)
        print("✓ All tests passed! Backend is working correctly.")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("✗ Chat test failed. Check backend logs above.")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
