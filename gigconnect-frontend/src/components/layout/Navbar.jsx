import { Link } from "react-router-dom";

const Navbar = ({ children }) => {
  return (
    <>
      <nav className="bg-secondary text-white px-8 py-4 flex justify-between items-center shadow-lg fixed w-full z-50">
        <div className="text-2xl font-extrabold tracking-wide text-accent">
          GigConnect
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link className="hover:text-accent transition" to="/">Home</Link>
          <Link className="hover:text-accent transition" to="/gigs">Gigs</Link>
          <Link className="hover:text-accent transition" to="/freelancers">Freelancers</Link>
        </div>

        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent hover:text-secondary transition">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-accent text-secondary font-semibold rounded-lg hover:opacity-90 transition">Sign Up</Link>
        </div>
      </nav>

      {/* Adjust padding-top to navbar height */}
      <main className="pt-16">
        {children}
      </main>
    </>
  );
};


export default Navbar;
