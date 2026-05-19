import Link from "next/link";
import Image from "next/image";
import { ContenedorPagina } from "@/components/contenedor-pagina";

export const metadata = {
  title: "Autoridades",
  description: "Autoridades de la Federación Argentina de Bowls",
};

const autoridades = [
  { cargo: "Presidente", nombres: ["Sebastián Sánchez Keenan"] },
  { cargo: "Vicepresidente", nombres: ["Anabel Didlaukis"] },
  { cargo: "Secretaria", nombres: ["Elena Álvarez Indart"] },
  { cargo: "Tesorero", nombres: ["Ignacio Ramiro Giacchino"] },
  {
    cargo: "Vocales titulares",
    nombres: [
      "Javier García Lepre",
      "Haydee Carmen Rodríguez",
      "Guillermo Sesarego",
      "Jorge Barreto",
      "Mario Eduardo Rago",
      "Marta Gesualdo",
    ],
  },
  {
    cargo: "Vocales suplentes",
    nombres: [
      "Patricia Cervi",
      "María José Tombeur",
      "Lucila Bausili",
      "Virginia Bianco",
      "Raúl Pollet",
    ],
  },
  {
    cargo: "Revisores de cuentas titulares",
    nombres: ["Rodolfo Müller", "Alberto Maratea"],
  },
  {
    cargo: "Revisores de cuentas suplentes",
    nombres: ["Lautaro Ferreira", "Roberto Castro"],
  },
];

export default function AutoridadesPage() {
  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Autoridades</span>
      </nav>

      <header className="mt-6 flex flex-col items-center gap-4 border-b border-stone-200 pb-8 text-center sm:flex-row sm:text-left">
        <Image
          src="/logo-federacion.png"
          alt="Federación Argentina de Bowls"
          width={80}
          height={80}
          className="rounded-full bg-white shadow-sm"
          priority
        />
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Autoridades</h1>
          <p className="mt-2 text-base text-stone-600">
            Federación Argentina de Bowls
          </p>
        </div>
      </header>

      <ul className="mt-10 max-w-2xl space-y-8">
        {autoridades.map((item) => (
          <li key={item.cargo}>
            <h2 className="text-base font-semibold text-emerald-950">{item.cargo}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-stone-800">
              {item.nombres.map((nombre) => (
                <li key={nombre}>{nombre}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-stone-500">
        <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
          Ver torneos publicados
        </Link>
      </p>
    </ContenedorPagina>
  );
}
