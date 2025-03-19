"use client";

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCar, faTruck } from '@fortawesome/free-solid-svg-icons';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <nav className={`bg-gray-800 text-white ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-4">
          {isCollapsed ? '>' : '<'}
        </button>
        <ul className="mt-4">
          <li className="p-4 flex items-center">
            <FontAwesomeIcon icon={faUsers} />
            {/* Use the Next.js Link for navigation */}
            {!isCollapsed && (
              <Link href="/client" className="ml-4 hover:underline">
                Clients
              </Link>
            )}
          </li>
          <li className="p-4 flex items-center">
            <FontAwesomeIcon icon={faCar} />
            {!isCollapsed && <span className="ml-4">Véhicules</span>}
          </li>
          <li className="p-4 flex items-center">
            <FontAwesomeIcon icon={faTruck} />
            {!isCollapsed && <span className="ml-4">Fournisseurs</span>}
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-200 p-4">
          <nav>
            <ol className="list-reset flex text-gray-700">
              <li>Client</li>
              <li className="mx-2">/</li>
              <li>Tous les clients</li>
              <li className="mx-2">/</li>
              <li>Nom du client</li>
            </ol>
          </nav>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
