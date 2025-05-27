import { Container, Paper } from '@mui/material';
import type { ReactNode } from 'react';

interface FormContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const FormContainer = ({ children, maxWidth = 'xs' }: FormContainerProps) => {
  return (
    <Container
      component='main'
      maxWidth={maxWidth}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};

export default FormContainer;
