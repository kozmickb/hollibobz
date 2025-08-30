# TripTick Interactive Checklist Feature

## Example Usage

When a user asks HollyBobz for an itinerary like:
> "Can you create a 3-day itinerary for Paris?"

HollyBobz will automatically receive enhanced instructions to format the response with both human-readable content and structured JSON.

## Expected AI Response Format

```
Here's your perfect 3-day Paris adventure! 🗼

**Day 1** will focus on the classic landmarks - you'll start with the iconic Eiffel Tower in the morning when crowds are lighter, then stroll along the Seine to the Louvre for an afternoon of world-class art.

**Day 2** takes you to charming Montmartre with its cobblestone streets and the stunning Sacré-Cœur, followed by exploring the trendy Marais district.

**Day 3** rounds out your trip with a peaceful morning at Luxembourg Gardens and some shopping along the Champs-Élysées.

```json
{
  "tripTitle": "3-Day Paris Adventure",
  "sections": [
    {
      "title": "Day 1: Classic Paris",
      "items": [
        "Visit Eiffel Tower (9:00 AM)",
        "Walk along Seine River",
        "Explore the Louvre Museum",
        "Lunch at traditional bistro",
        "Evening stroll through Tuileries Garden"
      ]
    },
    {
      "title": "Day 2: Artistic Montmartre",
      "items": [
        "Climb to Sacré-Cœur Basilica",
        "Explore Montmartre village",
        "Visit Place du Tertre (artist square)",
        "Lunch in Montmartre café",
        "Afternoon in Le Marais district",
        "Dinner at local brasserie"
      ]
    },
    {
      "title": "Day 3: Parks & Shopping",
      "items": [
        "Morning walk in Luxembourg Gardens",
        "Visit Panthéon",
        "Lunch near Latin Quarter",
        "Shopping on Champs-Élysées",
        "Final Seine river cruise"
      ]
    }
  ]
}
```
```

## What Happens Next

1. **Automatic Detection**: The app detects the JSON block in the response
2. **Validation**: Validates the JSON structure matches our schema
3. **Rendering**: Creates an interactive checklist with:
   - Progress tracking (0/15 complete)
   - Collapsible sections
   - Tickable items
   - Export options (text/CSV)
4. **Persistence**: All tick states saved to localStorage
5. **Accessibility**: WCAG AA compliant with proper ARIA labels

## Features

- ✅ **Persistent State**: Ticks survive page refreshes
- ✅ **Progress Tracking**: Live progress bar and counters  
- ✅ **Export Options**: Download as text or CSV files
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Dark Mode**: Automatic system preference detection
- ✅ **Accessibility**: Screen reader friendly, keyboard navigation
- ✅ **No Backend**: Pure client-side implementation

## Fallback Behaviour

If the AI doesn't return properly formatted JSON, users see a friendly prompt with a "Generate Checklist" button that re-requests the itinerary with explicit formatting instructions.
