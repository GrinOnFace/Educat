import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Description as FileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { lessonService } from '../services/lessonService';
import type { LessonAttachment } from '../services/lessonService';

interface LessonMaterialsProps {
  lessonId: number;
  teacherId?: number; // если не указан, значит пользователь - студент
}

export const LessonMaterials = ({ lessonId, teacherId }: LessonMaterialsProps) => {
  const [materials, setMaterials] = useState<LessonAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await lessonService.getLessonAttachments(lessonId);
      setMaterials(data);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить материалы урока');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [lessonId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !teacherId) return;

    try {
      setUploading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Content = e.target?.result?.toString().split(',')[1];
        if (!base64Content) return;

        const uploadData = {
          fileName: file.name,
          fileType: file.type,
          base64Content: base64Content,
        };

        await lessonService.uploadAttachment(lessonId, teacherId, uploadData);
        await fetchMaterials();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Не удалось загрузить файл');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (material: LessonAttachment) => {
    const link = document.createElement('a');
    link.href = `data:${material.fileType};base64,${material.base64Content}`;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (materialId: number) => {
    if (!teacherId) return;

    try {
      setError(null);
      await lessonService.deleteAttachment(lessonId, materialId);
      await fetchMaterials();
    } catch (err) {
      setError('Не удалось удалить файл');
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Материалы урока</Typography>
        {teacherId && (
            <Button
            component="label"
            variant="contained"
            startIcon={<UploadIcon />}
            disabled={uploading}
            >
            {uploading ? 'Загрузка...' : 'Загрузить файл'}
            <input
                type="file"
                hidden
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
            />
            </Button>
        )}
        </Box>

        {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
            {error}
        </Alert>
        )}

        {materials.length === 0 ? (
        <Typography color="text.secondary" align="center">
            Материалы пока не добавлены
        </Typography>
        ) : (
        <List>
            {materials.map((material) => (
            <ListItem key={material.id}>
                <ListItemIcon>
                <FileIcon />
                </ListItemIcon>
                <ListItemText
                primary={material.fileName}
                secondary={formatFileSize(material.size)}
                />
                <ListItemSecondaryAction>
                <IconButton onClick={() => handleDownload(material)}>
                    <DownloadIcon />
                </IconButton>
                {teacherId && (
                    <IconButton onClick={() => handleDelete(material.id)} color="error">
                    </IconButton>
                )}
                </ListItemSecondaryAction>
            </ListItem>
            ))}
        </List>
        )}
    </>
  );
}; 