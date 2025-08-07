"""
Shared schema definitions for API responses
"""

from typing import List, Optional

class ProgressResponse:
    def __init__(self, is_active: bool, current: int, total: int, 
                 success_count: int, failure_count: int, logs: List[str]):
        self.is_active = is_active
        self.current = current
        self.total = total
        self.success_count = success_count
        self.failure_count = failure_count
        self.logs = logs

class StatusResponse:
    def __init__(self, is_active: bool, completed: bool, total_processed: int,
                 success_count: int, failure_count: int, logs: List[str]):
        self.is_active = is_active
        self.completed = completed
        self.total_processed = total_processed
        self.success_count = success_count
        self.failure_count = failure_count
        self.logs = logs
