'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Stack,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from '@mui/material';
import { X } from 'lucide-react';
import { REPORT_CATEGORIES, ReportCategory } from '@/lib/safetyService';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  category: ReportCategory;
  onCategoryChange: (category: ReportCategory) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  userName?: string;
}

export default function ReportModal({
  open,
  onClose,
  onSubmit,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  userName
}: ReportModalProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        } 
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Report User
          </Typography>
          {userName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Report {userName} for inappropriate behavior
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <X size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Box>
            <FormLabel 
              component="legend" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary', 
                mb: 1.5,
                fontSize: '0.95rem'
              }}
            >
              Category
            </FormLabel>
            <RadioGroup
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as ReportCategory)}
            >
              {REPORT_CATEGORIES.map((cat) => (
                <FormControlLabel 
                  key={cat.value} 
                  value={cat.value} 
                  control={<Radio />} 
                  label={cat.label}
                  sx={{ 
                    py: 0.5, 
                    px: 1.5, 
                    border: '1px solid', 
                    borderColor: category === cat.value ? 'primary.main' : 'grey.200', 
                    borderRadius: 3, 
                    mb: 1,
                    bgcolor: category === cat.value ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: category === cat.value ? 'rgba(102, 126, 234, 0.08)' : 'grey.50',
                      borderColor: category === cat.value ? 'primary.main' : 'grey.300'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </Box>
          
          <Box>
            <FormLabel 
              component="legend" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'text.primary', 
                mb: 1.5,
                fontSize: '0.95rem'
              }}
            >
              Additional Details
            </FormLabel>
            <TextField
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Please provide more details about the issue..."
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 3,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'grey.400'
                    }
                  }
                } 
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onSubmit}
          sx={{ 
            py: 1.5, 
            borderRadius: 3, 
            fontWeight: 'bold', 
            textTransform: 'none',
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
              boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
            }
          }}
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
