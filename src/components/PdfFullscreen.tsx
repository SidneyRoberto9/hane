'use client';

import SimpleBar from 'simplebar-react';
import { useResizeDetector } from 'react-resize-detector';
import { Page, Document } from 'react-pdf';
import { useState } from 'react';
import { Loader2, Expand } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { DialogTrigger, DialogContent, Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PdfFullscreenProps {
  fileUrl: string;
}

export function PdfFullscreen({ fileUrl }: PdfFullscreenProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();

  const { toast } = useToast();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(d) => {
        if (!d) {
          setIsOpen(d);
        }
      }}>
      <DialogTrigger asChild>
        <Button
          aria-label="fullscreen"
          variant={'ghost'}
          className="gap-1.5"
          onClick={() => setIsOpen(true)}>
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-ful">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 w-6 h-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Erro loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="max-h-full"
              file={fileUrl}>
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}
