import { Discord, Github, Twitter } from '@/components/icons'

export default function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className="flex content-end self-end lg:items-center items-start flex-col gap-6 lg:flex-row justify-between w-full py-3 px-5 mt-10">
      <div>
        <p>
          Built by <span className="text-xl font-bold">RootstockLabs</span>
        </p>
        <p className="text-sm opacity-60">
          Copyright &copy; { year} Rootstock Labs. All rights reserved.
        </p>
      </div>
      <ul className="flex gap-6">
        <a
          href="https://rootstock.io/"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition"
        >
          <li>About RootstockLabs</li>
        </a>
        <a
          href="https://rootstock.io/contact/"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition"
        >
          <li>Help</li>
        </a>
        <a
          href="https://dev.rootstock.io/"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition"
        >
          <li>Documentation</li>
        </a>
      </ul>
      <ul className="flex gap-6">
        <a
          href="https://twitter.com/rootstock_io"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition"
        >
          <li>
            <Twitter />
          </li>
        </a>
        <a
          href="https://github.com/rsksmart"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition"
        >
          <li>
            <Github />
          </li>
        </a>
        <a
          href="https://discord.com/invite/rootstock"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:opacity-80 transition -ml-1"
        >
          <li>
            <Discord />
          </li>
        </a>
      </ul>
    </footer>
  )
}
