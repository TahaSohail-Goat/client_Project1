import { Link } from 'react-router-dom';
import { site } from '../../content/site';
export function Footer() {
  return <footer className="footer"><Link className="footer-brand" to="/">{site.name}</Link><p>Architecture & Interior Design</p><div><Link to="/work">Explore work</Link><Link to="/contact">Contact</Link><a href="#main">Back to top ↑</a></div><small>Studio preview · Brand & editorial copy pending approval</small></footer>;
}
