import React from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const CreateChoiceDialog = ({ open, setOpen, onPostSelect, onReelSelect }) => {
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`sm:max-w-md ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
        <DialogHeader className="text-center">Create New</DialogHeader>
        <div className="flex flex-col gap-4 p-4">
          <Button 
            onClick={() => {
              setOpen(false);
              onPostSelect();
            }}
            className="w-full"
          >
            Create Post
          </Button>
          <Button 
            onClick={() => {
              setOpen(false);
              onReelSelect();
            }}
            className={`w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : ''}`}
            variant="outline"
          >
            Create Reel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChoiceDialog;