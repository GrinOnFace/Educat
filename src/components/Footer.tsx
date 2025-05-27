import { Box, Container, Link, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component='footer'
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'transparent',
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Container maxWidth='lg'>
        <Typography variant='body2' color='text.secondary' align='center'>
          © 2025 - EduCat - Платформа для онлайн-обучения
          <Box component='span' sx={{ mx: 1 }}>
            |
          </Box>
          <Link href='#' color='inherit' underline='hover'>
            О проекте
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
