import { Discord, Github, Twitter } from '@/components/icons'

export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full mt-10 sm:mt-16 border-t border-zinc-800">
      <div className="w-full px-4 sm:px-6 lg:w-[90%] xl:w-[1300px] mx-auto py-6 sm:py-8 md:py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">

          {/* Brand Section */}
          <div className="space-y-3">
            <div>
              <p className="text-base sm:text-lg">
                Built by <span className="text-xl sm:text-2xl text-black font-bold bg-custom-orange px-1">RootstockLabs</span>
              </p>
            </div>
            <p className="text-xs sm:text-sm opacity-60 leading-relaxed max-w-xs">
              Decentralized governance voting platform powered by Rootstock blockchain
            </p>
            
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold opacity-80 uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.rootstocklabs.com/about-us/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm sm:text-base hover:text-custom-orange transition inline-flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  About RootstockLab
                </a>
              </li>
              <li>
                <a
                  href="https://dev.rootstock.io/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm sm:text-base hover:text-custom-green transition inline-flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://www.rootstocklabs.com/contact/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm sm:text-base hover:text-custom-cyan transition inline-flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Contact & Help
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-semibold opacity-80 uppercase tracking-wide">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/rootstock_io"
                target="_blank"
                rel="noreferrer noopener"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
              <a
                href="https://github.com/rsksmart"
                target="_blank"
                rel="noreferrer noopener"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all hover:scale-110"
                aria-label="GitHub"
              >
                <Github />
              </a>
              <a
                href="https://discord.com/invite/rootstock"
                target="_blank"
                rel="noreferrer noopener"
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-all hover:scale-110"
                aria-label="Discord"
              >
                <Discord />
              </a>
            </div>
            <p className="text-xs opacity-60 mt-4">
              Join our community and stay updated with the latest developments
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-50">
            <p className="text-xs opacity-90">
              Copyright &copy; {year} Rootstock Labs. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              Made with <span className="text-red-500">♥</span> for Hacktivator
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
