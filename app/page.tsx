// ito naman yung once you open ito yung lalabas ng URL ng  Website mo


import { redirect } from 'next/navigation';


// ito yung redirect URL 
export default function HomePage() {
  redirect('/marketplace');
}
