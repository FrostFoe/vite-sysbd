<?php

class RedisCache
{
    private $redis;
    private $enabled;
    private $ttl;

    public function __construct($ttl = 3600)
    {
        $this->ttl = $ttl;
        $this->enabled = false;

        try {
            if (extension_loaded('redis')) {
                $this->redis = new Redis();
                if (@$this->redis->connect('127.0.0.1', 6379, 1)) {
                    $this->enabled = true;
                }
            }
        } catch (Exception $e) {
            error_log("Redis connection failed: " . $e->getMessage());
            $this->enabled = false;
        }
    }

    public function isEnabled()
    {
        return $this->enabled;
    }

    public function get($key)
    {
        if (!$this->enabled) {
            return null;
        }

        try {
            $value = $this->redis->get($key);
            return $value ? json_decode($value, true) : null;
        } catch (Exception $e) {
            error_log("Redis get error: " . $e->getMessage());
            return null;
        }
    }

    public function set($key, $value, $ttl = null)
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            $ttl = $ttl ?: $this->ttl;
            return $this->redis->setex($key, $ttl, json_encode($value));
        } catch (Exception $e) {
            error_log("Redis set error: " . $e->getMessage());
            return false;
        }
    }

    public function delete($key)
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            return $this->redis->del($key) > 0;
        } catch (Exception $e) {
            error_log("Redis delete error: " . $e->getMessage());
            return false;
        }
    }

    public function deleteByPattern($pattern)
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            $keys = $this->redis->keys($pattern);
            if (!empty($keys)) {
                return $this->redis->del(...$keys) > 0;
            }
            return false;
        } catch (Exception $e) {
            error_log("Redis deleteByPattern error: " . $e->getMessage());
            return false;
        }
    }

    public function flush()
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            return $this->redis->flushDB();
        } catch (Exception $e) {
            error_log("Redis flush error: " . $e->getMessage());
            return false;
        }
    }

    public function increment($key, $value = 1)
    {
        if (!$this->enabled) {
            return false;
        }

        try {
            return $this->redis->incrBy($key, $value);
        } catch (Exception $e) {
            error_log("Redis increment error: " . $e->getMessage());
            return false;
        }
    }

    public function __destruct()
    {
        if ($this->enabled && $this->redis) {
            try {
                $this->redis->close();
            } catch (Exception $e) {
                // Ignore
            }
        }
    }
}
