import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X, MessageSquare, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const MenuBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      name: 'Chat Section', 
      icon: MessageSquare,
      to: '/chat',
      description: 'Chat with your contacts'
    },
    { 
      name: 'Safe Route', 
      icon: MapPin,
      to: '/safe-route',
      description: 'Find the safest route'
    }
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <Menu.Button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white bg-opacity-80 shadow-lg hover:bg-opacity-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-800" />
              ) : (
                <MenuIcon className="w-6 h-6 text-gray-800" />
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                <div className="p-1">
                  {menuItems.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          to={item.to}
                          className={`${
                            active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                          } group flex w-full items-center rounded-lg p-3 text-sm transition-colors`}
                        >
                          <item.icon 
                            className={`mr-3 h-5 w-5 ${
                              active ? 'text-blue-500' : 'text-gray-400'
                            }`} 
                          />
                          <div className="text-left">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default MenuBar;
