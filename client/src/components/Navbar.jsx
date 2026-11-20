
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="brand">
        <span className="brand-icon">♥</span>
        <span>Sweety</span>
      </div>

      <div className="nav-right">
        <span className="welcome">
          {user?.name ? `Hi, ${user.name}` : "Welcome"}
        </span>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
