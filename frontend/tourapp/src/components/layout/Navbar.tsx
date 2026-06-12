import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import './Navbar.css';

export function Navbar() {
  const { isAuthenticated, isGuide, isTourist, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">TourApp</Link>
      <div className="navbar__links">
        {!isAuthenticated && <>
          <NavLink to="/tours">Explore Tours</NavLink>
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>}

        {isTourist && <>
          <NavLink to="/tours">Tours</NavLink>
          <NavLink to="/blogs">Blogs</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/simulator">Simulator</NavLink>
          <NavLink to="/execution">Execution</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>}

        {isGuide && <>
          <NavLink to="/my-tours">My Tours</NavLink>
          <NavLink to="/blogs">Blogs</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>}

        {isAdmin && <>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </>}

        {isAuthenticated && (
          <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
        )}
      </div>
    </nav>
  );
}
