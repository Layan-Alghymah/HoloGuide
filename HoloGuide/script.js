// HoloGuide JavaScript Application
class HoloGuide {
    constructor() {
        this.venueData = null;
        this.currentLocation = null;
        this.mapZoom = 1;
        this.voiceEnabled = true;
        this.voiceVolume = 0.7;
        this.synth = window.speechSynthesis;
        this.currentPath = null;
        
        this.init();
    }

    async init() {
        await this.loadVenueData();
        this.setupEventListeners();
        this.renderMap();
        this.setupVoice();
    }

    async loadVenueData() {
        try {
            const response = await fetch('data/venue-data.json');
            this.venueData = await response.json();
            this.currentLocation = this.venueData.venue.current_location;
        } catch (error) {
            console.error('Error loading venue data:', error);
            // Fallback data
            this.venueData = {
                venue: {
                    name: "Sample Convention Center",
                    current_location: { id: "entrance_main", name: "Main Entrance", coordinates: { x: 100, y: 400 } },
                    locations: [],
                    paths: []
                }
            };
        }
    }

    setupEventListeners() {
        // Chat input
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceBtn');

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.currentTarget.getAttribute('data-query');
                this.handleUserQuery(query);
            });
        });

        // Map controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('resetView').addEventListener('click', () => this.resetView());
        document.getElementById('toggleLegend').addEventListener('click', () => this.toggleLegend());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettings());
        document.getElementById('voiceEnabled').addEventListener('change', (e) => {
            this.voiceEnabled = e.target.checked;
        });
        document.getElementById('voiceVolume').addEventListener('input', (e) => {
            this.voiceVolume = e.target.value / 100;
        });

        // Location popup
        document.getElementById('closePopup').addEventListener('click', () => this.hideLocationPopup());
        document.getElementById('getDirections').addEventListener('click', () => this.getDirectionsToLocation());
    }

    setupVoice() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
        }
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.handleUserQuery(message);
            input.value = '';
        }
    }

    async handleUserQuery(query) {
        this.addMessage(query, 'user');
        this.showTypingIndicator();

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const response = this.generateAIResponse(query);
        this.hideTypingIndicator();
        this.addMessage(response.text, 'ai');

        if (response.action) {
            this.executeAction(response.action);
        }

        if (this.voiceEnabled) {
            this.speak(response.text);
        }
    }

    generateAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Location-based responses
        if (lowerQuery.includes('bathroom') || lowerQuery.includes('restroom') || lowerQuery.includes('toilet')) {
            const bathrooms = this.venueData.venue.locations.filter(loc => loc.type === 'restroom');
            const nearest = this.findNearestLocation(bathrooms);
            return {
                text: `The nearest restroom is ${nearest.name}. ${nearest.description}`,
                action: { type: 'highlight_location', locationId: nearest.id }
            };
        }

        if (lowerQuery.includes('food') || lowerQuery.includes('eat') || lowerQuery.includes('restaurant')) {
            const foodLocations = this.venueData.venue.locations.filter(loc => loc.type === 'food');
            return {
                text: `I found ${foodLocations.length} food options: ${foodLocations.map(f => f.name).join(', ')}. The main food court is centrally located.`,
                action: { type: 'highlight_locations', locationIds: foodLocations.map(f => f.id) }
            };
        }

        if (lowerQuery.includes('stage') || lowerQuery.includes('presentation') || lowerQuery.includes('event')) {
            const stages = this.venueData.venue.locations.filter(loc => loc.type === 'stage');
            const mainStage = stages.find(s => s.name.includes('Main')) || stages[0];
            return {
                text: `The main stage is located at ${mainStage.name}. ${mainStage.description}`,
                action: { type: 'highlight_location', locationId: mainStage.id }
            };
        }

        if (lowerQuery.includes('parking')) {
            const parking = this.venueData.venue.locations.filter(loc => loc.type === 'parking');
            return {
                text: `Parking is available in two areas: ${parking.map(p => p.name).join(' and ')}. Both are easily accessible from the main entrance.`,
                action: { type: 'highlight_locations', locationIds: parking.map(p => p.id) }
            };
        }

        if (lowerQuery.includes('exit') || lowerQuery.includes('emergency')) {
            const exits = this.venueData.venue.locations.filter(loc => loc.type === 'exit');
            return {
                text: `Emergency exits are located at ${exits.map(e => e.name).join(' and ')}. In case of emergency, proceed to the nearest exit.`,
                action: { type: 'highlight_locations', locationIds: exits.map(e => e.id) }
            };
        }

        if (lowerQuery.includes('charge') || lowerQuery.includes('phone')) {
            const charging = this.venueData.venue.locations.find(loc => loc.type === 'service' && loc.name.includes('Charging'));
            if (charging) {
                return {
                    text: `Phone charging stations are available at ${charging.name}. ${charging.description}`,
                    action: { type: 'highlight_location', locationId: charging.id }
                };
            }
        }

        if (lowerQuery.includes('info') || lowerQuery.includes('help')) {
            const infoDesk = this.venueData.venue.locations.find(loc => loc.type === 'info');
            if (infoDesk) {
                return {
                    text: `The information desk is located at ${infoDesk.name}. ${infoDesk.description}`,
                    action: { type: 'highlight_location', locationId: infoDesk.id }
                };
            }
        }

        if (lowerQuery.includes('time') || lowerQuery.includes('hours') || lowerQuery.includes('close')) {
            return {
                text: `The venue is open ${this.venueData.venue.venue_info.hours}. ${this.venueData.venue.venue_info.emergency}`,
                action: null
            };
        }

        if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
            return {
                text: this.venueData.venue.venue_info.wifi,
                action: null
            };
        }

        // Default response
        return {
            text: "I'm here to help you navigate the venue. You can ask me about locations, directions, or venue information. Try asking about bathrooms, food, stages, parking, or emergency exits.",
            action: null
        };
    }

    findNearestLocation(locations) {
        if (!locations.length) return null;
        
        const currentPos = this.currentLocation.coordinates;
        let nearest = locations[0];
        let minDistance = this.calculateDistance(currentPos, nearest.coordinates);
        
        for (let i = 1; i < locations.length; i++) {
            const distance = this.calculateDistance(currentPos, locations[i].coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = locations[i];
            }
        }
        
        return nearest;
    }

    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    executeAction(action) {
        if (!action) return;

        switch (action.type) {
            case 'highlight_location':
                this.highlightLocation(action.locationId);
                break;
            case 'highlight_locations':
                this.highlightLocations(action.locationIds);
                break;
        }
    }

    highlightLocation(locationId) {
        // Clear previous highlights
        document.querySelectorAll('.location-marker').forEach(marker => {
            marker.classList.remove('highlighted');
        });

        // Highlight the specific location
        const marker = document.querySelector(`[data-location-id="${locationId}"]`);
        if (marker) {
            marker.classList.add('highlighted');
            this.showLocationPopup(locationId);
            this.drawPathToLocation(locationId);
        }
    }

    highlightLocations(locationIds) {
        // Clear previous highlights
        document.querySelectorAll('.location-marker').forEach(marker => {
            marker.classList.remove('highlighted');
        });

        // Highlight all specified locations
        locationIds.forEach(id => {
            const marker = document.querySelector(`[data-location-id="${id}"]`);
            if (marker) {
                marker.classList.add('highlighted');
            }
        });
    }

    drawPathToLocation(locationId) {
        const location = this.venueData.venue.locations.find(loc => loc.id === locationId);
        if (!location) return;

        const svg = document.getElementById('pathOverlay');
        svg.innerHTML = '';

        const currentPos = this.currentLocation.coordinates;
        const targetPos = location.coordinates;

        // Create path line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', currentPos.x);
        line.setAttribute('y1', currentPos.y);
        line.setAttribute('x2', targetPos.x);
        line.setAttribute('y2', targetPos.y);
        line.setAttribute('stroke', '#e74c3c');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('opacity', '0.8');

        // Create arrow
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const angle = Math.atan2(targetPos.y - currentPos.y, targetPos.x - currentPos.x);
        const arrowSize = 10;
        const arrowX = targetPos.x - arrowSize * Math.cos(angle);
        const arrowY = targetPos.y - arrowSize * Math.sin(angle);
        
        arrow.setAttribute('points', `${targetPos.x},${targetPos.y} ${arrowX - arrowSize * Math.cos(angle - Math.PI/6)},${arrowY - arrowSize * Math.sin(angle - Math.PI/6)} ${arrowX - arrowSize * Math.cos(angle + Math.PI/6)},${arrowY - arrowSize * Math.sin(angle + Math.PI/6)}`);
        arrow.setAttribute('fill', '#e74c3c');
        arrow.setAttribute('opacity', '0.8');

        svg.appendChild(line);
        svg.appendChild(arrow);

        // Animate the path
        line.style.strokeDashoffset = '100';
        line.style.transition = 'stroke-dashoffset 2s ease-in-out';
        setTimeout(() => {
            line.style.strokeDashoffset = '0';
        }, 100);
    }

    showLocationPopup(locationId) {
        const location = this.venueData.venue.locations.find(loc => loc.id === locationId);
        if (!location) return;

        const popup = document.getElementById('locationPopup');
        const title = document.getElementById('popupTitle');
        const description = document.getElementById('popupDescription');

        title.textContent = location.name;
        description.textContent = location.description;

        // Position popup near the marker
        const marker = document.querySelector(`[data-location-id="${locationId}"]`);
        if (marker) {
            const rect = marker.getBoundingClientRect();
            const mapRect = document.getElementById('mapWrapper').getBoundingClientRect();
            
            popup.style.left = `${rect.left - mapRect.left + rect.width/2}px`;
            popup.style.top = `${rect.top - mapRect.top - 10}px`;
        }

        popup.classList.add('show');
        this.currentPopupLocation = locationId;
    }

    hideLocationPopup() {
        document.getElementById('locationPopup').classList.remove('show');
        this.currentPopupLocation = null;
    }

    getDirectionsToLocation() {
        if (!this.currentPopupLocation) return;

        const location = this.venueData.venue.locations.find(loc => loc.id === this.currentPopupLocation);
        if (!location) return;

        // Find path in venue data
        const path = this.venueData.venue.paths.find(p => p.to === this.currentPopupLocation);
        let directions = path ? path.directions : `Head towards ${location.name}. It's located at coordinates (${location.coordinates.x}, ${location.coordinates.y}).`;

        this.addMessage(`Directions to ${location.name}: ${directions}`, 'ai');
        this.hideLocationPopup();

        if (this.voiceEnabled) {
            this.speak(`Directions to ${location.name}: ${directions}`);
        }
    }

    renderMap() {
        const markersContainer = document.getElementById('locationMarkers');
        markersContainer.innerHTML = '';

        // Set current location
        const currentLocationEl = document.getElementById('currentLocation');
        currentLocationEl.style.left = `${this.currentLocation.coordinates.x}px`;
        currentLocationEl.style.top = `${this.currentLocation.coordinates.y}px`;

        // Create location markers
        this.venueData.venue.locations.forEach(location => {
            const marker = document.createElement('div');
            marker.className = `location-marker ${location.type}`;
            marker.setAttribute('data-location-id', location.id);
            marker.style.left = `${location.coordinates.x}px`;
            marker.style.top = `${location.coordinates.y}px`;
            
            const icon = document.createElement('i');
            icon.className = location.icon || 'fas fa-map-marker-alt';
            marker.appendChild(icon);

            marker.addEventListener('click', () => {
                this.showLocationPopup(location.id);
            });

            markersContainer.appendChild(marker);
        });
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (type === 'ai') {
            const icon = document.createElement('i');
            icon.className = 'fas fa-robot';
            contentDiv.appendChild(icon);
        }

        const textP = document.createElement('p');
        textP.textContent = text;
        contentDiv.appendChild(textP);

        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'block';
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    speak(text) {
        if (!this.synth || !this.voiceEnabled) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.voiceVolume;
        utterance.rate = 0.9;
        utterance.pitch = 1;

        this.synth.speak(utterance);
    }

    toggleVoiceInput() {
        // Placeholder for voice input functionality
        alert('Voice input feature would be implemented here using Web Speech API');
    }

    zoomIn() {
        this.mapZoom = Math.min(this.mapZoom * 1.2, 3);
        this.updateMapZoom();
    }

    zoomOut() {
        this.mapZoom = Math.max(this.mapZoom / 1.2, 0.5);
        this.updateMapZoom();
    }

    resetView() {
        this.mapZoom = 1;
        this.updateMapZoom();
        this.clearPath();
    }

    updateMapZoom() {
        const mapWrapper = document.getElementById('mapWrapper');
        mapWrapper.style.transform = `scale(${this.mapZoom})`;
    }

    clearPath() {
        document.getElementById('pathOverlay').innerHTML = '';
        document.querySelectorAll('.location-marker').forEach(marker => {
            marker.classList.remove('highlighted');
        });
    }

    toggleLegend() {
        const legend = document.getElementById('mapLegend');
        legend.style.display = legend.style.display === 'none' ? 'block' : 'none';
    }

    showSettings() {
        document.getElementById('settingsModal').classList.add('show');
    }

    hideSettings() {
        document.getElementById('settingsModal').classList.remove('show');
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HoloGuide();
});

// Add some CSS for highlighted markers
const style = document.createElement('style');
style.textContent = `
    .location-marker.highlighted {
        transform: scale(1.3);
        box-shadow: 0 0 20px rgba(231, 76, 60, 0.8);
        z-index: 15;
        animation: highlightPulse 1s ease-in-out infinite alternate;
    }
    
    @keyframes highlightPulse {
        from { box-shadow: 0 0 20px rgba(231, 76, 60, 0.8); }
        to { box-shadow: 0 0 30px rgba(231, 76, 60, 1); }
    }
`;
document.head.appendChild(style);
