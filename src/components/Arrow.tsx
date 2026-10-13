export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg className="arrow" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M3 12h17M13 5l7 7-7 7'} stroke="currentColor" strokeWidth="1.2" /></svg>;
}
