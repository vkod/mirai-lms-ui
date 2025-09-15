# Q&A Feature API - UI Integration Guide

## Base URL
```
http://your-api-host:8000
```

## Core Endpoints

### 1. Submit Question
**POST** `/api/v1/qa/sessions`

Send a question to multiple prospects and get their AI-generated responses.

```json
Request:
{
  "question": "What are your insurance needs?",
  "prospect_ids": ["LEAD-001", "LEAD-002"],
  "image_base64": "optional-base64-image",
  "image_mime_type": "image/png"
}

Response:
{
  "session_id": "QS-ABC123",
  "status": "pending",
  "message": "Question submitted to 2 prospects",
  "created_at": "2024-01-15T10:30:00Z",
  "total_prospects": 2,
  "estimated_completion_time": 120
}
```

### 2. List Sessions
**GET** `/api/v1/qa/sessions?page=1&page_size=20&status_filter=in_progress,completed`

Get paginated list of Q&A sessions with filtering.

```json
Response:
{
  "sessions": [...],
  "total_count": 45,
  "page": 1,
  "page_size": 20,
  "total_pages": 3,
  "active_sessions_count": 5,
  "completed_sessions_count": 40
}
```

### 3. Get Session Details
**GET** `/api/v1/qa/sessions/{session_id}`

Get full details of a specific session including all responses.

```json
Response:
{
  "session_id": "QS-ABC123",
  "question": "What are your insurance needs?",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "responses": [
    {
      "persona": {
        "lead_id": "LEAD-001",
        "full_name": "John Doe",
        "lead_classification": "hot"
      },
      "answer": "I need life insurance for my family...",
      "answered_at": "2024-01-15T10:31:00Z",
      "confidence_score": 0.95
    }
  ],
  "summary": {
    "summary_text": "Most prospects expressed interest in life insurance",
    "key_insights": ["Family protection is top priority"],
    "sentiment_distribution": {"positive": 0.7, "neutral": 0.3}
  },
  "total_expected": 2,
  "total_responded": 2
}
```

### 4. Real-time Updates (SSE)
**GET** `/api/v1/qa/sessions/{session_id}/stream`

Subscribe to real-time updates via Server-Sent Events.

```javascript
// UI Implementation Example
const eventSource = new EventSource(`/api/v1/qa/sessions/${sessionId}/stream`);

eventSource.addEventListener('response_received', (event) => {
  const data = JSON.parse(event.data);
  // Update UI with new response
  updateResponseList(data.new_response);
  updateProgressBar(data.progress);
});

eventSource.addEventListener('session_completed', (event) => {
  const data = JSON.parse(event.data);
  // Show completion and summary
  showSummary(data.summary);
  eventSource.close();
});
```

### 5. Cancel Session
**POST** `/api/v1/qa/sessions/{session_id}/cancel`

Cancel an ongoing session.

```json
Response:
{
  "session_id": "QS-ABC123",
  "status": "failed",
  "message": "Session cancelled successfully",
  "cancelled_at": "2024-01-15T10:35:00Z"
}
```

## Key Features for UI

### Session Status Values
- `pending` - Question submitted, processing not started
- `in_progress` - Actively getting responses
- `completed` - All responses received, summary generated
- `failed` - Session failed or cancelled

### Lead Classifications
- `hot` - High-value prospect
- `warm` - Medium interest
- `cold` - Low engagement

### Filtering Options
- By status (multiple)
- By prospect ID
- By date range
- By search query (searches in questions)

### Pagination
- Default: 20 items per page
- Max: 100 items per page
- Sort by: created_at, completed_at, status
- Sort order: asc, desc

## UI Flow Recommendations

1. **Submit Question Flow**
   - Select prospects from list
   - Enter question (max 2000 chars)
   - Optionally attach image
   - Submit and get session ID
   - Redirect to session detail page

2. **Monitor Progress**
   - Use SSE connection for real-time updates
   - Show progress bar (responded/total)
   - Display responses as they arrive
   - Show summary when complete

3. **Session List View**
   - Show status badges with colors
   - Display response count
   - Enable filtering and search
   - Link to detail view

4. **Error Handling**
   - Show user-friendly messages
   - Allow retry for failed sessions
   - Handle SSE connection drops with reconnect

## Response Times
- Question submission: Immediate (returns session ID)
- Individual responses: 30-60 seconds each
- Full session completion: ~60 seconds per prospect
- SSE updates: Every 2 seconds when active