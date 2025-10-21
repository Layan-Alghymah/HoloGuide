# HoloGuide Prototype

An AI-powered interactive guidance system for large events and exhibitions, designed to be displayed on fixed hologram devices at venue entrances to help visitors navigate and find locations.

## Features

### 🤖 AI Chat Interface
- Natural language processing for visitor questions
- Quick action buttons for common queries
- Voice input and output capabilities
- Real-time response generation

### 🗺️ Interactive Map System
- 2D floor plan visualization
- Interactive location markers with different categories
- Visual path drawing with arrows
- "You are here" indicator
- Zoom and pan controls

### 🎯 Smart Navigation
- Location-based responses
- Pathfinding visualization
- Category-based filtering
- Emergency and accessibility information

### 🎨 Modern UI/UX
- Split-screen layout (40% chat, 60% map)
- Touch-friendly interface for kiosks
- Responsive design for different screen sizes
- High contrast colors for accessibility

## Quick Start

1. **Clone or download** this repository
2. **Open** `index.html` in a web browser
3. **Start asking questions** like:
   - "Where is the bathroom?"
   - "Show me food courts"
   - "Where is the main stage?"
   - "Find parking"
   - "Emergency exits"

## File Structure

```
HoloGuide-prototype/
├── index.html              # Main application interface
├── styles.css              # All styling and responsive design
├── script.js               # Core functionality and AI logic
├── data/
│   └── venue-data.json     # Sample venue information
├── images/
│   └── sample-floor-plan.svg  # Sample floor plan
└── README.md               # This file
```

## Technical Implementation

### Frontend Technologies
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with Flexbox/Grid
- **Vanilla JavaScript** - No frameworks required
- **Web Speech API** - Voice input/output
- **SVG** - Scalable map graphics

### Data Structure
The venue data is stored in JSON format with:
- Location coordinates and metadata
- Path information for navigation
- Venue information and hours
- Emergency procedures

### AI Response System
- Rule-based response generation
- Pattern matching for common queries
- Location-aware responses
- Fallback responses for unknown queries

## Customization

### Adding New Locations
Edit `data/venue-data.json` to add new locations:

```json
{
  "id": "new_location",
  "name": "New Location Name",
  "type": "location_type",
  "coordinates": {"x": 200, "y": 300},
  "description": "Location description",
  "icon": "fas fa-icon-name"
}
```

### Supported Location Types
- `restroom` - Bathrooms and toilets
- `food` - Food courts and restaurants
- `stage` - Stages and presentation areas
- `exit` - Emergency and regular exits
- `parking` - Parking areas
- `info` - Information desks
- `service` - Services like charging stations
- `exhibition` - Exhibition halls

### Styling Customization
Modify `styles.css` to change:
- Color schemes
- Font sizes and families
- Layout proportions
- Animation effects

## Browser Compatibility

- **Chrome** 60+ (recommended)
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+

## Voice Features

The system supports voice interaction through:
- **Web Speech API** for voice recognition
- **Speech Synthesis** for voice output
- **Fallback to text** if voice is unavailable

## Responsive Design

The interface adapts to different screen sizes:
- **Desktop** - Full split-screen layout
- **Tablet** - Stacked layout with full-width sections
- **Mobile** - Optimized for touch interaction

## Accessibility Features

- High contrast color schemes
- Large, readable fonts
- Keyboard navigation support
- Screen reader compatibility
- Touch-friendly interface elements

## Future Enhancements

- Real-time venue data updates
- Multi-language support
- Advanced pathfinding algorithms
- Integration with venue management systems
- Analytics and usage tracking
- Mobile app companion

## License

This is a prototype demonstration project. Please ensure you have appropriate licenses for any production use.

## Support

For questions or issues with this prototype, please refer to the code comments or create an issue in the repository.

---

**HoloGuide** - Transforming events into interactive experiences through AI-powered holographic assistance.