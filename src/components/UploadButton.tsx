'use client';

import { useState } from 'react';

import { DialogTrigger, DialogContent, Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function UploadButton() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(b) => {
        if (!b) {
          setIsOpen(b);
        }
      }}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Upload PDF</h1>

          <input
            type="file"
            className="w-full"
            onChange={(e) => {
              console.log(e.target.files);
            }}
          />

          <Button
            onClick={() => {
              setIsOpen(false);
            }}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
