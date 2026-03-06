// ito naman yung once you open ito yung lalabas ng URL ng  Website mo


import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/marketplace');
}
