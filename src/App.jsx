import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Customization from 'components/Customization';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { ToolProvider } from 'contexts/ToolContext'; // import your ToolContext provider

import toast, { Toaster } from 'react-hot-toast';
import BarcodeModal from 'sections/apps/tools/toolModal';
// import { FirebaseProvider as AuthProvider } from 'contexts/FirebaseContext';
// import { AWSCognitoProvider as AuthProvider } from 'contexts/AWSCognitoContext';
// import { Auth0Provider as AuthProvider } from 'contexts/Auth0Context';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <RTLLayout>
        <Locales>
          <ScrollTop>
            <AuthProvider>
              <ToolProvider>
                <>
                  <Notistack>
                    <RouterProvider router={router} />
                    <Customization />
                    <Snackbar />
                    <Toaster
                      position="top-right"
                      reverseOrder={false}
                      toastOptions={{
                        style: {
                          backdropFilter: 'blur(8px)',
                          background: 'rgba(255, 77, 77, 0.85)',
                          color: '#fff',
                          fontSize: '15px',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          padding: '14px 18px',
                          fontWeight: 500
                        },
                        success: {
                          style: {
                            background: '#62a522',
                            color: '#fff'
                          }
                        },
                        error: {
                          style: {
                            background: '#93191E',
                            color: '#fff'
                          }
                        },
                        duration: 4000
                      }}
                    />

                    {/* Example trigger
                    <button onClick={() => toast.success('Something went wrong!')} style={{ margin: '2rem', padding: '0.5rem 1rem' }}>
                      Show Modern Error Toast
                    </button> */}
                    <BarcodeModal />
                  </Notistack>
                </>
              </ToolProvider>
            </AuthProvider>
          </ScrollTop>
        </Locales>
      </RTLLayout>
    </ThemeCustomization>
  );
}
