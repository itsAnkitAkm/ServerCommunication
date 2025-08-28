// priorityQueue.js
// ================================
// Redis Sorted Set as Priority Queue
// Use case: Task scheduling, Leaderboards, Queues with priorities
// Data type: ZSET
//
// TIME COMPLEXITY & LIMITS:
// - ZADD (insert): O(log N)
// - ZREM (remove): O(log N)
// - ZRANGE / ZREVRANGE (fetch range): O(log N + M) [M = number of results]
// - ZPOPMIN / ZPOPMAX (pop element): O(log N)
// Max elements in a sorted set: 2^32 - 1 (billions, practical memory limits apply)
//
// Priority Queue Logic:
// - Each element has a "score" = its priority.
// - Lower score = higher priority (like min-heap).
// ================================

const client = require("./client");

async function init() {
  // Clear old queue
  await client.del("taskQueue");

  // Insert tasks with priorities (score = priority)
  await client.zadd("taskQueue", 1, "Write report");  // High priority
  await client.zadd("taskQueue", 5, "Check emails"); // Low priority
  await client.zadd("taskQueue", 2, "Fix bug");      // Medium priority
  await client.zadd("taskQueue", 3, "Deploy app");

  // Fetch tasks sorted by priority (ascending order)
  const tasksAsc = await client.zrange("taskQueue", 0, -1, "WITHSCORES");
  console.log("Tasks by ascending priority:", tasksAsc);

  // Fetch tasks in reverse (descending priority)
  const tasksDesc = await client.zrevrange("taskQueue", 0, -1, "WITHSCORES");
  console.log("Tasks by descending priority:", tasksDesc);

  // Pop the highest priority task (lowest score)
  const poppedTask = await client.zpopmin("taskQueue");
  console.log("Popped (highest priority) task:", poppedTask);

  // Remaining tasks
  const remaining = await client.zrange("taskQueue", 0, -1, "WITHSCORES");
  console.log("Remaining tasks:", remaining);

  // Increase priority of a task (decrease score)
  await client.zincrby("taskQueue", -1, "Check emails"); // Move up in priority
  const updated = await client.zrange("taskQueue", 0, -1, "WITHSCORES");
  console.log("Updated priorities:", updated);
}

init();
