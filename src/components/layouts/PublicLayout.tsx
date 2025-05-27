import { Box, keyframes } from '@mui/material';
import type { ReactNode } from 'react';
import PublicHeader from '../PublicHeader';
import Footer from '../Footer';

interface PublicLayoutProps {
  children: ReactNode;
}

const gradientAnimation = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

const floatingAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(-45deg, #ffffff, #fff5e6)',
        backgroundSize: '400% 400%',
        animation: `${gradientAnimation} 15s ease infinite`,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          animation: `${floatingAnimation} 6s ease-in-out infinite`,
        },
        '&::before': {
          top: '10%',
          left: '10%',
          animationDelay: '-2s',
        },
        '&::after': {
          bottom: '10%',
          right: '10%',
          width: '80px',
          height: '80px',
          animationDelay: '-1s',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '25%',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          animation: `${floatingAnimation} 8s ease-in-out infinite`,
          animationDelay: '-3s',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          animation: `${floatingAnimation} 7s ease-in-out infinite`,
          animationDelay: '-4s',
        }}
      />

      <PublicHeader />

      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          '& > *': {
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }
        }}
      >
        {children}
      </Box>

      <Footer />
    </Box>
  );
};

export default PublicLayout;
