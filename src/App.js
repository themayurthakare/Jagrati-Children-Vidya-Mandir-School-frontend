import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import Navbar from "./Componant/Subcomponant/Navbar";
import Footer from "./Componant/Subcomponant/Footer";

// Pages
import Home from "./Componant/pages/1.Home";
import About from "./Componant/pages/2.About";
import Academics from "./Componant/pages/3.Academics";
import Admission from "./Componant/pages/4.Admission";
import Contact from "./Componant/pages/6.Contact";
import Gallery from "./Componant/pages/Gallary";
import Sports from "./Componant/pages/Sports";
import ArtCraft from "./Componant/pages/ArtCraft";
import MusicDance from "./Componant/pages/MusicDance";
import Login from "./Componant/pages/Login";
import StudentDashboard from "./Componant/pages/StudentDashboard";
import AdminDashboard from "./Componant/pages/AdminDashboard";
import TeacherDashboard from "./Componant/pages/TeacherDashboard";
import ComputerOperatorDashboard from "./Componant/pages/ComputerOperatorDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />{" "}
            <Route path="/about" element={<About />} />{" "}
            <Route path="/academics" element={<Academics />} />{" "}
            <Route path="/admission" element={<Admission />} />{" "}
            <Route path="/contact" element={<Contact />} />{" "}
            <Route path="/gallery" element={<Gallery />} />{" "}
            <Route path="/sports" element={<Sports />} />{" "}
            <Route path="/artcraft" element={<ArtCraft />} />{" "}
            <Route path="/musicdance" element={<MusicDance />} />{" "}
            <Route path="/login" element={<Login />} />
            <Route path="/admindashboard/*" element={<AdminDashboard />} />
            <Route path="/user-dashboard/*" element={<StudentDashboard />} />
            <Route path="/teacherdashboard/*" element={<TeacherDashboard />} />
            <Route
              path="/computeroperator/*"
              element={<ComputerOperatorDashboard />}
            />
          </Routes>{" "}
        </div>
        {/* Footer placed correctly outside Routes */} <Footer />
      </BrowserRouter>{" "}
    </>
  );
}

export default App;
