# Siesta AI - Interior Design Application

A modern React.js application for designing spaces with AI assistance. This application allows users to create projects, browse furniture catalogs, and design room spaces.

## Features

- **Splash Screen**: Beautiful animated introduction to the app
- **Home Page**: Two main sections for Projects and Catalog
- **Projects Management**: Create and manage interior design projects
- **Catalog**: Browse furniture categories (Garden, Rattan, Contract)
- **Products**: View and search through Siesta product collections
- **Room Type Selection**: Choose from various room types (Balcony, Garden, Pool, etc.)
- **Camera/Upload**: Upload photos or select sample rooms for AI-powered design
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Bottom Navigation**: Easy navigation between main sections

## Technologies Used

- React 18.2.0
- React Router DOM 6.20.0
- Modern CSS with animations and transitions
- Responsive design with CSS Grid and Flexbox

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Siesta_1
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Siesta_1/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Menu.js/css           # Bottom navigation menu
│   │   ├── ProductCard.js/css    # Product display card
│   │   ├── ProjectCard.js/css    # Project display card
│   │   └── SearchBar.js/css      # Search input component
│   ├── pages/
│   │   ├── SplashScreen.js/css   # Initial loading screen
│   │   ├── Home.js/css           # Main landing page
│   │   ├── Projects.js/css       # Projects listing page
│   │   ├── Catalog.js/css        # Category selection
│   │   ├── Products.js/css       # Product listing
│   │   ├── RoomType.js/css       # Room type selection
│   │   └── Camera.js/css         # Photo upload/selection
│   ├── App.js                    # Main app component with routing
│   ├── App.css                   # Global styles
│   └── index.css                 # Root styles
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Key Pages

### 1. Splash Screen
Animated introduction screen with the Siesta AI branding that appears for 3 seconds on app load.

### 2. Home
Two large hero sections:
- **Projects**: Create and manage design projects
- **Catalog**: Browse Siesta's furniture collection

### 3. Projects
- Create new projects
- View recent projects
- Search and filter projects
- Each project shows name and type (Garden, Rattan, Contract)

### 4. Catalog
Three main categories displayed as large cards:
- Garden
- Rattan
- Contract

### 5. Products
- Browse furniture products
- Filter by category (Armchair, Chair, Table, Sofa)
- Search functionality
- Additional filters (Color, Material, Size, Price)
- Add to cart functionality

### 6. Room Type Selection
Choose from 8 different room types:
- Balcony, Garden, Pool, Gazebo
- Rattan, Restaurant, Cafe, Picnic

### 7. Camera/Upload
- Upload room photos for AI design
- Select from sample rooms
- Skip to browse products directly

## Design System

### Colors
- Primary: `#8B7355` (Brown/Tan)
- Secondary: `#6f5a43` (Dark Brown)
- Accent: `#D4AF37` (Gold)
- Background: `#fafafa` (Light Gray)
- Text: `#1a1a1a` (Near Black)

### Typography
- Font Family: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- Headings: 700 weight
- Body: 400-600 weight

### Components
- Border Radius: 8px - 25px for rounded elements
- Shadows: Used for depth and hover effects
- Transitions: 0.3s ease for smooth interactions

## Navigation Flow

```
Splash Screen (3s) → Home
                      ├── Projects → Room Type → Camera → Products
                      └── Catalog → Products

Bottom Menu: Home | Projects | Catalog | Products | Profile
```

## Customization

### Adding New Products
Edit the `products` array in `src/pages/Products.js`:
```javascript
const products = [
  { id: 1, code: '220', name: 'Product Name', price: '39.99', bgColor: '#f5f1ed' },
  // Add more products...
];
```

### Adding New Room Types
Edit the `roomTypes` array in `src/pages/RoomType.js`:
```javascript
const roomTypes = [
  { id: 1, name: 'Room Name', icon: '🏠' },
  // Add more room types...
];
```

### Changing Theme Colors
Update colors in `src/App.css` and individual component CSS files.

## Future Enhancements

- User authentication and profiles
- Shopping cart functionality
- AI-powered room design integration
- Product detail pages
- Project collaboration features
- Save and share designs
- Payment integration
- Real-time 3D visualization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the development team.



