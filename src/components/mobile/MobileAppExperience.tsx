import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MobileAppContainer } from './MobileAppContainer';
import { MobileSplashScreen } from './MobileSplashScreen';
import { MobileLoginScreen } from './MobileLoginScreen';
import { MobileHomeDashboard } from './MobileHomeDashboard';
import { MobileSalesPage } from './MobileSalesPage';
import { MobileGovimithuruDetails } from './MobileGovimithuruDetails';
import { MobileSayuruDetails } from './MobileSayuruDetails';
import { MobileUssdPage } from './MobileUssdPage';
import { MobileVerificationPage } from './MobileVerificationPage';
import { MobileProfilePage } from './MobileProfilePage';
import { MobileSideMenuDrawer } from './MobileSideMenuDrawer';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { Layers, Smartphone } from 'lucide-react';

export type ActiveMobileScreen =
  | 'splash'
  | 'login'
  | 'home'
  | 'sales'
  | 'details_govimithuru'
  | 'details_sayuru'
  | 'ussd'
  | 'verification'
  | 'profile';

export const MobileAppExperience: React.FC = () => {
  const { currentUser } = useAuth();

  // If user is not logged in, default to home/login
  const [currentScreen, setCurrentScreen] = useState<ActiveMobileScreen>(() => {
    return currentUser ? 'home' : 'login';
  });

  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showScreenSwitcher, setShowScreenSwitcher] = useState(false);

  // Sync with auth changes
  React.useEffect(() => {
    if (!currentUser && currentScreen !== 'splash' && currentScreen !== 'login') {
      setCurrentScreen('login');
    }
  }, [currentUser, currentScreen]);

  // Determine current active bottom nav tab
  const getBottomNavTab = (): MobileNavTab => {
    switch (currentScreen) {
      case 'home':
        return 'home';
      case 'sales':
      case 'details_govimithuru':
      case 'details_sayuru':
        return 'sales';
      case 'verification':
        return 'verify';
      default:
        return 'more';
    }
  };

  const handleBottomNavChange = (tab: MobileNavTab) => {
    switch (tab) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'sales':
        setCurrentScreen('sales');
        break;
      case 'verify':
        setCurrentScreen('verification');
        break;
      case 'more':
        setIsSideMenuOpen(true);
        break;
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <MobileSplashScreen onContinue={() => setCurrentScreen(currentUser ? 'home' : 'login')} />;

      case 'login':
        return <MobileLoginScreen onSuccess={() => setCurrentScreen('home')} />;

      case 'home':
        return (
          <MobileHomeDashboard
            onNavigate={(screen) => setCurrentScreen(screen as ActiveMobileScreen)}
            onOpenMenu={() => setIsSideMenuOpen(true)}
          />
        );

      case 'sales':
        return (
          <MobileSalesPage
            onBack={() => setCurrentScreen('home')}
            onSelectService={(service) => {
              if (service === 'govimithuru') setCurrentScreen('details_govimithuru');
              if (service === 'sayuru') setCurrentScreen('details_sayuru');
            }}
          />
        );

      case 'details_govimithuru':
        return (
          <MobileGovimithuruDetails
            onBack={() => setCurrentScreen('sales')}
            onActivated={() => setCurrentScreen('sales')}
          />
        );

      case 'details_sayuru':
        return (
          <MobileSayuruDetails
            onBack={() => setCurrentScreen('sales')}
            onActivated={() => setCurrentScreen('sales')}
          />
        );

      case 'ussd':
        return <MobileUssdPage onBack={() => setCurrentScreen('home')} />;

      case 'verification':
        return <MobileVerificationPage onBack={() => setCurrentScreen('home')} />;

      case 'profile':
        return <MobileProfilePage onBack={() => setCurrentScreen('home')} />;

      default:
        return (
          <MobileHomeDashboard
            onNavigate={(screen) => setCurrentScreen(screen as ActiveMobileScreen)}
            onOpenMenu={() => setIsSideMenuOpen(true)}
          />
        );
    }
  };

  const showBottomNav =
    currentScreen !== 'splash' &&
    currentScreen !== 'login';

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Screen Switcher Bar (Quickly test all 10 mockup screens directly) */}
      <div className="w-full max-w-2xl px-4 py-2 flex items-center justify-between z-40 text-xs">
        <button
          onClick={() => setShowScreenSwitcher(!showScreenSwitcher)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-800 shadow-md transition font-bold"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Mockup Screens: {currentScreen.replace('_', ' ').toUpperCase()}</span>
        </button>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          D.D. WORLD Mobile Experience v2.0
        </span>
      </div>

      {showScreenSwitcher && (
        <div className="w-full max-w-2xl px-4 mb-3 z-40 animate-fade-in">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Direct Screen Preview (10 Mockup Screens):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-bold">
              {[
                { id: 'splash', label: '1. Splash' },
                { id: 'login', label: '2. Login' },
                { id: 'home', label: '3. Home' },
                { id: 'sales', label: '4. Sales' },
                { id: 'details_govimithuru', label: '5. Govimithuru' },
                { id: 'details_sayuru', label: '6. Sayuru' },
                { id: 'ussd', label: '7. USSD' },
                { id: 'verification', label: '8. Verify' },
                { id: 'profile', label: '9. Profile' },
                { id: 'drawer', label: '10. Side Menu' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.id === 'drawer') {
                      setIsSideMenuOpen(true);
                    } else {
                      setCurrentScreen(s.id as ActiveMobileScreen);
                    }
                    setShowScreenSwitcher(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-center transition truncate ${
                    currentScreen === s.id
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <MobileAppContainer>
        {/* Rendered Screen View */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {renderScreen()}
        </div>

        {/* Bottom Navigation Bar */}
        {showBottomNav && (
          <MobileBottomNav
            activeTab={getBottomNavTab()}
            onTabChange={handleBottomNavChange}
            onMoreClick={() => setIsSideMenuOpen(true)}
          />
        )}

        {/* Side Menu Drawer (Dark Mode Screen 10) */}
        <MobileSideMenuDrawer
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
          activeItem={currentScreen}
          onSelect={(item) => {
            if (item === 'home') setCurrentScreen('home');
            else if (item === 'sales') setCurrentScreen('sales');
            else if (item === 'verification') setCurrentScreen('verification');
            else if (item === 'ussd') setCurrentScreen('ussd');
            else if (item === 'profile') setCurrentScreen('profile');
            else if (item === 'settings') setCurrentScreen('profile');
            else if (item === 'help') setCurrentScreen('profile');
          }}
        />
      </MobileAppContainer>
    </div>
  );
};
