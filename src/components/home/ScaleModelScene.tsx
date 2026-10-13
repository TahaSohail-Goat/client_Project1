import { Link } from 'react-router-dom';
import { media } from '../../content/media';
import { PhotoImage } from '../PhotoImage';
import { Reveal } from '../Reveal';
export function ScaleModelScene() {
  return <section className="section-pad model-section" aria-labelledby="model-title"><Reveal className="section-heading"><div><p className="eyebrow">06 / Concept to form</p><h2 id="model-title">Ideas you<br /><em>can hold.</em></h2></div><p className="heading-note">Physical model studies.<br />Three photographs, three perspectives.</p></Reveal><div className="model-grid">{media.filter(item => item.category === 'Model Studies').map((item, i) => <Link key={item.slug} to={`/work?category=Model+Studies&photo=${item.slug}`}><PhotoImage item={item} sizes="(min-width:768px) 30vw, 100vw" /><p className="image-meta">0{i + 1} / {item.title}</p></Link>)}</div></section>;
}
