from redis import Redis, ConnectionError as RedisConnectionError
import time

class SafeRedis:
    def __init__(self, host='localhost', port=6379, db=0):
        try:
            self.redis = Redis(host=host, port=port, db=db)
            self.redis.ping()  # Test connection
            self.connected = True
            print("✅ Connected to Redis server.")
        except RedisConnectionError:
            print("⚠️ Warning: Could not connect to Redis. Falling back to in-memory storage.")
            self.redis = None
            self.connected = False
            self.storage = {}  # fallback dictionary

    def setex(self, key, expiry, value):
        if self.connected:
            self.redis.setex(key, expiry, value)
        else:
            self.storage[key] = (value, time.time() + expiry)

    def get(self, key):
        if self.connected:
            return self.redis.get(key)
        else:
            item = self.storage.get(key)
            if item:
                value, expires_at = item
                if time.time() < expires_at:
                    return value.encode() if isinstance(value, str) else value
                else:
                    del self.storage[key]
            return None

    def exists(self, key):
        if self.connected:
            return self.redis.exists(key)
        else:
            return key in self.storage


if __name__ == "__main__":
    # Instantiate SafeRedis instead of raw Redis
    r = SafeRedis()
