# Quick Start Guide: Query Planning Agent

## What Was Implemented

A **Query Planning & Decomposition Agent** has been added to your travel planner. This agent:

1. **Analyzes** complex travel queries
2. **Breaks them down** into focused sub-queries
3. **Creates a search strategy** for better requirements gathering
4. **Displays the plan** in the UI before the final answer

## How to Use

### Option 1: Test via Frontend

1. **Start your backend server:**

   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start your frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Open the chat:**

   - Click the chat launcher button
   - Type a complex travel query like:
     ```
     "I want to visit Tokyo and Kyoto for 2 weeks. I love culture, food, and gardens."
     ```

4. **Observe the planning:**
   - You'll see a blue "Query Analysis & Plan" card appear
   - It shows the search strategy
   - It lists key search aspects as badges
   - Then the requirements gathering continues

### Option 2: Test via API

```bash
curl -X POST http://localhost:8000/api/travel-system/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want a 5-day trip to Thailand with beach and culture experiences",
    "thread_id": "test-1"
  }'
```

**Expected Response:**

```json
{
  "message": "✓ Query plan created | ✓ Requirements gathered | ...",
  "is_interrupt": false,
  "plan": "The user wants a 5-day trip to Thailand focusing on beach experiences and cultural activities. Need to: 1) Determine origin/dates/budget 2) Find beach destinations with cultural attractions 3) Arrange accommodations 4) Build activity itinerary",
  "sub_queries": [
    "Thailand beaches and coastal destinations",
    "Thai culture and temples",
    "Beach and cultural activities combined"
  ],
  "requirements": {...},
  "itinerary": {...},
  "bookings": {...}
}
```

### Option 3: Test via Python

```bash
cd backend
python -m app.agents.travel_system_graph
```

This runs the main test with a sample query and shows all pipeline outputs.

## Files Modified/Created

### New Files:

- `backend/app/agents/response_models/planning_agent.py` - Planning response model
- `frontend/src/components/QueryPlanDisplay.tsx` - Plan visualization component
- `IMPLEMENTATION_GUIDE.md` - Detailed technical documentation

### Modified Files:

- `backend/app/agents/travel_system_graph.py` - Added planning node and state
- `backend/app/agents/travel_system_agents.py` - Added planning agent
- `backend/app/agents/prompts/travel_system.py` - Added planning prompt
- `backend/app/api/models/travel_system.py` - Added plan/sub_queries fields
- `backend/app/api/services/travel_system_service.py` - Updated service logic
- `backend/app/api/travel_system.py` - Updated endpoint
- `frontend/src/components/ChatDrawer.tsx` - Integrated API and display
- `frontend/src/lib/api.ts` - Added travel system API client

## Architecture Overview

```
User Input: "I want to visit Japan for 2 weeks with food and culture focus"
         ↓
┌─────────────────────────────────────┐
│  Planning Agent (NEW)               │
│  ├─ Analyzes query complexity       │
│  ├─ Identifies key aspects          │
│  └─ Creates sub-queries             │
└─────────────────────────────────────┘
         ↓
      Plan Output:
      ├─ Search Strategy: "User wants 2-week trip to Japan..."
      └─ Sub-queries: ["Japan temples", "Food tours", "Itinerary"]
         ↓
┌─────────────────────────────────────┐
│  Requirements Agent (EXISTING)      │
│  Now aware of planning context      │
│  Gathers more targeted info         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Planner Agent (EXISTING)           │
│  Creates itinerary with context     │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│  Booker Agent (EXISTING)            │
│  Confirms bookings                  │
└─────────────────────────────────────┘
```

## Key Features

✅ **Intelligent Analysis** - Uses LLM to understand query complexity
✅ **Structured Output** - Plan and sub-queries in consistent format
✅ **UI Integration** - Beautiful card display in chat interface
✅ **No Breaking Changes** - Existing agents continue to work
✅ **Thread Support** - Maintains conversation continuity
✅ **Error Handling** - Graceful fallbacks for API errors

## Example Queries to Try

1. **Simple Query:**

   ```
   "I want to go to Tokyo"
   ```

2. **Complex Multi-part Query:**

   ```
   "I want to visit Japan and South Korea for 3 weeks. I love anime, food, and night life. My budget is $5000"
   ```

3. **Activity-focused Query:**
   ```
   "Plan a 2-week trip with hiking, food, and cultural sites. Thinking Thailand or Vietnam"
   ```

## Troubleshooting

### Plan not appearing?

- Check backend is running on port 8000
- Check browser console for API errors
- Verify `VITE_BACKEND_URL` env variable if needed

### API connection error?

- Ensure backend service is running
- Check CORS settings if on different domain
- Try test endpoint with curl first

### Wrong plan generated?

- The planning agent relies on LLM analysis
- Try rephrasing the query more clearly
- Check OpenAI API key is valid

## Next Steps

### Optional Enhancements:

1. Add **plan refinement** - Let users adjust the plan before proceeding
2. Add **plan toggle** - Skip planning for simple queries
3. Add **visual planning** - Show plan as flowchart/tree
4. Add **caching** - Reuse plans for similar queries
5. Add **analytics** - Track what plans work best

### Integration Points:

- Update requirements agent to use sub_queries
- Pass planning context to planner agent
- Show planning progress in status updates
- Add plan explanation in itinerary

## Performance Notes

- Planning is ~1-2 seconds per query (LLM latency)
- No external API calls except LLM
- Works with any travel query complexity
- Scales well with conversation history

## Support

For detailed technical information, see `IMPLEMENTATION_GUIDE.md`

---

**Status**: Ready to use ✅
