import { Link } from 'wouter'
import { useLogo } from '../hooks/useLogo'

export default function Header() {
  const { logoUrl } = useLogo()

  return (
    <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur border-b border-gray-700">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 font-semibold">
            <img src={logoUrl} alt="Minisúper El Ventolero" className="w-8 h-8" />
            Minisúper El Ventolero
          </a>
        </Link>
        <div className="text-sm text-gray-500">Catálogo público</div>
      </div>
    </header>
  )
}