import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo = ({ size = 'medium' }: LogoProps) => {
  const logoHeight = {
    small: 24,
    medium: 32,
    large: 48,
  };

  const fontSize = {
    small: 'body1',
    medium: 'h6',
    large: 'h5',
  } as const;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img src='/assets/cat-logo.svg' alt='EduCat' style={{ height: logoHeight[size] }} />
      <Typography variant={fontSize[size]} fontWeight={700} color='primary'>
        EduCat
      </Typography>
    </Box>
  );
};

export default Logo;
