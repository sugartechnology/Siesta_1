import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Home from './pages/Home';
import Products from './pages/Products';
import Projects from './pages/Projects';
import ProjectsList from './pages/ProjectsList';
import ProjectDetails from './pages/ProjectDetails';
import SectionDetails from './pages/SectionDetails';
import Catalog from './pages/Catalog';
import SubCategory from './pages/SubCategory';
import Camera from './pages/Camera';
import Photograph from './pages/Photograph';
import RoomType from './pages/RoomType';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects-list" element={<ProjectsList />} />
          <Route path="/project-details" element={<ProjectDetails />} />
          <Route path="/section-details" element={<SectionDetails />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/subcategory" element={<SubCategory />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/photograph" element={<Photograph />} />
          <Route path="/room-type" element={<RoomType />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
