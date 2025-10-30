import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import ProjectsList from "./pages/ProjectsList";
import ProjectDetails from "./pages/ProjectDetails";
import SectionDetails from "./pages/SectionDetails";
import Catalog from "./pages/Catalog";
import SubCategory from "./pages/SubCategory";
import Camera from "./pages/Camera";
import Photograph from "./pages/Photograph";
import RoomType from "./pages/RoomType";
import TopMenu from "./components/TopMenu";
import "./App.css";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Login />;
  //return children;
}

function NotFound() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">404</h1>
      <p>Aradığın sayfa bulunamadı.</p>
    </div>
  );
}

function AppChrome() {
  const { user } = useAuth();
  return (
    <div className="App">
      {user && <TopMenu />}
      {/*<TopMenu />*/}
      <div className="app-content">
        <AppRoutes />
      </div>
    </div>
  );
}

function AppRoutes() {
  const privateRoutes = [
    { path: "/home", element: <Home /> },

    { path: "/products", element: <Products /> },

    { path: "/projects", element: <Projects /> },
    { path: "/projects-list", element: <ProjectsList /> },

    { path: "/projects-details/:id", element: <ProjectDetails /> },
    { path: "/projects-details", element: <ProjectDetails /> },

    { path: "/section-details", element: <SectionDetails /> },
    { path: "/section-details/:id", element: <SectionDetails /> },

    { path: "/collections", element: <Catalog /> },
    { path: "/catalog", element: <Catalog /> },

    { path: "/subcategory", element: <SubCategory /> },
    { path: "/camera", element: <Camera /> },
    { path: "/photograph", element: <Photograph /> },
    { path: "/room-type", element: <RoomType /> },
  ];

  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/login" element={<Login />} />
      {privateRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<PrivateRoute>{element}</PrivateRoute>}
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppChrome />
      </AuthProvider>
    </Router>
  );
}
